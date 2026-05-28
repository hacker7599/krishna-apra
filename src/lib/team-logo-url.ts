/** Stored value is `teams/<filename>` under uploads/. */
export function teamLogoPublicUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath?.trim()) return null;
  const normalized = logoPath.replace(/^\/+/, "");
  if (!normalized.startsWith("teams/")) return null;
  const filename = normalized.slice("teams/".length);
  if (!filename || filename.includes("..") || filename.includes("/")) return null;
  return `/api/teams/media/${filename}`;
}
