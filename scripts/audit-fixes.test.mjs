import assert from "node:assert/strict";
import test from "node:test";

/** Mirrors paymentOrderNeedsCompletion in registration-completion-invite.ts */
function paymentOrderNeedsCompletion(order, registrationPaymentStatus) {
  const REGISTRATION_PAYMENT_PENDING = "pending_payment";
  const enrolled = (s) => s === "paid" || s === "manual";
  if (order.status !== "paid" || !order.razorpayPaymentId) return false;
  if (!order.email?.trim()) return false;
  if (!order.registrationId) return true;
  const status = registrationPaymentStatus;
  return status === REGISTRATION_PAYMENT_PENDING || !enrolled(status);
}

test("paymentOrderNeedsCompletion: paid orphan without registration", () => {
  assert.equal(
    paymentOrderNeedsCompletion(
      { status: "paid", razorpayPaymentId: "pay_1", email: "a@b.com", registrationId: null },
      null,
    ),
    true,
  );
});

test("paymentOrderNeedsCompletion: paid with pending_payment draft", () => {
  assert.equal(
    paymentOrderNeedsCompletion(
      { status: "paid", razorpayPaymentId: "pay_1", email: "a@b.com", registrationId: "reg_1" },
      "pending_payment",
    ),
    true,
  );
});

test("paymentOrderNeedsCompletion: enrolled registration", () => {
  assert.equal(
    paymentOrderNeedsCompletion(
      { status: "paid", razorpayPaymentId: "pay_1", email: "a@b.com", registrationId: "reg_1" },
      "paid",
    ),
    false,
  );
});

test("webhook duplicate: only successful event ids should block retry", () => {
  const shouldSkip = (dup) => Boolean(dup?.success);
  assert.equal(shouldSkip({ success: true }), true);
  assert.equal(shouldSkip({ success: false }), false);
  assert.equal(shouldSkip(null), false);
});

test("sqlite url and transient error detection", () => {
  const isSqliteDatabaseUrl = (url) => {
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith("file:") || trimmed.includes("sqlite");
  };
  const isTransientDbError = (error) => {
    const msg = error instanceof Error ? error.message : String(error);
    return ["SQLITE_BUSY", "SQLITE_LOCKED", "database is locked"].some((s) => msg.toUpperCase().includes(s));
  };

  assert.equal(isSqliteDatabaseUrl("file:./dev.db"), true);
  assert.equal(isSqliteDatabaseUrl("postgresql://localhost/db"), false);
  assert.equal(isTransientDbError(new Error("SQLITE_BUSY: database is locked")), true);
  assert.equal(isTransientDbError(new Error("Unique constraint failed")), false);
});
