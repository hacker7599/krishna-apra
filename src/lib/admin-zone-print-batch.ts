import { listRegistrationsForAdminExport } from "@/lib/admin-registrations-query";
import { REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";

/** Max registration forms in one browser print job (performance). */
export const ADMIN_ZONE_PRINT_BATCH_MAX = 100;

export async function listPaidZoneRegistrationIdsForPrint(opts: {
  trialZoneId?: string;
  q?: string;
}): Promise<{ ids: string[]; total: number; truncated: boolean }> {
  const { rows } = await listRegistrationsForAdminExport({
    trialZoneId: opts.trialZoneId,
    paymentStatus: REGISTRATION_PAYMENT_PAID,
    q: opts.q,
  });

  const total = rows.length;
  const truncated = total > ADMIN_ZONE_PRINT_BATCH_MAX;
  const ids = rows.slice(0, ADMIN_ZONE_PRINT_BATCH_MAX).map((r) => r.id);
  return { ids, total, truncated };
}
