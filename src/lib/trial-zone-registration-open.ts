import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TrialZoneRegistrationMode = "prisma" | "raw" | "legacy";

let cachedMode: TrialZoneRegistrationMode | null = null;

function isUnknownRegistrationOpenError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientValidationError)) return false;
  return error.message.includes("registrationOpen");
}

export async function trialZoneRegistrationOpenColumnExists(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
      `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'TrialZone' AND COLUMN_NAME = 'registrationOpen'`,
    );
    return Number(rows[0]?.c ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function getTrialZoneRegistrationMode(): Promise<TrialZoneRegistrationMode> {
  if (cachedMode) return cachedMode;

  try {
    await prisma.trialZone.findFirst({
      select: { registrationOpen: true },
      take: 1,
    });
    cachedMode = "prisma";
    return cachedMode;
  } catch (error) {
    if (!isUnknownRegistrationOpenError(error)) throw error;
  }

  if (await trialZoneRegistrationOpenColumnExists()) {
    console.warn(
      "[trial-zones] Prisma client is out of date for registrationOpen. Run: npm run db:generate — using raw SQL.",
    );
    cachedMode = "raw";
    return cachedMode;
  }

  cachedMode = "legacy";
  return cachedMode;
}

export function normalizeRegistrationOpen(value: boolean | null | undefined): boolean {
  return value !== false;
}

export async function setTrialZoneRegistrationOpen(id: string, registrationOpen: boolean): Promise<void> {
  const mode = await getTrialZoneRegistrationMode();
  if (mode === "prisma") {
    await prisma.trialZone.update({ where: { id }, data: { registrationOpen } });
    return;
  }
  if (mode === "raw") {
    await prisma.$executeRawUnsafe(
      `UPDATE \`TrialZone\` SET \`registrationOpen\` = ? WHERE \`id\` = ?`,
      registrationOpen ? 1 : 0,
      id,
    );
    return;
  }
  throw new Error(
    "Trial zone registration toggle is not available. Run: npm run db:add-trial-zone-registration-open && npm run db:generate",
  );
}

/** Force all zones open (fixes accidental mass-close). Safe to run anytime. */
export async function ensureAllTrialZonesRegistrationOpen(): Promise<number> {
  const mode = await getTrialZoneRegistrationMode();
  if (mode === "legacy") return 0;
  if (mode === "prisma") {
    const result = await prisma.trialZone.updateMany({
      where: { registrationOpen: false },
      data: { registrationOpen: true },
    });
    return result.count;
  }
  const result = await prisma.$executeRawUnsafe(
    `UPDATE \`TrialZone\` SET \`registrationOpen\` = 1 WHERE \`registrationOpen\` = 0`,
  );
  return typeof result === "number" ? result : 0;
}

export function resetTrialZoneRegistrationModeCache(): void {
  cachedMode = null;
}

type TrialZoneRow = {
  id: string;
  registrationOpen?: boolean | null;
};

/** Attach registrationOpen from DB (callers often omit the field in Prisma select). */
export async function attachTrialZoneRegistrationOpen<T extends TrialZoneRow>(items: T[]): Promise<Array<T & { registrationOpen: boolean }>> {
  const mode = await getTrialZoneRegistrationMode();
  if (mode === "legacy") {
    return items.map((z) => ({ ...z, registrationOpen: true }));
  }
  if (items.length === 0) return [];

  const ids = items.map((z) => z.id);
  const map =
    mode === "prisma"
      ? new Map(
          (
            await prisma.trialZone.findMany({
              where: { id: { in: ids } },
              select: { id: true, registrationOpen: true },
            })
          ).map((f) => [f.id, normalizeRegistrationOpen(f.registrationOpen)]),
        )
      : new Map(
          (
            await prisma.$queryRawUnsafe<Array<{ id: string; registrationOpen: number }>>(
              `SELECT id, registrationOpen FROM TrialZone WHERE id IN (${ids.map(() => "?").join(", ")})`,
              ...ids,
            )
          ).map((f) => [f.id, f.registrationOpen === 1]),
        );

  return items.map((z) => ({ ...z, registrationOpen: map.get(z.id) ?? true }));
}
