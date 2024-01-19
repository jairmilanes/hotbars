import { detectNewline } from "detect-newline";

export function removeWhitespace(text: string): string {
  const newline = detectNewline(text)

  const lines = text.split(newline as string)
    .map((line) => line.replace(/\s+$/g, ''))

  return lines.join(newline)
}