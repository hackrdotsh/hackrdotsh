import { parseEmphasis } from "~/lib/resume";

/** Resume text with its `**bold**` markers rendered. */
export function Emphasis({ text }: { text: string }) {
  return parseEmphasis(text).map((segment, index) =>
    segment.bold ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and never reorder
      <strong key={index} className="font-semibold text-foreground">
        {segment.text}
      </strong>
    ) : (
      segment.text
    ),
  );
}
