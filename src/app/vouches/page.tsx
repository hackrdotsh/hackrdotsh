import type { Metadata } from "next";
import { PageHeader, PageShell } from "~/components/page-shell";
import { generatePageMetadata } from "~/lib/metadata";
import { VouchesGrid } from "./vouches-grid";

export const metadata: Metadata = generatePageMetadata({
  title: "Vouches",
  description: "People I've vouched for.",
  path: "/vouches",
});

export default function VouchesPage() {
  return (
    <PageShell>
      <PageHeader title="Vouches" description="People I've vouched for." />
      <VouchesGrid />
    </PageShell>
  );
}
