import { loadRegistrationForPaymentOrder } from "@/lib/payment-order-registration-lookup";
import { prisma } from "@/lib/prisma";
import {
  isEnrolledPaymentStatus,
  REGISTRATION_PAYMENT_PENDING,
} from "@/lib/registration-payment-status";

export async function deletePaymentOrderForAdmin(
  paymentOrderId: string,
): Promise<{ ok: true; deletedRegistration: boolean } | { ok: false; error: string; status: number }> {
  const order = await prisma.paymentOrder.findUnique({
    where: { id: paymentOrderId },
  });

  if (!order) {
    return { ok: false, error: "Payment order not found.", status: 404 };
  }

  const registration = await loadRegistrationForPaymentOrder(order.registrationId);

  if (registration && isEnrolledPaymentStatus(registration.paymentStatus)) {
    return {
      ok: false,
      error:
        "This payment is linked to an enrolled registration. Delete the player from Registrations first if you need to remove this record.",
      status: 409,
    };
  }

  let deletedRegistration = false;

  await prisma.$transaction(async (tx) => {
    if (order.registrationId && registration) {
      if (registration.paymentStatus === REGISTRATION_PAYMENT_PENDING) {
        await tx.registration.delete({ where: { id: order.registrationId } });
        deletedRegistration = true;
      } else {
        await tx.registration.update({
          where: { id: order.registrationId },
          data: {
            razorpayOrderId: null,
            razorpayPaymentId: null,
          },
        });
      }
    }

    await tx.paymentOrder.delete({ where: { id: paymentOrderId } });
  });

  return { ok: true, deletedRegistration };
}
