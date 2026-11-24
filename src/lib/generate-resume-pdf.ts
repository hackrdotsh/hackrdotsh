import jsPDF from "jspdf";
import type { ResumeData } from "~/lib/resume";

// The layout is built for resume parsers first: one column drawn top to
// bottom in reading order, standard section names, every heading and line
// written as a single string, and skills as plain text.

const ACCENT = "#8a6414";
const TEXT = "#1a1a1a";
const MUTED = "#4b5563";
const RULE = "#d1d5db";

// US Letter, in millimetres.
const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN = 12.7;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const RIGHT_EDGE = PAGE_WIDTH - MARGIN;

const BODY_SIZE = 10;
const LINE_HEIGHT = 4.4;
const BULLET_INDENT = 4;

const NAME = "Mohammad Al-Ahdal";
const HEADLINE = "Software Developer";

const contactLinks = [
  { label: "hello@hackr.sh", url: "mailto:hello@hackr.sh" },
  {
    label: "linkedin.com/in/mohammadalahdal",
    url: "https://linkedin.com/in/mohammadalahdal",
  },
  { label: "github.com/hackrdotsh", url: "https://github.com/hackrdotsh" },
  { label: "hackr.sh", url: "https://hackr.sh" },
];

const CONTACT_SEPARATOR = "  |  ";

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    Number.parseInt(result[1], 16),
    Number.parseInt(result[2], 16),
    Number.parseInt(result[3], 16),
  ];
}

function toBase64(buffer: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function formatYears(years: ResumeData["experiences"][number]["years"]) {
  return years.start === years.end
    ? `${years.start}`
    : `${years.start} - ${years.end}`;
}

/** Skills by category, in first-seen order, with expert skills listed first. */
function groupSkills(skills: ResumeData["skills"]) {
  const groups = new Map<string, ResumeData["skills"]>();
  for (const skill of skills) {
    if (!skill.name.trim()) continue;
    const group = groups.get(skill.category) ?? [];
    group.push(skill);
    groups.set(skill.category, group);
  }
  return [...groups].map(([category, group]) => ({
    category,
    names: [
      ...group.filter((skill) => skill.isExpert),
      ...group.filter((skill) => !skill.isExpert),
    ].map((skill) => skill.name),
  }));
}

export async function generateResumePDF(data: ResumeData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "letter" });

  const [regularFont, boldFont] = await Promise.all([
    fetch("/fonts/DMSans.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/DMSans-Bold.ttf").then((r) => r.arrayBuffer()),
  ]);

  doc.addFileToVFS("DMSans-Regular.ttf", toBase64(regularFont));
  doc.addFont("DMSans-Regular.ttf", "DMSans", "normal");
  doc.addFileToVFS("DMSans-Bold.ttf", toBase64(boldFont));
  doc.addFont("DMSans-Bold.ttf", "DMSans", "bold");

  const skillGroups = groupSkills(data.skills);

  // Parsers and search read these alongside the text.
  doc.setProperties({
    title: `${NAME} - Resume`,
    subject: HEADLINE,
    author: NAME,
    keywords: skillGroups.flatMap((group) => group.names).join(", "),
  });

  let y = MARGIN;

  const setType = (weight: "normal" | "bold", size: number, color: string) => {
    doc.setFont("DMSans", weight);
    doc.setFontSize(size);
    doc.setTextColor(...hexToRgb(color));
  };

  /** Starts a new page when `needed` millimetres don't fit on this one. */
  const ensureRoom = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeParagraph = (text: string, x: number, width: number) => {
    setType("normal", BODY_SIZE, TEXT);
    const lines: string[] = doc.splitTextToSize(text, width);
    for (const line of lines) {
      ensureRoom(LINE_HEIGHT);
      doc.text(line, x, y);
      y += LINE_HEIGHT;
    }
  };

  const writeSectionHeading = (title: string) => {
    y += 3;
    // Keep the heading with the first lines under it.
    ensureRoom(18);
    setType("bold", 11, ACCENT);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 1.8;
    doc.setDrawColor(...hexToRgb(RULE));
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, RIGHT_EDGE, y);
    y += 5.2;
  };

  const writeHeader = () => {
    y += 5;
    setType("bold", 22, ACCENT);
    doc.text(NAME, MARGIN, y);
    y += 6.5;

    setType("normal", 11, TEXT);
    doc.text(HEADLINE, MARGIN, y);
    y += 5.5;

    setType("normal", 9.5, MUTED);
    let x = MARGIN;
    contactLinks.forEach((link, index) => {
      doc.textWithLink(link.label, x, y, { url: link.url });
      x += doc.getTextWidth(link.label);
      if (index < contactLinks.length - 1) {
        doc.text(CONTACT_SEPARATOR, x, y);
        x += doc.getTextWidth(CONTACT_SEPARATOR);
      }
    });
    y += 3;
  };

  const writeSkills = () => {
    for (const group of skillGroups) {
      const label = `${group.category}: `;
      setType("bold", BODY_SIZE, TEXT);
      const labelWidth = doc.getTextWidth(label);

      setType("normal", BODY_SIZE, TEXT);
      const lines: string[] = doc.splitTextToSize(
        group.names.join(", "),
        CONTENT_WIDTH - labelWidth,
      );

      lines.forEach((line, index) => {
        ensureRoom(LINE_HEIGHT);
        if (index === 0) {
          setType("bold", BODY_SIZE, TEXT);
          doc.text(label, MARGIN, y);
          setType("normal", BODY_SIZE, TEXT);
        }
        doc.text(line, MARGIN + labelWidth, y);
        y += LINE_HEIGHT;
      });
      y += 0.8;
    }
  };

  const writeExperience = (experience: ResumeData["experiences"][number]) => {
    // Keep the title, company and first bullet together.
    ensureRoom(LINE_HEIGHT * 4);

    setType("bold", 10.5, TEXT);
    doc.text(experience.title, MARGIN, y);
    setType("normal", BODY_SIZE, MUTED);
    doc.text(formatYears(experience.years), RIGHT_EDGE, y, { align: "right" });
    y += LINE_HEIGHT;

    const company = experience.address
      ? `${experience.company}, ${experience.address}`
      : experience.company;
    setType("normal", BODY_SIZE, MUTED);
    doc.text(company, MARGIN, y);
    y += LINE_HEIGHT + 0.6;

    if (typeof experience.description === "string") {
      writeParagraph(experience.description, MARGIN, CONTENT_WIDTH);
    } else {
      setType("normal", BODY_SIZE, TEXT);
      // A stored bullet can hold several lines; each one gets its own marker.
      const bullets = experience.description
        .flatMap((item) => item.split("\n"))
        .filter((item) => item.trim() !== "");
      for (const bullet of bullets) {
        const lines: string[] = doc.splitTextToSize(
          bullet,
          CONTENT_WIDTH - BULLET_INDENT,
        );
        // A bullet never splits across pages.
        ensureRoom(lines.length * LINE_HEIGHT);
        lines.forEach((line, index) => {
          if (index === 0) doc.text("•", MARGIN, y);
          doc.text(line, MARGIN + BULLET_INDENT, y);
          y += LINE_HEIGHT;
        });
      }
    }
    y += 3;
  };

  const writeEducation = (education: NonNullable<ResumeData["education"]>) => {
    setType("bold", 10.5, TEXT);
    doc.text(education.degreeName, MARGIN, y);
    setType("normal", BODY_SIZE, MUTED);
    doc.text(education.progression, RIGHT_EDGE, y, { align: "right" });
    y += LINE_HEIGHT;

    const school = education.gpa
      ? `${education.universityName}, GPA ${education.gpa}`
      : education.universityName;
    doc.text(school, MARGIN, y);
    y += LINE_HEIGHT;
  };

  writeHeader();

  if (data.profile.trim()) {
    writeSectionHeading("Summary");
    writeParagraph(data.profile, MARGIN, CONTENT_WIDTH);
  }

  if (skillGroups.length > 0) {
    writeSectionHeading("Skills");
    writeSkills();
  }

  if (data.experiences.length > 0) {
    writeSectionHeading("Work Experience");
    for (const experience of data.experiences) {
      writeExperience(experience);
    }
  }

  if (data.education) {
    writeSectionHeading("Education");
    writeEducation(data.education);
  }

  return doc;
}
