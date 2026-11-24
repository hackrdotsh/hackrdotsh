"use client";

import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Id } from "../../../convex/_generated/dataModel";

// Base UI treats a null value as "nothing chosen", so "none" is a real item.
const NONE = "none";

export function JobPostingSelect({
  jobPostings,
  value,
  onChange,
}: {
  jobPostings:
    | { _id: Id<"jobPostings">; title: string; company: string }[]
    | null
    | undefined;
  value: Id<"jobPostings"> | null;
  onChange: (value: Id<"jobPostings"> | null) => void;
}) {
  const items = [
    { value: NONE, label: "none" },
    ...(jobPostings ?? []).map((posting) => ({
      value: posting._id as string,
      label: `${posting.title || "untitled"} — ${posting.company}`,
    })),
  ];

  return (
    <Select
      items={items}
      value={value ?? NONE}
      onValueChange={(next) =>
        onChange(next === NONE ? null : (next as Id<"jobPostings">))
      }
    >
      <SelectTrigger aria-label="Job posting">
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
