import { prisma } from "@/lib/prisma";

function assertAppConfigDelegate(): void {
  const delegate = (prisma as unknown as { appConfig?: { findUnique?: unknown } }).appConfig;
  if (typeof delegate?.findUnique === "function") return;
  throw new Error(
    "Database client is out of date after a schema change. Run: npx prisma generate && npx prisma db push — then restart npm run dev.",
  );
}

export async function getPaymentQrPath(): Promise<string | null> {
  assertAppConfigDelegate();
  const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
  return row?.paymentQrPath ?? null;
}

export async function setPaymentQrPath(path: string | null): Promise<void> {
  assertAppConfigDelegate();
  await prisma.appConfig.upsert({
    where: { id: "default" },
    update: { paymentQrPath: path },
    create: { id: "default", paymentQrPath: path },
  });
}
