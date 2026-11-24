"use client";

import { useQuery } from "convex/react";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { PageHeader, PageShell } from "~/components/page-shell";
import { ResumeView } from "~/components/resume-view";
import type { ResumeData } from "~/lib/resume";
import { api } from "../../../convex/_generated/api";

export default function Resume() {
  const resumeDoc = useQuery(api.resumes.getFrontFacing);
  const resume: ResumeData | null = resumeDoc
    ? JSON.parse(resumeDoc.content)
    : null;

  return (
    <PageShell>
      <PageHeader title="Resume">
        {resume && <DownloadResumeButton data={resume} />}
      </PageHeader>
      {resume && <ResumeView data={resume} />}
    </PageShell>
  );
}
