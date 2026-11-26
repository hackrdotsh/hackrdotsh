"use client";

import { FileDown } from "lucide-react";
import { useCallback } from "react";
import { Button } from "~/components/ui/button";
import { generateResumePDF } from "~/lib/generate-resume-pdf";
import type { ResumeData } from "~/lib/resume";

interface DownloadResumeButtonProps {
  data: ResumeData;
  company?: string;
  position?: string;
  /** Printed in the header. Only passed in the admin area. */
  phone?: string;
}

const buildResumeFilename = (company?: string, position?: string) => {
  const parts = ["Mohammad_Al-Ahdal"];
  if (company) parts.push(company.replace(/\s+/g, "_"));
  if (position) parts.push(position.replace(/\s+/g, "_"));
  parts.push("Resume");
  return `${parts.join("_")}.pdf`;
};

export const DownloadResumeButton = ({
  data,
  company,
  position,
  phone,
}: DownloadResumeButtonProps) => {
  const handleClick = useCallback(async () => {
    const doc = await generateResumePDF(data, { phone });
    doc.save(buildResumeFilename(company, position));
  }, [data, company, position, phone]);

  return (
    <Button
      onClick={handleClick}
      aria-label="Download resume as PDF"
      variant="secondary"
      size="sm"
    >
      <FileDown />
      PDF
    </Button>
  );
};
