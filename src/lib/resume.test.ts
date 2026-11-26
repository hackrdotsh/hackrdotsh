import { describe, expect, it } from "vitest";
import { parseEmphasis, parseResume, parseYear } from "./resume";

describe("parseYear", () => {
  it("keeps numbers and reads the year out of loose strings", () => {
    expect(parseYear(2022)).toBe(2022);
    expect(parseYear("2019")).toBe(2019);
    expect(parseYear("+2022},")).toBe(2022);
  });

  it("recognises an ongoing role", () => {
    expect(parseYear("Present")).toBe("Present");
    expect(parseYear("present")).toBe("Present");
  });
});

describe("parseResume", () => {
  it("repairs years in stored content", () => {
    const stored = JSON.stringify({
      profile: "",
      experiences: [
        {
          title: "Developer",
          company: "Acme",
          years: { start: "2020", end: "+2022}," },
          description: [],
        },
      ],
      skills: [],
      education: null,
    });

    expect(parseResume(stored)?.experiences[0].years).toEqual({
      start: 2020,
      end: 2022,
    });
  });

  it("returns null for content that isn't JSON", () => {
    expect(parseResume("not json")).toBeNull();
  });
});

describe("parseEmphasis", () => {
  it("splits text on bold markers", () => {
    expect(parseEmphasis("Cut CI time by **70%** overall")).toEqual([
      { text: "Cut CI time by ", bold: false },
      { text: "70%", bold: true },
      { text: " overall", bold: false },
    ]);
  });

  it("treats <b> tags like the markers", () => {
    expect(parseEmphasis("Cut CI time by <b>70%</b>")).toEqual([
      { text: "Cut CI time by ", bold: false },
      { text: "70%", bold: true },
    ]);
  });

  it("leaves text with an unclosed marker as typed", () => {
    expect(parseEmphasis("Cut **CI time")).toEqual([
      { text: "Cut **CI time", bold: false },
    ]);
  });
});
