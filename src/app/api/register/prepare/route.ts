import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { assertRegistrationOpenApi } from "@/lib/registration-api-guard";
import { getClientIp } from "@/lib/get-client-ip";
import { parseRegistrationFormFields, saveRegistrationUploads } from "@/lib/parse-registration-form-data";
import { prepareOnlineRegistration } from "@/lib/prepare-online-registration";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { jsonFromDbError } from "@/lib/db-http-error";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const closed = assertRegistrationOpenApi();
  if (closed) return closed;

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Online payment is not available. Submit the form without Razorpay or contact the league desk." },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const limited = await checkRegisterPostRate(ip);
  if (!limited.allowed) {
    const res = NextResponse.json(
      { error: "Too many registration attempts from this network. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(limited.retryAfterSec));
    return res;
  }

  try {
    const form = await req.formData();
    const parsedResult = parseRegistrationFormFields(form);
    if (!parsedResult.ok) {
      return NextResponse.json({ error: parsedResult.error, details: parsedResult.details }, { status: 400 });
    }

    const uploads = await saveRegistrationUploads(form, {
      requirePlayerPhoto: true,
      requireIdProof: true,
      allowPaymentProof: false,
    });
    if (!uploads.ok) {
      return NextResponse.json({ error: uploads.error }, { status: 400 });
    }

    const prepared = await prepareOnlineRegistration(parsedResult.parsed, uploads.paths, ip);
    if (!prepared.ok) {
      return NextResponse.json(
        { error: prepared.error, duplicate: prepared.duplicate },
        { status: prepared.status },
      );
    }

    return NextResponse.json({
      registrationId: prepared.registrationId,
      orderId: prepared.orderId,
      amount: prepared.amount,
      currency: prepared.currency,
      keyId: prepared.keyId,
      name: prepared.name,
    });
  } catch (e) {
    console.error(e);
    return jsonFromDbError(e, "Could not save your registration. Please try again or contact the league desk.");
  }
}
