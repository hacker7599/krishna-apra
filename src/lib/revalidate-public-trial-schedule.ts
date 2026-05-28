import { revalidatePath } from "next/cache";

export function revalidatePublicTrialSchedulePages() {
  revalidatePath("/schedule");
  revalidatePath("/");
  revalidatePath("/register");
  revalidatePath("/trials");
}
