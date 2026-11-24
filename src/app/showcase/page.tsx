import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader, PageShell } from "~/components/page-shell";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Showcase",
  description:
    "A collection of projects I've built - from communications platforms to developer tools.",
  path: "/showcase",
});

const projects: { title: string; description: string; link?: string }[] = [
  {
    title: "co.codes",
    description: "git hosting for humans and the agents they ride with.",
    link: "https://co.codes",
  },
  {
    title: "stoa.gg",
    description: "a private communications platform like discord and slack.",
    link: "https://stoa.gg",
  },
  {
    title: "thenix.guide",
    description: "a guide to nix and nixos.",
    link: "https://thenix.guide",
  },
  {
    title: "hackr.sh",
    description: "my personal portfolio site.",
    link: "https://hackr.sh",
  },
  {
    title: "itsasecret.dev",
    description:
      "a platform for managing secrets and environment variables with your team.",
    link: "https://itsasecret.dev",
  },
  {
    title: "rocky.systems",
    description: "a group of friends who hack on code together every sunday.",
    link: "https://rocky.systems",
  },
  {
    title: "???",
    description: "a development platform. more details soon.",
  },
  {
    title: "peep.codes",
    description: "a build-your-own pr reviewer for your workflows.",
    link: "https://peep.codes",
  },
  {
    title: "gojo",
    description: "jj version control with a slick terminal ui.",
    link: "https://gojo.rocks/",
  },
  {
    title: "farabi.study",
    description:
      "a modern logic education platform — a successor to carnap with richer tooling.",
    link: "https://farabi.study/",
  },
];

function ProjectRow({ project }: { project: (typeof projects)[number] }) {
  const content = (
    <span className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6">
      <span className="pixel-22 text-foreground">{project.title}</span>
      <span className="text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </span>
      {project.link && (
        <ArrowUpRight
          aria-hidden="true"
          className="hidden size-4 self-center text-faint sm:block"
        />
      )}
    </span>
  );

  if (!project.link) return <div className="row">{content}</div>;

  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="row"
    >
      {content}
    </a>
  );
}

export default function Showcase() {
  return (
    <PageShell>
      <PageHeader title="Selected work" />

      <ul className="rows mt-12">
        {projects.map((project) => (
          <li key={project.title}>
            <ProjectRow project={project} />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
