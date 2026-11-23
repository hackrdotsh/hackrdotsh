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
    function request(method: string, params: unknown, credential = token) {
      return t.fetch("/mcp", {
        method: "POST",
        headers: {
          authorization: `Bearer ${credential}`,
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
    const discovery = await (await request("tools/list", {})).json();
    expect(
      discovery.result.tools.map((tool: { name: string }) => tool.name).sort(),
    ).toEqual([
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
  } finally {
    vi.unstubAllEnvs();
  }
});
