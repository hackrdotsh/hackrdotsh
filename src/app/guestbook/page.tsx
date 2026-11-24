import type { Metadata } from "next";
import { PageHeader, PageShell } from "~/components/page-shell";
import { generatePageMetadata } from "~/lib/metadata";
import { Guestbook } from "./guestbook";

export const metadata: Metadata = generatePageMetadata({
  title: "Guestbook",
  description: "Leave a note in the guestbook with your GitHub account.",
  path: "/guestbook",
});

export default function GuestbookPage() {
  return (
    <PageShell>
      <PageHeader title="Guestbook" />
      <Guestbook />
    </PageShell>
  );
}
