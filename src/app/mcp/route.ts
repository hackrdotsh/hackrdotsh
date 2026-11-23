export async function POST(request: Request) {
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!site) return new Response(null, { status: 503 });

  const headers = new Headers();
  for (const name of [
    "accept",
    "authorization",
    "content-type",
    "mcp-protocol-version",
    "origin",
  ]) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers,
    body: request.body,
    duplex: "half",
    redirect: "error",
    cache: "no-store",
  };
  const upstream = await fetch(new URL("/mcp", site), init);
  const response = new Response(upstream.body, upstream);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
