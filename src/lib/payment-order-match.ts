import { normalizePhone } from "@/lib/normalize-phone";

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function normName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function paymentOrderMatchesRegistrant(
  order: { email?: string | null; phone?: string | null; playerName?: string | null },
  registrant: { email: string; phone: string; playerName: string },
): boolean {
  if (order.email && normEmail(order.email) !== normEmail(registrant.email)) return false;
  if (order.phone && normalizePhone(order.phone) !== normalizePhone(registrant.phone)) return false;
  if (order.playerName && normName(order.playerName) !== normName(registrant.playerName)) return false;
  return true;
}

export function paymentOrderMismatchMessage(): string {
  return "Payment does not match this registration (name, email, or phone). Use the same details you used when paying.";
}
