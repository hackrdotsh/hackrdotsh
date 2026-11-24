import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Tag } from "~/components/ui/tag";
import { Textarea } from "~/components/ui/textarea";

const colors = [
  { name: "background", className: "bg-background" },
  { name: "surface-1", className: "bg-surface-1" },
  { name: "surface-2", className: "bg-surface-2" },
  { name: "surface-3", className: "bg-surface-3" },
  { name: "faint", className: "bg-faint" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "foreground", className: "bg-foreground" },
  { name: "accent", className: "bg-accent" },
  { name: "danger", className: "bg-danger" },
  { name: "danger-surface", className: "bg-danger-surface" },
];

const pixelSizes = [
  { name: "pixel-88", className: "pixel-88", sample: "hackr." },
  { name: "pixel-66", className: "pixel-66", sample: "hackr." },
  { name: "pixel-44", className: "pixel-44", sample: "Selected work" },
  { name: "pixel-33", className: "pixel-33", sample: "Selected work" },
  { name: "pixel-22", className: "pixel-22", sample: "What I'm working on" },
  { name: "pixel-11", className: "pixel-11", sample: "2026-11-24 · 4 MIN" },
];

const buttonVariants = [
  { variant: "default", label: "Primary" },
  { variant: "secondary", label: "Secondary" },
  { variant: "destructive", label: "Danger" },
  { variant: "ghost", label: "Ghost" },
  { variant: "link", label: "Link" },
] as const;

const stages = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
];

const buttonSizes = ["xs", "sm", "default", "lg", "xl"] as const;
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg", "icon-xl"] as const;

function Band({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = `ds-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="pt-12">
      <hr className="rule" />
      <div className="grid gap-8 pt-10 md:grid-cols-[160px_minmax(0,1fr)] md:gap-12">
        <h2 id={id} className="pixel-22 text-foreground">
          {title}
        </h2>
        <div className="grid min-w-0 gap-10">{children}</div>
      </div>
    </section>
  );
}

function Specimen({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <h3 className="pixel-11 text-muted-foreground uppercase">{label}</h3>
      {children}
    </div>
  );
}

function LabelledField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="pixel-11 text-muted-foreground uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

export function DesignSystem() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="mx-auto w-full max-w-5xl px-5 pt-28 pb-40 sm:px-8">
        <h1 className="pixel-44 text-foreground">Design system</h1>

        <Band title="Colour">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {colors.map((color) => (
              <li key={color.name} className="grid gap-2">
                <span
                  className={`block h-16 shadow-lift-1 ${color.className}`}
                />
                <span className="pixel-11 text-muted-foreground">
                  {color.name}
                </span>
              </li>
            ))}
          </ul>
        </Band>

        <Band title="Type">
          <Specimen label="Departure Mono, multiples of 11">
            <ul className="grid gap-6">
              {pixelSizes.map((size) => (
                <li
                  key={size.name}
                  className="grid gap-1 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-baseline"
                >
                  <span className="pixel-11 text-faint">{size.name}</span>
                  <span className={`${size.className} truncate`}>
                    {size.sample}
                  </span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="DM Sans">
            <p className="max-w-xl text-lg leading-relaxed text-foreground">
              I'm a software developer building most things with TypeScript,
              React, and Tailwind.
            </p>
            <p className="max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
              I love and use NixOS and Nix on a daily basis. Reproducible
              builds, declarative config, pinned versioning for projects.
            </p>
          </Specimen>
          <Specimen label="JetBrains Mono">
            <pre className="overflow-x-auto bg-surface-1 px-5 py-4 font-code text-[0.8125rem] leading-relaxed">
              {"nix develop --command pnpm dev"}
            </pre>
          </Specimen>
        </Band>

        <Band title="Dither">
          <Specimen label="Density">
            <ul className="grid grid-cols-3 gap-2 text-accent">
              {["dither-25", "dither-50", "dither-75"].map((name) => (
                <li key={name} className="grid gap-2">
                  <span className={`block h-16 ${name}`} />
                  <span className="pixel-11 text-muted-foreground">{name}</span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="Rule">
            <hr className="rule" />
          </Specimen>
          <Specimen label="Frame">
            <div className="flex flex-wrap gap-6">
              <p className="dither-frame max-w-xs bg-surface-1 px-4 py-3 text-sm">
                A solid face in a dithered frame two cells wide.
              </p>
              <p className="dither-frame max-w-xs bg-surface-1 px-4 py-3 text-sm [--frame:var(--accent)]">
                The frame takes any colour.
              </p>
            </div>
          </Specimen>
        </Band>

        <Band title="Surface">
          <div className="grid gap-6 bg-background sm:grid-cols-3">
            <div className="bg-surface-1 p-5 shadow-lift-1">
              <p className="pixel-11 text-muted-foreground">
                surface-1 · lift-1
              </p>
            </div>
            <div className="bg-surface-2 p-5 shadow-lift-2">
              <p className="pixel-11 text-muted-foreground">
                surface-2 · lift-2
              </p>
            </div>
            <div className="bg-surface-3 p-5 shadow-lift-3">
              <p className="pixel-11 text-muted-foreground">
                surface-3 · lift-3
              </p>
            </div>
          </div>
        </Band>

        <Band title="Button">
          <Specimen label="Variants">
            <div className="flex flex-wrap items-center gap-6">
              {buttonVariants.map(({ variant, label }) => (
                <Button key={variant} variant={variant}>
                  {label}
                </Button>
              ))}
            </div>
          </Specimen>
          <Specimen label="Disabled">
            <div className="flex flex-wrap items-center gap-6">
              {buttonVariants.map(({ variant, label }) => (
                <Button key={variant} variant={variant} disabled>
                  {label}
                </Button>
              ))}
            </div>
          </Specimen>
          <Specimen label="Loading">
            <div className="flex flex-wrap items-center gap-6">
              <Button loading>Primary</Button>
              <Button variant="secondary" loading>
                Secondary
              </Button>
              <Button variant="ghost" loading>
                Ghost
              </Button>
            </div>
          </Specimen>
          <Specimen label="Sizes">
            <div className="flex flex-wrap items-end gap-6">
              {buttonSizes.map((size) => (
                <Button key={size} size={size}>
                  {size}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-6">
              {buttonSizes.map((size) => (
                <Button key={size} size={size} variant="secondary">
                  {size}
                </Button>
              ))}
            </div>
          </Specimen>
          <Specimen label="With icons">
            <div className="flex flex-wrap items-center gap-6">
              <Button>
                <Plus />
                New resume
              </Button>
              <Button variant="secondary">
                Open
                <ArrowUpRight />
              </Button>
              <Button variant="destructive">
                <Trash2 />
                Delete
              </Button>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              {iconSizes.map((size) => (
                <Button
                  key={size}
                  size={size}
                  variant="secondary"
                  aria-label={`Add, ${size}`}
                >
                  <Plus />
                </Button>
              ))}
              <Button size="icon" variant="ghost" aria-label="Delete">
                <Trash2 />
              </Button>
              <Button size="icon" aria-label="Add">
                <Plus />
              </Button>
            </div>
          </Specimen>
        </Band>

        <Band title="Field">
          <div className="grid max-w-md gap-6">
            <LabelledField id="ds-company" label="Company">
              <Input id="ds-company" placeholder="Acme" />
            </LabelledField>
            <LabelledField id="ds-link" label="Link">
              <Input
                id="ds-link"
                defaultValue="not a url"
                aria-invalid="true"
                aria-describedby="ds-link-error"
              />
              <span id="ds-link-error" className="text-sm text-danger">
                Enter a full URL, starting with https://
              </span>
            </LabelledField>
            <LabelledField id="ds-disabled" label="Disabled">
              <Input id="ds-disabled" defaultValue="Read only" disabled />
            </LabelledField>
            <LabelledField id="ds-stage" label="Stage">
              <Select items={stages} defaultValue="applied">
                <SelectTrigger id="ds-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {stages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </LabelledField>
            <LabelledField id="ds-notes" label="Notes">
              <Textarea id="ds-notes" placeholder="Say hi, be nice." />
            </LabelledField>
            <div className="flex items-center gap-8 text-sm">
              <span className="flex items-center gap-3">
                <Switch id="ds-switch-off" />
                <label htmlFor="ds-switch-off">Off</label>
              </span>
              <span className="flex items-center gap-3">
                <Switch id="ds-switch-on" defaultChecked />
                <label htmlFor="ds-switch-on">On</label>
              </span>
              <span className="flex items-center gap-3 text-muted-foreground">
                <Switch id="ds-switch-disabled" disabled />
                <label htmlFor="ds-switch-disabled">Disabled</label>
              </span>
            </div>
          </div>
        </Band>

        <Band title="Tag">
          <div className="flex flex-wrap items-center gap-3">
            <Tag>draft</Tag>
            <Tag tone="accent">expert</Tag>
            <Tag tone="live">live</Tag>
            <Tag tone="danger">rejected</Tag>
          </div>
        </Band>

        <Band title="Rows">
          <ul className="rows">
            <li>
              <a href="#ds-rows" className="row">
                <span className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <span className="pixel-11 text-faint">2026-11-24</span>
                  <span className="font-semibold">A row that links</span>
                </span>
              </a>
            </li>
            <li>
              <a href="#ds-rows" className="row">
                <span className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <span className="pixel-11 text-faint">2026-10-02</span>
                  <span className="font-semibold">Another one</span>
                </span>
              </a>
            </li>
            <li className="row">
              <span className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                <span className="pixel-11 text-faint">2026-09-15</span>
                <span className="text-muted-foreground">
                  A row that only holds content
                </span>
              </span>
            </li>
          </ul>
        </Band>

        <Band title="Dialog">
          <div>
            <Dialog>
              <DialogTrigger render={<Button variant="secondary" />}>
                Open dialog
              </DialogTrigger>
              <DialogPopup>
                <DialogHeader>
                  <DialogTitle>Delete this resume?</DialogTitle>
                  <DialogDescription>
                    Its cover letters stay, but they lose their link to it.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost" />}>
                    Cancel
                  </DialogClose>
                  <DialogClose render={<Button variant="destructive" />}>
                    Delete
                  </DialogClose>
                </DialogFooter>
              </DialogPopup>
            </Dialog>
          </div>
        </Band>
      </div>
    </main>
  );
}
