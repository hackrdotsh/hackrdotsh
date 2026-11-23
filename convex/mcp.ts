import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Id, TableNames } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

// Convex validates the ID against the specific table inside each mutation.
const recordId = <T extends TableNames>() =>
  z
    .string()
    .min(1)
    .transform((id) => id as Id<T>);

const resume = z.strictObject({
  profile: z.string(),
  experiences: z.array(
    z.strictObject({
      title: z.string(),
      company: z.string(),
      years: z.strictObject({
        start: z.number(),
        end: z.union([z.number(), z.literal("Present")]),
      }),
      description: z.union([z.string(), z.array(z.string())]),
      address: z.string().optional(),
    }),
  ),
  skills: z.array(
    z.strictObject({
      category: z.string(),
      name: z.string(),
      isExpert: z.boolean(),
    }),
  ),
  education: z
    .strictObject({
      universityName: z.string(),
      progression: z.string(),
      degreeName: z.string(),
      gpa: z.string().optional(),
    })
    .nullable(),
});

function result(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

export const handle = httpAction(async (ctx, request) => {
  const token = process.env.PORTFOLIO_MCP_TOKEN;
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
    return new Response(null, {
      status: 401,
      headers: { "WWW-Authenticate": "Bearer" },
    });
  }
  const origin = request.headers.get("origin");
  if (
    origin &&
    origin !== process.env.SITE_URL &&
    origin !== new URL(request.url).origin
  ) {
    return new Response(null, { status: 403 });
  }
  const server = new McpServer({ name: "hackr-portfolio", version: "1.0.0" });
  server.registerTool(
    "list_records",
    {
      description:
        "Read full stored records. Pass continueCursor as cursor until isDone is true.",
      annotations: { readOnlyHint: true },
      inputSchema: z.strictObject({
        table: z.enum([
          "resumes",
          "coverLetters",
          "jobPostings",
          "guestbook",
          "vouches",
        ]),
        cursor: z.string().nullable().default(null),
        limit: z.number().int().min(1).max(25).default(10),
      }),
    },
    async (args) => result(await ctx.runQuery(internal.portfolio.list, args)),
  );
  server.registerTool(
    "update_resume",
    {
      description:
        "Replace an existing resume's content. Its publication status and job link are preserved.",
      inputSchema: z.strictObject({
        id: recordId<"resumes">(),
        content: resume,
      }),
    },
    async ({ id, content }) => {
      await ctx.runMutation(internal.portfolio.updateResume, {
        id,
        content: JSON.stringify(content),
      });
      return result({ id });
    },
  );
  server.registerTool(
    "update_cover_letter",
    {
      description:
        "Replace an existing cover letter's text, preserving its job link.",
      inputSchema: z.strictObject({
        id: recordId<"coverLetters">(),
        content: z.string(),
      }),
    },
    async (args) => {
      await ctx.runMutation(internal.portfolio.updateCoverLetter, args);
      return result({ id: args.id });
    },
  );
  server.registerTool(
    "update_job",
    {
      description:
        "Update the supplied fields on an existing job posting. Dates are Unix milliseconds.",
      inputSchema: z.strictObject({
        id: recordId<"jobPostings">(),
        title: z.string().optional(),
        company: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        postingPostedAt: z.number().optional(),
      }),
    },
    async (args) => {
      if (Object.keys(args).length === 1)
        throw new Error("Supply at least one job field.");
      await ctx.runMutation(internal.portfolio.updateJob, args);
      return result({ id: args.id });
    },
  );
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
});
