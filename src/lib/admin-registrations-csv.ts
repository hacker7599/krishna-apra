import type { RegistrationListRow } from "@/lib/admin-registrations-query";

type ExportRow = RegistrationListRow & {
  trialZone?: { trialPlace: string; zone: string } | null;
};

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function registrationsToCsv(rows: ExportRow[]): string {
  const headers = [
    "id",
    "createdAt",
    "registrationCode",
    "playerName",
    "academyName",
    "email",
    "phone",
    "trialPlace",
    "trialZone",
    "dateOfBirth",
    "paymentStatus",
    "razorpayPaymentId",
    "razorpayOrderId",
    "fatherName",
    "coachName",
    "transactionRef",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        (r as { registrationCode?: string | null }).registrationCode ?? "",
        r.playerName,
        r.academyName,
        r.email,
        r.phone,
        r.trialZone?.trialPlace ?? "",
        r.trialZone?.zone ?? "",
        r.dateOfBirth instanceof Date ? r.dateOfBirth.toISOString().slice(0, 10) : r.dateOfBirth,
        r.paymentStatus ?? "",
        (r as { razorpayPaymentId?: string | null }).razorpayPaymentId ?? "",
        (r as { razorpayOrderId?: string | null }).razorpayOrderId ?? "",
        r.fatherName ?? "",
        r.coachName ?? "",
        r.transactionRef ?? "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  return lines.join("\n");
}
