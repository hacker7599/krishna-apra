/** Modular admin portal navigation — single source for sidebar, breadcrumbs, and page titles. */

export type AdminNavIcon =
  | "dashboard"
  | "registrations"
  | "zoneExport"
  | "payments"
  | "activity"
  | "emails"
  | "bulkEmail"
  | "teams"
  | "banners"
  | "schedule"
  | "trials"
  | "blog";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIcon;
  description?: string;
};

export type AdminNavModule = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_MODULES: AdminNavModule[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard", description: "Overview & KPIs" },
      {
        href: "/admin/registrations",
        label: "Registrations",
        icon: "registrations",
        description: "Players, proofs, receipts",
      },
      {
        href: "/admin/zone-export",
        label: "Zone export",
        icon: "zoneExport",
        description: "Paid players by trial zone — Excel export",
      },
      { href: "/admin/payments", label: "Payment logs", icon: "payments", description: "Orders & Razorpay events" },
      { href: "/admin/activity", label: "Activity log", icon: "activity", description: "Admin audit trail" },
      { href: "/admin/emails", label: "Email log", icon: "emails", description: "SMTP delivery log" },
      {
        href: "/admin/bulk-email",
        label: "Bulk email",
        icon: "bulkEmail",
        description: "Trial zone updates & document reminders",
      },
    ],
  },
  {
    id: "content",
    label: "Site content",
    items: [
      { href: "/admin/teams", label: "Teams", icon: "teams", description: "Franchise listings" },
      { href: "/admin/banners", label: "Hero banners", icon: "banners", description: "Homepage carousel" },
      { href: "/admin/schedule", label: "Trial schedule", icon: "schedule", description: "Dates on /schedule" },
      { href: "/admin/trials", label: "Trial zones", icon: "trials", description: "Venues on /trials" },
      { href: "/admin/blog", label: "Blog", icon: "blog", description: "Articles & SEO" },
    ],
  },
];

export const ADMIN_PAGE_META: Record<string, { title: string; subtitle: string; module: string }> = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Registrations, revenue, and site health at a glance",
    module: "Operations",
  },
  "/admin/registrations": {
    title: "Registrations",
    subtitle: "Review sign-ups, verify payments, and manage player records",
    module: "Operations",
  },
  "/admin/zone-export": {
    title: "Export by trial zone",
    subtitle: "Paid registrations only — filter by zone and download Excel",
    module: "Operations",
  },
  "/admin/payments": {
    title: "Payment logs",
    subtitle: "Razorpay orders, pending payment reminders, and checkout events",
    module: "Operations",
  },
  "/admin/activity": {
    title: "Activity log",
    subtitle: "Who changed what across league data",
    module: "Operations",
  },
  "/admin/emails": {
    title: "Email log",
    subtitle: "Confirmation and notification delivery history",
    module: "Operations",
  },
  "/admin/bulk-email": {
    title: "Bulk email",
    subtitle: "Send trial zone and document instructions to registered players",
    module: "Operations",
  },
  "/admin/teams": {
    title: "Teams",
    subtitle: "Franchise cards on the public teams page",
    module: "Site content",
  },
  "/admin/banners": {
    title: "Hero banners",
    subtitle: "Homepage carousel slides and CTAs",
    module: "Site content",
  },
  "/admin/schedule": {
    title: "Trial schedule",
    subtitle: "Published dates and reporting times",
    module: "Site content",
  },
  "/admin/trials": {
    title: "Trial zones",
    subtitle: "Venues, addresses, and map links",
    module: "Site content",
  },
  "/admin/blog": {
    title: "Blog",
    subtitle: "Posts, excerpts, and publishing controls",
    module: "Site content",
  },
};

export function getAdminPageMeta(pathname: string) {
  const exact = ADMIN_PAGE_META[pathname];
  if (exact) return exact;

  const match = Object.entries(ADMIN_PAGE_META)
    .filter(([path]) => path !== "/admin" && pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return match?.[1] ?? ADMIN_PAGE_META["/admin"];
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  for (const mod of ADMIN_NAV_MODULES) {
    for (const item of mod.items) {
      if (isAdminNavActive(pathname, item.href)) return item;
    }
  }
  return undefined;
}
