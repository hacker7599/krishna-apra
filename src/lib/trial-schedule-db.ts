import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma, trialScheduleDelegateReady } from "@/lib/prisma";

const TRIAL_SCHEDULE_SETUP =
  "Trial schedule is not available. Run `npx prisma db push && npx prisma generate`, then restart the dev server.";

export function trialScheduleReady(): boolean {
  return trialScheduleDelegateReady(getPrisma());
}

/** Use at the top of trial-schedule API handlers when the delegate must exist. */
export function trialScheduleNotReadyResponse(): NextResponse | null {
  if (trialScheduleReady()) return null;
  return NextResponse.json({ error: TRIAL_SCHEDULE_SETUP }, { status: 503 });
}

export async function countTrialSchedules(where?: Prisma.TrialScheduleWhereInput): Promise<number> {
  if (!trialScheduleReady()) return 0;
  return getPrisma().trialSchedule.count({ where });
}
