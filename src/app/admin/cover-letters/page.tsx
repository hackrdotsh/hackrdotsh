"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminShell,
  EmptyState,
  StatusText,
} from "~/components/admin/ui";
import { DownloadCoverLetterButton } from "~/components/download-cover-letter-button";
import { Button } from "~/components/ui/button";
import { Tag } from "~/components/ui/tag";
import { api } from "../../../../convex/_generated/api";

export default function AdminCoverLettersPage() {
  const coverLetters = useQuery(api.coverLetters.list);
  const jobPostings = useQuery(api.jobPostings.list);
  const createCoverLetter = useMutation(api.coverLetters.create);

  const handleCreate = async () => {
    const id = await createCoverLetter({ content: "" });
    window.location.href = `/admin/cover-letters/${id}`;
  };

  return (
    <AdminShell>
      <AdminPageHeader title="Cover letters">
        <Button onClick={handleCreate}>
          <Plus />
          New letter
        </Button>
      </AdminPageHeader>

      {coverLetters === undefined && <StatusText>Loading…</StatusText>}
      {coverLetters === null && (
        <EmptyState>Sign in to manage cover letters.</EmptyState>
      )}
      {coverLetters && coverLetters.length === 0 && (
        <EmptyState>No cover letters yet.</EmptyState>
      )}

      {coverLetters && coverLetters.length > 0 && (
        <ul className="rows mt-8 lg:grid-cols-2 2xl:grid-cols-3">
          {coverLetters.map((coverLetter) => {
            const posting = coverLetter.jobPosting
              ? jobPostings?.find((j) => j._id === coverLetter.jobPosting)
              : undefined;
            const date = new Date(coverLetter.createdAt).toLocaleDateString(
              "en-CA",
            );

            return (
              <li key={coverLetter._id} className="row">
                <Link
                  href={`/admin/cover-letters/${coverLetter._id}`}
                  className="row-cover"
                  aria-label={`Edit cover letter from ${date}`}
                />
                <div className="flex items-start justify-between gap-4">
                  <span className="pixel-11 pt-2 text-faint">{date}</span>
                  {coverLetter.content && (
                    <span className="row-control shrink-0 pr-1 pb-1">
                      <DownloadCoverLetterButton
                        content={coverLetter.content}
                        jobTitle={posting?.title}
                        company={posting?.company}
                      />
                    </span>
                  )}
                </div>
                {posting && (
                  <Tag
                    title={`${posting.title}${posting.company ? ` @ ${posting.company}` : ""}`}
                    className="mt-2 block w-fit max-w-full truncate py-0.5"
                  >
                    {posting.title}
                    {posting.company ? ` @ ${posting.company}` : ""}
                  </Tag>
                )}
                {coverLetter.content && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {coverLetter.content}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
