import type { FaqItem } from "@/components/faq-accordion";
import { PLAYER_AGE_CUTOFF_DATE, TRIAL_FEE_INR, VENUE } from "@/lib/league";

export const REGISTRATION_FAQ: FaqItem[] = [
  {
    question: "Who can register?",
    answer: `Players in the Under-15 category for Season 1. Date of birth must be after ${PLAYER_AGE_CUTOFF_DATE} (age cut-off as per official trial form).`,
  },
  {
    question: "What is the trial registration fee?",
    answer: `The trial registration fee is ₹${TRIAL_FEE_INR.toLocaleString("en-IN")}. Upload payment proof and transaction reference in the online form to speed up verification.`,
  },
  {
    question: "Where are trials held?",
    answer: `Trial zones across Delhi NCR are listed on the Trials page with addresses and map links. Primary venue: ${VENUE}.`,
  },
  {
    question: "Should I list achievements and awards?",
    answer:
      "Yes, if the player has district, state, school, or academy honours — use the optional field on the form. It helps scouts and selectors review the profile during trials.",
  },
  {
    question: "Can I submit a paper form instead?",
    answer: "Yes. Download the printable offline form from the registration page, fill it in, and submit at your academy or the league desk — same fields as the digital form.",
  },
];
