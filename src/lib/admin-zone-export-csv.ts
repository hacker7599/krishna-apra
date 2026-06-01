import type { RegistrationListRow } from "@/lib/admin-registrations-query";

type ExportRow = RegistrationListRow & {
  trialZone?: { trialPlace: string; zone: string } | null;
};

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatRoles(rolesJson: string): string {
  try {
    const parsed = JSON.parse(rolesJson) as unknown;
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {
    /* use raw */
  }
  return rolesJson;
}

/** Excel-friendly UTF-8 CSV with BOM and full player fields for zone reports. */
export function zoneRegistrationsToExcelCsv(rows: ExportRow[]): string {
  const headers = [
    "registrationCode",
    "paymentCode",
    "playerName",
    "academyName",
    "email",
    "phone",
    "fatherName",
    "dateOfBirth",
    "roles",
    "jerseySize",
    "shoeSize",
    "address",
    "trialPlace",
    "trialZone",
    "paymentStatus",
    "coachName",
    "transactionRef",
    "achievementsAndAwards",
    "razorpayPaymentId",
    "createdAt",
    "id",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) => {
      const ext = r as ExportRow & {
        registrationCode?: string | null;
        paymentCode?: string | null;
        razorpayPaymentId?: string | null;
        achievementsAndAwards?: string | null;
      };
      return [
        ext.registrationCode ?? "",
        ext.paymentCode ?? "",
        r.playerName,
        r.academyName,
        r.email,
        r.phone,
        r.fatherName ?? "",
        r.dateOfBirth instanceof Date ? r.dateOfBirth.toISOString().slice(0, 10) : r.dateOfBirth,
        formatRoles(r.roles),
        r.jerseySize ?? "",
        r.shoeSize ?? "",
        r.address ?? "",
        r.trialZone?.trialPlace ?? "",
        r.trialZone?.zone ?? "",
        r.paymentStatus ?? "",
        r.coachName ?? "",
        r.transactionRef ?? "",
        ext.achievementsAndAwards ?? "",
        ext.razorpayPaymentId ?? "",
        r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        r.id,
      ]
        .map(csvCell)
        .join(",");
    }),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}
