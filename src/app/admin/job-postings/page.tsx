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
import { Button } from "~/components/ui/button";
import { api } from "../../../../convex/_generated/api";

export default function AdminJobPostingsPage() {
  const jobPostings = useQuery(api.jobPostings.list);
  const createJobPosting = useMutation(api.jobPostings.create);

  const handleCreate = async () => {
    const id = await createJobPosting({
      title: "",
      description: "",
      company: "",
    });
    window.location.href = `/admin/job-postings/${id}`;
  };

  return (
    <AdminShell>
      <AdminPageHeader title="Job postings">
        <Button onClick={handleCreate}>
          <Plus />
          New posting
        </Button>
      </AdminPageHeader>

      {jobPostings === undefined && <StatusText>Loading…</StatusText>}
      {jobPostings === null && (
        <EmptyState>Sign in to manage job postings.</EmptyState>
      )}
      {jobPostings && jobPostings.length === 0 && (
        <EmptyState>No job postings yet.</EmptyState>
      )}

      {jobPostings && jobPostings.length > 0 && (
        <ul className="rows mt-8 lg:grid-cols-2 2xl:grid-cols-3">
          {jobPostings.map((posting) => (
            <li key={posting._id}>
              <Link
                href={`/admin/job-postings/${posting._id}`}
                className="row h-full"
              >
                <span className="block font-semibold text-foreground">
                  {posting.title || "Untitled"}
                  {posting.company && (
                    <span className="font-normal text-muted-foreground">
                      <span className="text-accent"> @ </span>
                      {posting.company}
                    </span>
                  )}
                </span>
                <span className="pixel-11 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-faint">
                  <span>
                    {new Date(posting.createdAt).toLocaleDateString("en-CA")}
                  </span>
                  {posting.location && <span>{posting.location}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
