import type { Metadata } from "next";
import { AdminTrialScheduleManager } from "@/components/admin/admin-trial-schedule-manager";

export const metadata: Metadata = {
  title: "Trial schedule · Admin",
  robots: { index: false, follow: false },
};

export default function AdminTrialSchedulePage() {
  return <AdminTrialScheduleManager />;
}
