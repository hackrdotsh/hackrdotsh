import type React from "react";
import { cn } from "~/lib/utils";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("block size-4", className)}
      {...props}
    >
      <span className="block size-1/2 bg-current motion-safe:animate-[pixel-spin_0.6s_steps(1,end)_infinite]" />
    </span>
  );
}
