import { prisma } from "@/lib/prisma";
import { attachTrialZoneRegistrationOpen } from "@/lib/trial-zone-registration-open";

export async function findPublishedTrialZone(id: string) {
  return prisma.trialZone.findFirst({
    where: { id, published: true },
    select: { id: true, trialPlace: true, zone: true },
  });
}

/** Trial zone eligible for new public registrations. */
export async function findRegistrationTrialZone(id: string) {
  const zone = await findPublishedTrialZone(id);
  if (!zone) return null;
  const [enriched] = await attachTrialZoneRegistrationOpen([zone]);
  return enriched.registrationOpen ? zone : null;
}
