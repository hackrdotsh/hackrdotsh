"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { JobPostingSelect } from "~/components/admin/job-posting-select";
import {
  AdminPageHeader,
  AdminSection,
  AdminShell,
  Field,
  Pill,
  SaveBar,
  StatusText,
} from "~/components/admin/ui";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { DownloadResumeButton } from "~/components/download-resume-button";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import type { ResumeData } from "~/lib/resume";
import { cn } from "~/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const blankResume: ResumeData = {
  profile: "",
  experiences: [],
  skills: [],
  education: null,
};

type Experience = ResumeData["experiences"][number];

function parseEndYear(value: string): Experience["years"]["end"] {
  return value === "Present" ? "Present" : Number(value) || 0;
}

function splitBullets(value: string) {
  return value.split("\n").filter((line) => line.trim() !== "");
}

/** A nested block inside a section panel. It steps down to the page colour
    so the fields inside it stay visible. */
const insetClass = "grid gap-4 bg-background p-4";

function ExperienceEditor({
  experience,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  experience: Experience;
  index: number;
  count: number;
  onChange: (index: number, updated: Experience) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (index: number) => void;
}) {
  const [startYear, setStartYear] = useState(String(experience.years.start));
  const [endYear, setEndYear] = useState(String(experience.years.end));
  const [address, setAddress] = useState(experience.address ?? "");
  const [title, setTitle] = useState(experience.title);
  const [company, setCompany] = useState(experience.company);
  const [description, setDescription] = useState(
    Array.isArray(experience.description)
      ? experience.description.join("\n")
      : experience.description,
  );

  const update = (field: Partial<Experience>) => {
    onChange(index, {
      ...experience,
      years: { start: Number(startYear) || 0, end: parseEndYear(endYear) },
      address: address || undefined,
      title,
      company,
      description: splitBullets(description),
      ...field,
    });
  };

  return (
    <li className={insetClass}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="pixel-11 text-muted-foreground uppercase">
          Experience {index + 1}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            aria-label="Move experience up"
          >
            <ChevronUp />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onMove(index, "down")}
            disabled={index === count - 1}
            aria-label="Move experience down"
          >
            <ChevronDown />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(index)}
            aria-label="Remove experience"
          >
            <X className="text-danger" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              update({ title: e.target.value });
            }}
          />
        </Field>
        <Field label="Company">
          <Input
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              update({ company: e.target.value });
            }}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-[6rem_6rem_minmax(0,1fr)]">
        <Field label="Start">
          <Input
            inputMode="numeric"
            value={startYear}
            onChange={(e) => {
              setStartYear(e.target.value);
              update({
                years: {
                  start: Number(e.target.value) || 0,
                  end: parseEndYear(endYear),
                },
              });
            }}
          />
        </Field>
        <Field label="End">
          <Input
            value={endYear}
            onChange={(e) => {
              setEndYear(e.target.value);
              update({
                years: {
                  start: Number(startYear) || 0,
                  end: parseEndYear(e.target.value),
                },
              });
            }}
            placeholder="Present"
          />
        </Field>
        <Field label="Location (optional)">
          <Input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              update({ address: e.target.value || undefined });
            }}
          />
        </Field>
      </div>

      <Field label="Bullets, one per line">
        <Textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            update({ description: splitBullets(e.target.value) });
          }}
          rows={7}
        />
      </Field>
    </li>
  );
}

function SkillEditor({
  skills,
  onChange,
}: {
  skills: ResumeData["skills"];
  onChange: (skills: ResumeData["skills"]) => void;
}) {
  const grouped = skills.reduce<
    Record<string, { name: string; isExpert: boolean; originalIndex: number }[]>
  >((acc, skill, index) => {
    acc[skill.category] ??= [];
    acc[skill.category].push({
      name: skill.name,
      isExpert: skill.isExpert,
      originalIndex: index,
    });
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const updateSkill = (
    originalIndex: number,
    change: Partial<ResumeData["skills"][number]>,
  ) => {
    const updated = [...skills];
    updated[originalIndex] = { ...updated[originalIndex], ...change };
    onChange(updated);
  };

  const removeSkill = (originalIndex: number) => {
    onChange(skills.filter((_, i) => i !== originalIndex));
  };

  const addSkill = (category: string) => {
    onChange([...skills, { category, name: "", isExpert: false }]);
  };

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const addCategory = (name: string) => {
    if (!name.trim()) return;
    addSkill(name.trim());
    setCategoryDialogOpen(false);
  };

  return (
    <div className="grid gap-4">
      {categories.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <li key={category} className={cn(insetClass, "content-start")}>
              <h3 className="pixel-11 text-muted-foreground uppercase">
                {category} ({grouped[category].length})
              </h3>
              <ul className="grid gap-2">
                {grouped[category].map((skill) => (
                  <li
                    key={skill.originalIndex}
                    className="flex items-center gap-1"
                  >
                    <Input
                      aria-label="Skill name"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(skill.originalIndex, {
                          name: e.target.value,
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-pressed={skill.isExpert}
                      aria-label="Expert"
                      title="Expert"
                      onClick={() =>
                        updateSkill(skill.originalIndex, {
                          isExpert: !skill.isExpert,
                        })
                      }
                    >
                      <Star
                        className={cn(
                          skill.isExpert
                            ? "fill-accent text-accent"
                            : "text-faint",
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(skill.originalIndex)}
                      aria-label={`Remove ${skill.name || "skill"}`}
                    >
                      <X className="text-danger" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => addSkill(category)}
              >
                <Plus />
                Add skill
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="pr-2 pb-2">
        <Button variant="secondary" onClick={() => setCategoryDialogOpen(true)}>
          <Plus />
          Add category
        </Button>
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            <Input
              ref={categoryInputRef}
              aria-label="Category name"
              placeholder="Frameworks"
              onKeyDown={(e) => {
                if (e.key === "Enter") addCategory(e.currentTarget.value);
              }}
            />
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => {
                const input = categoryInputRef.current;
                if (input) addCategory(input.value);
              }}
            >
              Add category
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

function EducationEditor({
  education,
  onChange,
}: {
  education: ResumeData["education"];
  onChange: (education: ResumeData["education"]) => void;
}) {
  const handleToggle = (checked: boolean) => {
    onChange(
      checked
        ? {
            universityName: "",
            progression: "",
            degreeName: "",
            gpa: undefined,
          }
        : null,
    );
  };

  return (
    <div className="grid gap-4">
      <span className="flex items-center gap-3 text-sm">
        <Switch
          id="include-education"
          checked={education !== null}
          onCheckedChange={handleToggle}
        />
        <label htmlFor="include-education">Include education</label>
      </span>
      {education && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Degree">
            <Input
              value={education.degreeName}
              onChange={(e) =>
                onChange({ ...education, degreeName: e.target.value })
              }
            />
          </Field>
          <Field label="University">
            <Input
              value={education.universityName}
              onChange={(e) =>
                onChange({ ...education, universityName: e.target.value })
              }
            />
          </Field>
          <Field label="Years">
            <Input
              value={education.progression}
              onChange={(e) =>
                onChange({ ...education, progression: e.target.value })
              }
              placeholder="2016 - 2020"
            />
          </Field>
          <Field label="GPA (optional)">
            <Input
              value={education.gpa ?? ""}
              onChange={(e) =>
                onChange({ ...education, gpa: e.target.value || undefined })
              }
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export default function EditResumePage() {
  const params = useParams<{ resumeId: Id<"resumes"> }>();
  const router = useRouter();
  const resume = useQuery(api.resumes.get, { id: params.resumeId });
  const jobPostings = useQuery(api.jobPostings.list);
  const updateResume = useMutation(api.resumes.update);
  const removeResume = useMutation(api.resumes.remove);

  const [draft, setDraft] = useState<ResumeData>(blankResume);
  const [selectedJobPosting, setSelectedJobPosting] =
    useState<Id<"jobPostings"> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadResume = useCallback(() => {
    if (!resume) return;
    try {
      const data = JSON.parse(resume.content) as ResumeData;
      setDraft(data);
    } catch {
      setDraft(blankResume);
    }
    setSelectedJobPosting(resume.jobPosting ?? null);
    setDirty(false);
  }, [resume]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  if (resume === undefined) {
    return (
      <AdminShell>
        <StatusText>Loading…</StatusText>
      </AdminShell>
    );
  }

  if (resume === null) {
    return (
      <AdminShell>
        <StatusText>Resume not found.</StatusText>
      </AdminShell>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = JSON.stringify(draft);
      await updateResume({
        id: params.resumeId,
        content,
        isFrontFacing: resume.isFrontFacing,
        jobPosting: selectedJobPosting ?? undefined,
      });
      setDirty(false);
    } catch (err) {
      console.error("Failed to save resume:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await removeResume({ id: params.resumeId });
    router.push("/admin/resumes");
  };

  const updateField = <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const addExperience = () => {
    setDraft((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          title: "",
          company: "",
          years: { start: new Date().getFullYear(), end: "Present" },
          description: [],
        },
      ],
    }));
    setDirty(true);
  };

  const removeExperience = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
    setDirty(true);
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= draft.experiences.length) return;
    setDraft((prev) => {
      const experiences = [...prev.experiences];
      [experiences[index], experiences[newIndex]] = [
        experiences[newIndex],
        experiences[index],
      ];
      return { ...prev, experiences };
    });
    setDirty(true);
  };

  const selectedJp = selectedJobPosting
    ? jobPostings?.find((j) => j._id === selectedJobPosting)
    : undefined;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/resumes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: selectedJobPosting ?? undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data: ResumeData = await res.json();
      setDraft(data);
      setDirty(true);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const changeExperience = (index: number, updated: Experience) => {
    setDraft((prev) => ({
      ...prev,
      experiences: prev.experiences.map((experience, i) =>
        i === index ? updated : experience,
      ),
    }));
    setDirty(true);
  };

  return (
    <AdminShell>
      <AdminPageHeader
        title="Edit resume"
        meta={new Date(resume.createdAt).toLocaleDateString("en-CA")}
      >
        {resume.isFrontFacing && <Pill tone="live">Live</Pill>}
        <DownloadResumeButton
          data={draft}
          company={selectedJp?.company}
          position={selectedJp?.title}
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2 />
          Delete
        </Button>
      </AdminPageHeader>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-2">
        <div className="grid min-w-0 gap-6">
          <AdminSection title="Job posting">
            {resume.isFrontFacing ? (
              <p className="text-sm text-muted-foreground">
                The live resume can't be linked to a job posting.
              </p>
            ) : (
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
                    Generate resume
                  </Button>
                </div>
              </div>
            )}
          </AdminSection>

          <AdminSection title="Profile">
            <Textarea
              aria-label="Profile"
              value={draft.profile}
              onChange={(e) => updateField("profile", e.target.value)}
              rows={4}
            />
          </AdminSection>

          <AdminSection title="Skills">
            <SkillEditor
              skills={draft.skills}
              onChange={(skills) => updateField("skills", skills)}
            />
          </AdminSection>

          <AdminSection title="Education">
            <EducationEditor
              education={draft.education}
              onChange={(education) => updateField("education", education)}
            />
          </AdminSection>
        </div>

        <AdminSection title="Experience">
          <div className="grid gap-4">
            {draft.experiences.length > 0 && (
              <ul className="grid gap-2">
                {draft.experiences.map((experience, index) => (
                  <ExperienceEditor
                    // biome-ignore lint/suspicious/noArrayIndexKey: editor rows have no stable id; state is positional
                    key={index}
                    experience={experience}
                    index={index}
                    count={draft.experiences.length}
                    onChange={changeExperience}
                    onMove={moveExperience}
                    onRemove={removeExperience}
                  />
                ))}
              </ul>
            )}
            <div className="pr-2 pb-2">
              <Button variant="secondary" onClick={addExperience}>
                <Plus />
                Add experience
              </Button>
            </div>
          </div>
        </AdminSection>
      </div>

      <SaveBar visible={dirty}>
        <Button variant="ghost" size="sm" onClick={loadResume}>
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
        title="Delete this resume?"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}
