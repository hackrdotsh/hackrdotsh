export type ResumeData = {
  profile: string;
  experiences: Array<{
    title: string;
    company: string;
    years: { start: number; end: number | "Present" };
    description: string | Array<string>;
    address?: string;
  }>;
  skills: Array<{
    category: string;
    name: string;
    isExpert: boolean;
  }>;
  education: {
    universityName: string;
    progression: string;
    degreeName: string;
    gpa?: string;
  } | null;
};

type Years = ResumeData["experiences"][number]["years"];

/**
 * Reads a year that may have been stored loosely, such as "2022", "+2022},"
 * or "present". Stored resumes are plain JSON strings, so drafts written by
 * a model or an older editor can hold values the type doesn't allow.
 */
export function parseYear(value: unknown): Years["end"] {
  if (typeof value === "number") return value;
  const text = String(value ?? "");
  if (/present|current|now/i.test(text)) return "Present";
  const year = text.match(/\d{4}/);
  return year ? Number(year[0]) : 0;
}

/** Parses stored resume content, repairing loosely stored years. Returns
    null when the content isn't valid JSON. */
export function parseResume(content: string): ResumeData | null {
  let data: ResumeData;
  try {
    data = JSON.parse(content);
  } catch {
    return null;
  }

  return {
    ...data,
    experiences: (data.experiences ?? []).map((experience) => {
      const start = parseYear(experience.years?.start);
      return {
        ...experience,
        years: {
          start: start === "Present" ? 0 : start,
          end: parseYear(experience.years?.end),
        },
      };
    }),
  };
}

export type EmphasisSegment = { text: string; bold: boolean };

/**
 * Splits resume text on bold markers, written as `**70%**` or `<b>70%</b>`:
 * `Cut CI time by **70%**` gives a plain segment and a bold one. An unclosed
 * marker is left in the text as typed.
 */
export function parseEmphasis(text: string): EmphasisSegment[] {
  // <b> and <strong> tags mean the same as the markers.
  const marked = text.replace(/<\/?(?:b|strong)>/gi, "**");
  const parts = marked.split("**");
  // An even number of parts means a marker was never closed.
  if (parts.length % 2 === 0) return [{ text, bold: false }];

  return parts
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((segment) => segment.text !== "");
}
