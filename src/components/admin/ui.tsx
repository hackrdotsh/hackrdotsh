import { AdminTabs } from "~/components/admin/tabs";
import { Tag } from "~/components/ui/tag";
import { cn } from "~/lib/utils";

/** The admin page frame. It uses the full width of large displays. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-20 pb-16 sm:px-8">
        <AdminTabs />
        <div className="pt-8">{children}</div>
      </div>
    </main>
  );
}

export function AdminPageHeader({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  /** Actions shown beside the title. */
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          {title}
        </h1>
        {meta && <p className="pixel-11 mt-2 text-faint">{meta}</p>}
      </div>
      {children && (
        // Room for the buttons' extrusions.
        <div className="flex flex-wrap items-center gap-4 pr-2 pb-2">
          {children}
        </div>
      )}
    </header>
  );
}

/** A titled panel. Editors lay several of these out in columns. */
export function AdminSection({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel min-w-0 p-5", className)}>
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-4 pr-2">
        <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Pill({
  tone = "muted",
  children,
}: {
  tone?: "accent" | "muted" | "live";
  children: React.ReactNode;
}) {
  return <Tag tone={tone}>{children}</Tag>;
}

export function StatusText({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 text-sm text-muted-foreground">{children}</p>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-8 bg-surface-1 px-6 py-14 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/** A labelled control. Wrapping the control in the label ties them together. */
export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control is passed in as children
    <label className={cn("grid min-w-0 gap-2", className)}>
      <span className="pixel-11 text-muted-foreground uppercase">{label}</span>
      {children}
    </label>
  );
}

/** Unsaved-changes bar. It sticks to the bottom of the viewport while the
    page scrolls and takes space in the flow, so it never covers a control. */
export function SaveBar({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="sticky bottom-0 z-20 mt-8 bg-background">
      <hr className="rule" />
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 pr-2 pb-4">
        <Tag tone="accent">Unsaved changes</Tag>
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </div>
  );
}
