import type React from "react";
import { cn } from "~/lib/utils";

const toneClass = {
  muted: "",
  accent: "tag-accent",
  danger: "tag-danger",
  live: "tag-accent tag-live",
} as const;

export function Tag({
  tone = "muted",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  tone?: keyof typeof toneClass;
}): React.ReactElement {
  return <span className={cn("tag", toneClass[tone], className)} {...props} />;
}
