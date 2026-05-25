import type { PrismaClient } from "@prisma/client";

/** Ensure published zones use 0…n-1 and hidden zones use n… without duplicates. */
export async function renumberTrialZoneSortOrders(prisma: PrismaClient) {
  const published = await prisma.trialZone.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { trialPlace: "asc" }, { zone: "asc" }],
  });
  const hidden = await prisma.trialZone.findMany({
    where: { published: false },
    orderBy: [{ sortOrder: "asc" }, { trialPlace: "asc" }, { zone: "asc" }],
  });

  await prisma.$transaction([
    ...published.map((z, i) =>
      prisma.trialZone.update({ where: { id: z.id }, data: { sortOrder: i } }),
    ),
    ...hidden.map((z, i) =>
      prisma.trialZone.update({ where: { id: z.id }, data: { sortOrder: published.length + i } }),
    ),
  ]);

  return { published: published.length, hidden: hidden.length };
}
