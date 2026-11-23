import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";

const createFields = {
  content: v.string(),
  jobPosting: v.optional(v.id("jobPostings")),
};
const updateFields = {
  content: v.optional(v.string()),
  jobPosting: v.optional(v.union(v.id("jobPostings"), v.null())),
};

async function checkJob(ctx: MutationCtx, id?: Id<"jobPostings"> | null) {
  if (id && !(await ctx.db.get("jobPostings", id)))
    throw new ConvexError("Job posting not found.");
}

async function documentPatch(
  ctx: MutationCtx,
  fields: { content?: string; jobPosting?: Id<"jobPostings"> | null },
) {
  if (fields.content === undefined && fields.jobPosting === undefined)
    throw new ConvexError("Supply content or jobPosting.");
  await checkJob(ctx, fields.jobPosting);
  return {
    ...(fields.content !== undefined && { content: fields.content }),
    ...(fields.jobPosting !== undefined && {
      jobPosting: fields.jobPosting ?? undefined,
    }),
  };
}

export const list = internalQuery({
  args: {
    table: v.union(
      v.literal("resumes"),
      v.literal("coverLetters"),
      v.literal("jobPostings"),
      v.literal("vouches"),
      v.literal("guestbook"),
    ),
    cursor: v.union(v.string(), v.null()),
    limit: v.number(),
  },
  handler: (ctx, { table, cursor, limit }) =>
    ctx.db.query(table).order("desc").paginate({ cursor, numItems: limit }),
});

export const updateResume = internalMutation({
  args: { id: v.id("resumes"), ...updateFields },
  handler: async (ctx, { id, ...fields }) => {
    if (fields.jobPosting && (await ctx.db.get("resumes", id))?.isFrontFacing)
      throw new ConvexError("Cannot link a job posting to the live resume.");
    await ctx.db.patch("resumes", id, await documentPatch(ctx, fields));
  },
});

export const createResume = internalMutation({
  args: createFields,
  handler: async (ctx, fields) => {
    await checkJob(ctx, fields.jobPosting);
    return ctx.db.insert("resumes", {
      ...fields,
      createdAt: Date.now(),
      isFrontFacing: false,
    });
  },
});

export const createCoverLetter = internalMutation({
  args: createFields,
  handler: async (ctx, fields) => {
    await checkJob(ctx, fields.jobPosting);
    return ctx.db.insert("coverLetters", {
      ...fields,
      createdAt: Date.now(),
    });
  },
});

export const createJob = internalMutation({
  args: {
    title: v.string(),
    company: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    postingPostedAt: v.optional(v.number()),
  },
  handler: (ctx, fields) =>
    ctx.db.insert("jobPostings", { ...fields, createdAt: Date.now() }),
});

export const deleteResume = internalMutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get("resumes", id);
    if (!doc) throw new ConvexError("Resume not found.");
    if (doc.isFrontFacing)
      throw new ConvexError("The live resume cannot be deleted.");
    await ctx.db.delete("resumes", id);
  },
});

export const deleteCoverLetter = internalMutation({
  args: { id: v.id("coverLetters") },
  handler: (ctx, { id }) => ctx.db.delete("coverLetters", id),
});

export const deleteJob = internalMutation({
  args: { id: v.id("jobPostings") },
  handler: async (ctx, { id }) => {
    for (const table of ["resumes", "coverLetters"] as const) {
      const linked = await ctx.db
        .query(table)
        .withIndex("by_jobPosting", (q) => q.eq("jobPosting", id))
        .first();
      if (linked)
        throw new ConvexError(
          "Unlink the resume or cover letter before deleting this job.",
        );
    }
    await ctx.db.delete("jobPostings", id);
  },
});

export const updateCoverLetter = internalMutation({
  args: { id: v.id("coverLetters"), ...updateFields },
  handler: async (ctx, { id, ...fields }) =>
    ctx.db.patch("coverLetters", id, await documentPatch(ctx, fields)),
});

export const updateJob = internalMutation({
  args: {
    id: v.id("jobPostings"),
    title: v.optional(v.string()),
    company: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    postingPostedAt: v.optional(v.number()),
  },
  handler: (ctx, { id, ...fields }) => ctx.db.patch("jobPostings", id, fields),
});
