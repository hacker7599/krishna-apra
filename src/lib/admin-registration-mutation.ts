import type { Prisma } from "@prisma/client";
import { PLAYER_AGE_CUTOFF_DATE } from "@/lib/league";
import { normalizePhone } from "@/lib/normalize-phone";
import { prisma } from "@/lib/prisma";
import type { registrationAdminCreateSchema, registrationAdminPatchSchema } from "@/lib/admin-entity-schemas";
import type { z } from "zod";

export type AdminRegistrationCreateInput = z.infer<typeof registrationAdminCreateSchema>;
export type AdminRegistrationPatchInput = z.infer<typeof registrationAdminPatchSchema>;

export function assertEligibleDateOfBirth(dateOfBirth: string): string | null {
  if (dateOfBirth <= PLAYER_AGE_CUTOFF_DATE) {
    return `Players must be born after ${PLAYER_AGE_CUTOFF_DATE} (trial form age cut-off).`;
  }
  return null;
}

export async function findDuplicateRegistrationExcluding(
  email: string,
  phone: string,
  excludeId?: string,
): Promise<{ matched: "email" | "phone" } | null> {
  const emailNorm = email.toLowerCase().trim();
  const phoneNorm = normalizePhone(phone);

  const byEmail = await prisma.registration.findFirst({
    where: {
      email: emailNorm,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (byEmail) return { matched: "email" };

  const candidates = await prisma.registration.findMany({
    where: {
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      OR: [{ phone: phoneNorm }, { phone: { contains: phoneNorm } }],
    },
    select: { id: true, phone: true },
    take: 30,
  });
  if (candidates.some((r) => normalizePhone(r.phone) === phoneNorm)) {
    return { matched: "phone" };
  }

  return null;
}

export function buildRegistrationCreateData(input: AdminRegistrationCreateInput): Prisma.RegistrationCreateInput {
  const dob = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
  return {
    academyName: input.academyName,
    playerName: input.playerName,
    dateOfBirth: dob,
    roles: JSON.stringify(input.roles),
    ...(input.trialZoneId?.trim()
      ? { trialZone: { connect: { id: input.trialZoneId.trim() } } }
      : {}),
    email: input.email.toLowerCase().trim(),
    phone: normalizePhone(input.phone),
    fatherName: input.fatherName,
    address: input.address,
    jerseySize: input.jerseySize,
    shoeSize: input.shoeSize,
    idDocumentType: input.idDocumentType,
    achievementsAndAwards: input.achievementsAndAwards?.trim() || null,
    transactionRef: input.transactionRef?.trim() || null,
    feeReceivedDate: input.feeReceivedDate?.trim() || null,
    coachName: input.coachName?.trim() || null,
    paymentStatus: input.paymentStatus ?? "manual",
    idProofPath: null,
    paymentProofPath: null,
  };
}

export function buildRegistrationPatchData(input: AdminRegistrationPatchInput): Prisma.RegistrationUpdateInput {
  const data: Prisma.RegistrationUpdateInput = {};

  if (input.academyName !== undefined) data.academyName = input.academyName;
  if (input.playerName !== undefined) data.playerName = input.playerName;
  if (input.dateOfBirth !== undefined) {
    data.dateOfBirth = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
  }
  if (input.roles !== undefined) data.roles = JSON.stringify(input.roles);
  if (input.trialZoneId !== undefined) {
    data.trialZone = input.trialZoneId?.trim()
      ? { connect: { id: input.trialZoneId.trim() } }
      : { disconnect: true };
  }
  if (input.email !== undefined) data.email = input.email.toLowerCase().trim();
  if (input.phone !== undefined) data.phone = normalizePhone(input.phone);
  if (input.fatherName !== undefined) data.fatherName = input.fatherName;
  if (input.address !== undefined) data.address = input.address;
  if (input.jerseySize !== undefined) data.jerseySize = input.jerseySize;
  if (input.shoeSize !== undefined) data.shoeSize = input.shoeSize;
  if (input.idDocumentType !== undefined) data.idDocumentType = input.idDocumentType;
  if (input.achievementsAndAwards !== undefined) {
    data.achievementsAndAwards = input.achievementsAndAwards?.trim() || null;
  }
  if (input.transactionRef !== undefined) data.transactionRef = input.transactionRef?.trim() || null;
  if (input.feeReceivedDate !== undefined) data.feeReceivedDate = input.feeReceivedDate?.trim() || null;
  if (input.coachName !== undefined) data.coachName = input.coachName?.trim() || null;
  if (input.paymentStatus !== undefined) data.paymentStatus = input.paymentStatus;

  return data;
}
