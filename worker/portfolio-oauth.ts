import { timingSafeEqual } from "node:crypto";
import {
  AuthorizationError,
  insufficientScope,
  type OAuthHelpers,
  OAuthProvider,
  type OAuthResourceContext,
} from "@cloudflare/workers-oauth-provider";
import type { ExecutionContext, KVNamespace } from "@cloudflare/workers-types";
import { isOwnerEmail } from "../src/lib/admin";

export interface PortfolioEnv {
  OAUTH_PROVIDER?: OAuthHelpers;
  OAUTH_KV: KVNamespace;
  PORTFOLIO_MCP_TOKEN?: string;
  NEXT_PUBLIC_CONVEX_SITE_URL?: string;
}

function convexUrl(env: PortfolioEnv, path: string) {
  const site =
    env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!site) throw new Error("Missing Convex HTTP actions URL");
  return new URL(path, site);
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function owner(
  req: Request,
  env: PortfolioEnv,
): Promise<string | Response> {
  const url = new URL(req.url);
  if (req.method !== "GET" && req.method !== "POST")
    return new Response(null, { status: 405 });
  if (req.method === "POST" && req.headers.get("Origin") !== url.origin)
    return new Response(null, { status: 403 });
  const session = await fetch(
    convexUrl(env, "/api/auth/get-session?disableCookieCache=true"),
    {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      redirect: "manual",
    },
  );
  if (!session.ok)
    return new Response("Session check unavailable", { status: 503 });
  const identity = await session.json();
  if (!identity?.user) {
    if (req.method === "POST")
      return new Response("Sign in again", { status: 401 });
    const login = new URL("/sign-in", url);
    if (url.pathname === "/admin/mcp") login.searchParams.set("manage", "mcp");
    else login.searchParams.set("authorize", url.searchParams.toString());
    return Response.redirect(login, 303);
  }
  if (!isOwnerEmail(identity.user.email))
    return new Response("Owner access required", { status: 403 });
  return identity.user.id;
}

async function authorize(req: Request, env: PortfolioEnv, oauth: OAuthHelpers) {
  const userId = await owner(req, env);
  if (userId instanceof Response) return userId;
  try {
    if (req.method === "GET") {
      const request = await oauth.parseAuthRequest(req);
      const details = await oauth.describeConsent(request);
      const consent = await oauth.beginConsent(request);
      consent.headers.set("Content-Type", "text/html; charset=utf-8");
      consent.headers.set("Cache-Control", "no-store");
      consent.headers.set("Referrer-Policy", "no-referrer");
      return new Response(
        `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Portfolio access</title>
<main><h1>Allow ${escapeHtml(details.clientName)} to access your portfolio?</h1>
<p>The client can read all portfolio records and update resumes, cover letters, and jobs. Vouches and guestbook entries are read-only.</p>
<p>Check the return address: <code>${escapeHtml(request.redirectUri)}</code>. The client supplied its name.</p>
<form method="post"><input type="hidden" name="handle" value="${escapeHtml(consent.handle)}"><button name="decision" value="deny">Cancel</button> <button name="decision" value="allow">Allow access</button></form></main></html>`,
        { headers: consent.headers },
      );
    }
    const form = await req.formData();
    const handle = String(form.get("handle"));
    if (form.get("decision") !== "allow") {
      const denied = await oauth.denyConsent(req, handle);
      return new Response(null, { status: 303, headers: denied.headers });
    }
    const approved = await oauth.approveConsent(req, handle);
    const { redirectTo } = await oauth.completeAuthorization({
      request: approved.request,
      userId,
      revokeExistingGrants: false,
      metadata: {
        clientName: (await oauth.describeConsent(approved.request)).clientName,
      },
      scope: [
        "portfolio",
        ...approved.request.scope.filter((scope) => scope === "offline_access"),
      ],
      props: { portfolio: true },
    });
    approved.headers.set("Location", redirectTo);
    return new Response(null, { status: 303, headers: approved.headers });
  } catch (error) {
    if (!(error instanceof AuthorizationError)) throw error;
    return error.redirectTo
      ? Response.redirect(error.redirectTo, 303)
      : new Response(error.description, { status: 400 });
  }
}

async function manage(req: Request, env: PortfolioEnv, oauth: OAuthHelpers) {
  const userId = await owner(req, env);
  if (userId instanceof Response) return userId;
  const url = new URL(req.url);
  if (req.method === "POST") {
    const id = (await req.formData()).get("grant");
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id))
      return new Response("Invalid grant ID", { status: 400 });
    await oauth.revokeGrant(id, userId);
    return Response.redirect(new URL("/admin/mcp", url), 303);
  }
  const page = await oauth.listUserGrants(userId, {
    limit: 25,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });
  const items = page.items.map((grant) => {
    const name =
      typeof grant.metadata?.clientName === "string"
        ? grant.metadata.clientName
        : grant.clientId;
    const date = new Date(grant.createdAt * 1000).toISOString();
    return `<li><h2>${escapeHtml(name)}</h2><p>${escapeHtml(grant.redirectUri ?? grant.clientId)}</p><p>Authorized ${date} · ${escapeHtml(grant.id.slice(-8))}</p><form method="post"><button name="grant" value="${escapeHtml(grant.id)}">Revoke access</button></form></li>`;
  });
  const more = page.cursor
    ? `<a href="?cursor=${encodeURIComponent(page.cursor)}">Next page</a>`
    : "";
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>MCP authorizations</title><main><a href="/">Home</a><h1>MCP authorizations</h1>${items.length ? `<ul>${items.join("")}</ul>` : "<p>No OAuth authorizations.</p>"}${more}</main></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}

async function forward(request: Request, env: PortfolioEnv) {
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (!env.PORTFOLIO_MCP_TOKEN)
    return new Response("MCP connection unavailable", { status: 503 });
  const headers = new Headers({
    Authorization: `Bearer ${env.PORTFOLIO_MCP_TOKEN}`,
  });
  for (const name of ["accept", "content-type", "mcp-protocol-version"]) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers,
    body: request.body,
    duplex: "half",
    redirect: "manual",
  };
  const upstream = await fetch(convexUrl(env, "/mcp"), init);
  if (upstream.status >= 300 && upstream.status < 400)
    return new Response("Unexpected upstream redirect", { status: 502 });
  const response = new Response(upstream.body, upstream);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function portfolioRequest(
  req: Request,
  env: PortfolioEnv,
  ctx: ExecutionContext,
) {
  const { pathname, origin, hostname } = new URL(req.url);
  if (
    pathname !== "/mcp" &&
    pathname !== "/admin/mcp" &&
    !pathname.startsWith("/.well-known/oauth-") &&
    !pathname.startsWith("/oauth/")
  )
    return null;
  if (!["hackr.sh", "localhost", "127.0.0.1"].includes(hostname))
    return new Response("Unknown host", { status: 403 });
  if (pathname === "/mcp") {
    const from = req.headers.get("origin");
    if (from && from !== origin) return new Response(null, { status: 403 });
    const actual = Buffer.from(req.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${env.PORTFOLIO_MCP_TOKEN}`);
    if (
      env.PORTFOLIO_MCP_TOKEN &&
      actual.length === expected.length &&
      timingSafeEqual(actual, expected)
    )
      return forward(req, env);
  }
  const provider = new OAuthProvider<PortfolioEnv>({
    apiRoute: "/mcp",
    apiHandler: {
      fetch: (
        request: Request,
        bindings: PortfolioEnv,
        context: OAuthResourceContext<unknown>,
      ) =>
        context.auth.scope.includes("portfolio")
          ? forward(request, bindings)
          : insufficientScope(context.auth, ["portfolio"]),
    },
    defaultHandler: {
      fetch: (request: Request, bindings: PortfolioEnv) => {
        const oauth = bindings.OAUTH_PROVIDER;
        if (!oauth) return new Response(null, { status: 503 });
        switch (new URL(request.url).pathname) {
          case "/oauth/authorize":
            return authorize(request, bindings, oauth);
          case "/admin/mcp":
            return manage(request, bindings, oauth);
          default:
            return new Response(null, { status: 404 });
        }
      },
    },
    authorizeEndpoint: "/oauth/authorize",
    tokenEndpoint: "/oauth/token",
    clientRegistrationEndpoint: "/oauth/register",
    scopesSupported: ["portfolio", "offline_access"],
    requiredScopes: ["portfolio"],
    resourceMetadata: {
      resource: `${origin}/mcp`,
      authorization_servers: [origin],
    },
  });
  return provider.fetch(req, env, ctx);
}
