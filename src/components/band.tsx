import { cn } from "~/lib/utils";

/** A section under a rule: its title on the left, its content on the right. */
export function Band({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = `band-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={cn("pt-12", className)}>
      <hr className="rule" />
      <div className="grid gap-8 pt-10 md:grid-cols-[176px_minmax(0,1fr)] md:gap-12">
        <h2 id={id} className="pixel-22 text-foreground">
          {title}
        </h2>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
