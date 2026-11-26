"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { generateResumePDF } from "~/lib/generate-resume-pdf";
import type { ResumeData } from "~/lib/resume";

/** Opens the resume as the PDF that the download button would save, so the
    preview is exactly what gets sent. */
export function ResumePreviewButton({
  data,
  phone,
}: {
  data: ResumeData;
  /** Printed in the header. Only passed in the admin area. */
  phone?: string;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const open = async () => {
    setLoading(true);
    try {
      const doc = await generateResumePDF(data, { phone });
      setPdfUrl(URL.createObjectURL(doc.output("blob")));
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  return (
    <>
      <Button
        onClick={open}
        loading={loading}
        aria-label="Preview resume"
        variant="secondary"
        size="sm"
      >
        <Eye />
        Preview
      </Button>

      <Dialog
        open={pdfUrl !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) close();
        }}
      >
        <DialogPopup className="h-[90svh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resume preview</DialogTitle>
          </DialogHeader>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Resume preview"
              className="min-h-0 w-full flex-1 bg-surface-2"
            />
          )}
        </DialogPopup>
      </Dialog>
    </>
  );
}
