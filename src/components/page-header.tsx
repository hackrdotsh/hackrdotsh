"use client";

import { ScrambleText } from "~/components/scramble-text";

export const PageHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => {
  return (
    <div>
      <p className="label">
        <span className="label-index">{"// "}</span>
        <ScrambleText text={eyebrow} trigger="ready" delay={0.5} />
      </p>
      <h1 className="mt-4 font-sans text-5xl font-semibold tracking-[-0.03em] text-foreground sm:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
