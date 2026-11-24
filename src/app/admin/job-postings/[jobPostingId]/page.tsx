"use client";

import { useMutation, useQuery } from "convex/react";
import { Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminSection,
  AdminShell,
  Field,
  SaveBar,
  StatusText,
} from "~/components/admin/ui";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function EditJobPostingPage() {
  const params = useParams<{ jobPostingId: Id<"jobPostings"> }>();
  const router = useRouter();
  const jobPosting = useQuery(api.jobPostings.get, { id: params.jobPostingId });
  const updateJobPosting = useMutation(api.jobPostings.update);
  const removeJobPosting = useMutation(api.jobPostings.remove);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const loadJobPosting = useCallback(() => {
    if (!jobPosting) return;
    setTitle(jobPosting.title);
    setCompany(jobPosting.company);
    setDescription(jobPosting.description);
    setLocation(jobPosting.location ?? "");
    setDirty(false);
  }, [jobPosting]);

  useEffect(() => {
    loadJobPosting();
  }, [loadJobPosting]);

  if (jobPosting === undefined) {
    return (
      <AdminShell>
        <StatusText>Loading…</StatusText>
      </AdminShell>
    );
  }

  if (jobPosting === null) {
    return (
      <AdminShell>
        <StatusText>Job posting not found.</StatusText>
      </AdminShell>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateJobPosting({
        id: params.jobPostingId,
        title,
        description,
        company,
        location: location || undefined,
      });
      setDirty(false);
    } catch (err) {
      console.error("Failed to save job posting:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await removeJobPosting({ id: params.jobPostingId });
    router.push("/admin/job-postings");
  };

  return (
    <AdminShell>
      <AdminPageHeader
        title="Edit posting"
        meta={new Date(jobPosting.createdAt).toLocaleDateString("en-CA")}
      >
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2 />
          Delete
        </Button>
      </AdminPageHeader>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <AdminSection title="Role">
          <div className="grid gap-4">
            <Field label="Title">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
              />
            </Field>
            <Field label="Company">
              <Input
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setDirty(true);
                }}
              />
            </Field>
            <Field label="Location (optional)">
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setDirty(true);
                }}
              />
            </Field>
          </div>
        </AdminSection>

        <AdminSection title="Description">
          <Textarea
            aria-label="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
            placeholder="Paste the full job description"
            rows={16}
          />
        </AdminSection>
      </div>

      <SaveBar visible={dirty}>
        <Button variant="ghost" size="sm" onClick={loadJobPosting}>
          Discard
        </Button>
        <Button size="sm" onClick={handleSave} loading={saving}>
          <Save />
          Save
        </Button>
      </SaveBar>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete this job posting?"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}
