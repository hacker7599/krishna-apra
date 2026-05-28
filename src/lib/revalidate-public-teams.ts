import { revalidatePath } from "next/cache";

/** Call after admin creates, updates, or deletes a team. */
export function revalidatePublicTeamPages() {
  revalidatePath("/teams");
  revalidatePath("/");
  revalidatePath("/about");
}
