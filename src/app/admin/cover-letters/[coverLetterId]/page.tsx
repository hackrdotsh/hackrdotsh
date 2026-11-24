"use client";

import { useMutation, useQuery } from "convex/react";
import { Save, Sparkles, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { JobPostingSelect } from "~/components/admin/job-posting-select";
import {
  AdminPageHeader,
  AdminSection,
  AdminShell,
  SaveBar,
  StatusText,
} from "~/components/admin/ui";
import { DownloadCoverLetterButton } from "~/components/download-cover-letter-button";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function EditCoverLetterPage() {
  const params = useParams<{ coverLetterId: Id<"coverLetters"> }>();
  const router = useRouter();
  const coverLetter = useQuery(api.coverLetters.get, {
    id: params.coverLetterId,
  });
  const jobPostings = useQuery(api.jobPostings.list);
  const updateCoverLetter = useMutation(api.coverLetters.update);
  const removeCoverLetter = useMutation(api.coverLetters.remove);

  const [draft, setDraft] = useState("");
  const [selectedJobPosting, setSelectedJobPosting] =
    useState<Id<"jobPostings"> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadCoverLetter = useCallback(() => {
    if (!coverLetter) return;
    setDraft(coverLetter.content);
    setSelectedJobPosting(coverLetter.jobPosting ?? null);
    setDirty(false);
  }, [coverLetter]);

  useEffect(() => {
    loadCoverLetter();
  }, [loadCoverLetter]);

  if (coverLetter === undefined) {
    return (
      <AdminShell>
        <StatusText>Loading…</StatusText>
      </AdminShell>
    );
  }

  if (coverLetter === null) {
    return (
      <AdminShell>
        <StatusText>Cover letter not found.</StatusText>
      </AdminShell>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCoverLetter({
        id: params.coverLetterId,
        content: draft,
        jobPosting: selectedJobPosting ?? undefined,
      });
      setDirty(false);
    } catch (err) {
      console.error("Failed to save cover letter:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this cover letter? This cannot be undone.")) return;
    await removeCoverLetter({ id: params.coverLetterId });
    router.push("/admin/cover-letters");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/cover-letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: selectedJobPosting ?? undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setDraft(data.content);
      setDirty(true);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const selectedJp = selectedJobPosting
    ? jobPostings?.find((j) => j._id === selectedJobPosting)
    : undefined;

  return (
    <AdminShell>
      <AdminPageHeader
        title="Edit letter"
        meta={new Date(coverLetter.createdAt).toLocaleDateString("en-CA")}
      >
        {draft && (
          <DownloadCoverLetterButton
            content={draft}
            jobTitle={selectedJp?.title}
            company={selectedJp?.company}
          />
        )}
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 />
          Delete
        </Button>
      </AdminPageHeader>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <AdminSection title="Job posting">
          <div className="grid gap-4">
            <JobPostingSelect
              jobPostings={jobPostings}
              value={selectedJobPosting}
              onChange={(next) => {
                setSelectedJobPosting(next);
                setDirty(true);
              }}
            />
            <div className="pr-2 pb-2">
              <Button
                variant="secondary"
                loading={generating}
                onClick={handleGenerate}
              >
                <Sparkles className="text-accent" />
                Generate letter
              </Button>
            </div>
          </div>
        </AdminSection>

        <AdminSection title="Content">
          <Textarea
            aria-label="Content"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDirty(true);
            }}
            rows={20}
          />
        </AdminSection>
      </div>

      <SaveBar visible={dirty}>
        <Button variant="ghost" size="sm" onClick={loadCoverLetter}>
          Discard
        </Button>
        <Button size="sm" onClick={handleSave} loading={saving}>
          <Save />
          Save
        </Button>
      </SaveBar>
    </AdminShell>
  );
}
