/** Join class names; avoids trailing spaces that confuse hydration. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
