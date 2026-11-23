import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

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
  args: { id: v.id("resumes"), content: v.string() },
  handler: (ctx, { id, content }) => ctx.db.patch("resumes", id, { content }),
});

export const updateCoverLetter = internalMutation({
  args: { id: v.id("coverLetters"), content: v.string() },
  handler: (ctx, { id, content }) =>
    ctx.db.patch("coverLetters", id, { content }),
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
