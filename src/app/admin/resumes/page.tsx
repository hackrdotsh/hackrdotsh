"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminShell,
  EmptyState,
  Pill,
  StatusText,
} from "~/components/admin/ui";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { ResumePreviewButton } from "~/components/resume-preview-button";
import { Button } from "~/components/ui/button";
import { parseResume } from "~/lib/resume";
import { api } from "../../../../convex/_generated/api";

export default function AdminResumesPage() {
  const resumes = useQuery(api.resumes.list);
  const jobPostings = useQuery(api.jobPostings.list);
  const createResume = useMutation(api.resumes.create);

  const handleCreate = async () => {
    const id = await createResume({
      content: JSON.stringify({
        profile: "",
        experiences: [],
        skills: [],
        education: null,
      }),
    });
    window.location.href = `/admin/resumes/${id}`;
  };

  return (
    <AdminShell>
      <AdminPageHeader title="Resumes">
        <Button onClick={handleCreate}>
          <Plus />
          New resume
        </Button>
      </AdminPageHeader>

      {resumes === undefined && <StatusText>Loading…</StatusText>}
      {resumes === null && <EmptyState>Sign in to manage resumes.</EmptyState>}
      {resumes && resumes.length === 0 && (
        <EmptyState>No resumes yet.</EmptyState>
      )}

      {resumes && resumes.length > 0 && (
        <ul className="rows mt-8 lg:grid-cols-2 2xl:grid-cols-3">
          {resumes.map((resume) => {
            const data = parseResume(resume.content);
            const posting = resume.jobPosting
              ? jobPostings?.find((j) => j._id === resume.jobPosting)
              : undefined;
            const date = new Date(resume.createdAt).toLocaleDateString("en-CA");

            return (
              <li key={resume._id} className="row flex items-start gap-4">
                <Link
                  href={`/admin/resumes/${resume._id}`}
                  className="row-cover"
                  aria-label={`Edit resume from ${date}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="pixel-11 text-faint">{date}</span>
                    {resume.isFrontFacing && <Pill tone="live">Live</Pill>}
                    {posting && (
                      <Link
                        href={`/admin/job-postings/${posting._id}`}
                        className="row-control hover:brightness-125"
                      >
                        <Pill>
                          {posting.title}
                          {posting.company ? ` @ ${posting.company}` : ""}
                        </Pill>
                      </Link>
                    )}
                  </div>
                  {data?.profile && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {data.profile}
                    </p>
                  )}
                </div>
                {data && (
                  <span className="row-control flex shrink-0 gap-3 pr-1 pb-1">
                    <ResumePreviewButton data={data} />
                    <DownloadResumeButton
                      data={data}
                      company={posting?.company}
                      position={posting?.title}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
