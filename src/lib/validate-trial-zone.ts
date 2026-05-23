import { prisma } from "@/lib/prisma";

export async function findPublishedTrialZone(id: string) {
  return prisma.trialZone.findFirst({
    where: { id, published: true },
    select: { id: true, trialPlace: true, zone: true },
  });
}
