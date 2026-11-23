/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, vi } from "vitest";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("MCP credential reads content and can update only the three allowed record types", async () => {
  const t = convexTest(schema, modules);
  const token = "local-test-only";
  vi.stubEnv("PORTFOLIO_MCP_TOKEN", token);
  try {
    const ids = await t.run(async (ctx) => {
      const job = await ctx.db.insert("jobPostings", {
        title: "Old",
        company: "Example",
        description: "Full description",
        createdAt: 1,
      });
      const letter = await ctx.db.insert("coverLetters", {
        content: "Before",
        jobPosting: job,
        createdAt: 1,
      });
      const resume = await ctx.db.insert("resumes", {
        content: "{}",
        isFrontFacing: false,
        jobPosting: job,
        createdAt: 1,
      });
      const vouch = await ctx.db.insert("vouches", {
        name: "Reviewer",
        url: "https://example.org",
        createdAt: 1,
      });
      return { job, letter, resume, vouch };
    });
    function request(
      method: string,
      params: unknown,
      credential = token,
      access = "manage",
    ) {
      return t.fetch("/mcp", {
        method: "POST",
        headers: {
          authorization: `Bearer ${credential}`,
          "X-Portfolio-Access": access,
          accept: "application/json, text/event-stream",
          "content-type": "application/json",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
    }
    async function call(name: string, args: unknown) {
      const res = await request("tools/call", { name, arguments: args });
      expect(res.status).toBe(200);
      return (await res.json()).result;
    }
    expect((await request("tools/list", {}, "wrong")).status).toBe(401);
    const oldGrant = await (
      await request("tools/list", {}, token, "update")
    ).json();
    expect(
      oldGrant.result.tools.map((tool: { name: string }) => tool.name).sort(),
    ).toEqual([
      "list_records",
      "update_cover_letter",
      "update_job",
      "update_resume",
    ]);
    const discovery = await (await request("tools/list", {})).json();
    expect(
      discovery.result.tools.map((tool: { name: string }) => tool.name).sort(),
    ).toEqual([
      "create_cover_letter",
      "create_job",
      "create_resume",
      "delete_cover_letter",
      "delete_job",
      "delete_resume",
      "list_records",
      "update_cover_letter",
      "update_job",
      "update_resume",
    ]);
    const listed = await call("list_records", { table: "vouches" });
    expect(JSON.parse(listed.content[0].text).page[0]._id).toBe(ids.vouch);
    expect(
      (
        await call("update_cover_letter", {
          id: ids.vouch,
          content: "Wrong table",
        })
      ).isError,
    ).toBe(true);
    expect(
      (await call("update_job", { id: ids.job, title: "New" })).isError,
    ).toBeFalsy();
    expect(
      (await call("update_cover_letter", { id: ids.letter, content: "After" }))
        .isError,
    ).toBeFalsy();
    const content = {
      profile: "Updated",
      experiences: [],
      skills: [],
      education: null,
    };
    expect(
      (await call("update_resume", { id: ids.resume, content })).isError,
    ).toBeFalsy();
    await t.run(async (ctx) => {
      expect(await ctx.db.get(ids.job)).toMatchObject({
        title: "New",
        description: "Full description",
      });
      expect(await ctx.db.get(ids.letter)).toMatchObject({
        content: "After",
        jobPosting: ids.job,
      });
      expect(await ctx.db.get(ids.resume)).toMatchObject({
        content: JSON.stringify(content),
        jobPosting: ids.job,
      });
      expect(await ctx.db.get(ids.vouch)).toMatchObject({
        name: "Reviewer",
        url: "https://example.org",
      });
    });
    await t.run((ctx) =>
      ctx.db.patch("resumes", ids.resume, { isFrontFacing: true }),
    );
    expect((await call("delete_resume", { id: ids.resume })).isError).toBe(
      true,
    );
    expect((await call("delete_job", { id: ids.job })).isError).toBe(true);
    for (const [kind, table, args] of [
      ["resume", "resumes", { content }],
      ["cover_letter", "coverLetters", { content: "Draft letter" }],
      [
        "job",
        "jobPostings",
        { title: "Developer", company: "Example", description: "Build tools" },
      ],
    ] as const) {
      const created = await call(`create_${kind}`, args);
      const { id } = JSON.parse(created.content[0].text);
      async function records() {
        const list = await call("list_records", { table });
        return JSON.parse(list.content[0].text).page as {
          _id: string;
          isFrontFacing?: boolean;
        }[];
      }
      const stored = (await records()).find((row) => row._id === id);
      expect(stored).toBeDefined();
      if (kind === "resume") expect(stored?.isFrontFacing).toBe(false);
      expect((await call(`delete_${kind}`, { id: ids.vouch })).isError).toBe(
        true,
      );
      expect((await call(`delete_${kind}`, { id })).isError).toBeFalsy();
      expect((await records()).some((row) => row._id === id)).toBe(false);
    }
    await t.run(async (ctx) => {
      expect(await ctx.db.get(ids.resume)).toMatchObject({
        isFrontFacing: true,
      });
      expect(await ctx.db.get(ids.vouch)).not.toBeNull();
    });
  } finally {
    vi.unstubAllEnvs();
  }
});
