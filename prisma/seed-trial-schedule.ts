import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const title = "U-15 Open Trials";
  const scheduledAt = new Date("2026-06-06T09:00:00+05:30");
  const endAt = new Date("2026-06-12T18:00:00+05:30");
  const existing = await prisma.trialSchedule.findFirst({ where: { title } });
  if (existing) {
    await prisma.trialSchedule.update({
      where: { id: existing.id },
      data: {
        scheduledAt,
        endAt,
        published: true,
        sortOrder: 0,
        notes: "Report 30 minutes early with ID proof and registration confirmation.",
      },
    });
    console.log("Updated trial schedule:", title);
  } else {
    await prisma.trialSchedule.create({
      data: {
        title,
        scheduledAt,
        endAt,
        notes: "Report 30 minutes early with ID proof and registration confirmation.",
        sortOrder: 0,
        published: true,
      },
    });
    console.log("Created trial schedule:", title);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
