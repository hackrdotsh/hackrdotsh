import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Band } from "~/components/band";
import { CommitGraph } from "~/components/commit-graph";
import { Button } from "~/components/ui/button";
import { projects } from "~/lib/site-data";

const aboutParagraphs = [
  "I also dabble in a lot of homelabbing projects — currently self-hosting dokploy, pyrodactyl, and home assistant.",
  "I love and use NixOS and Nix on a daily basis. Reproducible builds, declarative config, pinned versioning for projects — it really is one of the best things I've ever integrated into my workflow.",
  "Most of my time goes into building web apps, wrangling servers, and convincing everyone that Linux is better than Windows.",
];

function ProjectRow({ project }: { project: (typeof projects)[number] }) {
  const content = (
    <span className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6">
      <span className="pixel-22 text-foreground">{project.title}</span>
      <span className="text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </span>
      {project.href && (
        <ArrowUpRight
          aria-hidden="true"
          className="hidden size-4 self-center text-faint sm:block"
        />
      )}
    </span>
  );

  if (!project.href) return <div className="row">{content}</div>;

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="row"
    >
      {content}
    </a>
  );
}

export function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center">
        <div aria-hidden="true" className="absolute inset-0">
          <CommitGraph />
        </div>
        {/* The text sits over the graph; only its controls take the pointer,
            so the squares around it stay hoverable. */}
        <div className="pointer-events-none relative mx-auto w-full max-w-5xl px-5 sm:px-8">
          <p className="pixel-11 text-muted-foreground uppercase">
            Mohammad Al-Ahdal
          </p>
          <h1 className="mt-4 pixel-44 sm:pixel-66 lg:pixel-88">
            Hey, I'm hackr<span className="text-accent">.</span>
          </h1>
          <p className="mt-8 max-w-md leading-relaxed text-muted-foreground">
            I'm a software developer building most things with TypeScript,
            React, and Tailwind. Currently on my journey to learn Rust.
          </p>
          <div className="pointer-events-auto mt-10 flex w-fit flex-wrap items-center gap-6">
            <Button size="lg" render={<Link href="/showcase" />}>
              See my work
            </Button>
            <Button
              size="lg"
              variant="secondary"
              render={<Link href="/blog" />}
            >
              Read my writing
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
        <Band title="About" className="pt-0">
          <div className="grid max-w-2xl gap-5 leading-relaxed text-muted-foreground">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </Band>

        <Band title="Working on">
          <ul className="rows">
            {projects.map((project) => (
              <li key={project.title}>
                <ProjectRow project={project} />
              </li>
            ))}
          </ul>
        </Band>
      </div>
    </main>
  );
}
