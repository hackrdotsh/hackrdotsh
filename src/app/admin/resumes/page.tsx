"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminShell,
  EmptyState,
  Field,
  Pill,
  StatusText,
} from "~/components/admin/ui";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { ResumePreviewButton } from "~/components/resume-preview-button";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { parseResume } from "~/lib/resume";
import { useResumePhone } from "~/lib/resume-phone";
import { api } from "../../../../convex/_generated/api";

export default function AdminResumesPage() {
  const resumes = useQuery(api.resumes.list);
  const jobPostings = useQuery(api.jobPostings.list);
  const createResume = useMutation(api.resumes.create);
  const [phone, setPhone] = useResumePhone();

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

      <Field label="Phone on PDFs" className="mt-8 max-w-sm">
        <Input
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-describedby="resume-phone-help"
        />
        <span id="resume-phone-help" className="text-sm text-muted-foreground">
          Saved in this browser only. It appears on PDFs made here, not on the
          public resume.
        </span>
      </Field>

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
                    <ResumePreviewButton data={data} phone={phone} />
                    <DownloadResumeButton
                      data={data}
                      company={posting?.company}
                      position={posting?.title}
                      phone={phone}
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
