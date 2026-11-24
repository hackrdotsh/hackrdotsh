import { cn } from "~/lib/utils";

/** The main landmark and reading column shared by every public page. */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <div
        className={cn(
          "mx-auto w-full max-w-5xl px-5 pt-14 pb-24 sm:px-8 sm:pt-20",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  /** Actions shown beside the title. */
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        <h1 className="pixel-33 text-balance text-foreground sm:pixel-44">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
