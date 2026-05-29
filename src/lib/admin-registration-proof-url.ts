/** Client-safe URL builder for admin proof previews (no Node / Prisma imports). */

export function adminRegistrationProofUrl(
  registrationId: string,
  kind: "photo" | "id" | "payment",
): string {
  return `/api/admin/proof?id=${encodeURIComponent(registrationId)}&kind=${kind}`;
}
