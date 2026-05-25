import { revalidatePath } from "next/cache";

/** Bust cached registration / trials pages after trial zone CRUD in admin. */
export function revalidatePublicTrialZonePages() {
  revalidatePath("/register");
  revalidatePath("/register/offline");
  revalidatePath("/trials");
}
