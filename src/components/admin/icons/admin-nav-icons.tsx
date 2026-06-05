import type { ReactNode } from "react";
import type { AdminNavIcon } from "@/lib/admin-navigation";

const iconClass = "h-[18px] w-[18px] shrink-0";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      {children}
    </svg>
  );
}

const icons: Record<AdminNavIcon, ReactNode> = {
  dashboard: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h4v7H4zM10 4h4v16h-4zM16 9h4v11h-4z" />
    </Svg>
  ),
  registrations: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path strokeLinecap="round" d="M9 12h6M9 16h6" />
    </Svg>
  ),
  zoneExport: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 001 1h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
      <path strokeLinecap="round" d="M8 13h8M8 17h5" />
    </Svg>
  ),
  payments: (
    <Svg>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path strokeLinecap="round" d="M2 10h20" />
    </Svg>
  ),
  activity: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Svg>
  ),
  emails: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </Svg>
  ),
  bulkEmail: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 8v6M16 11h6" />
    </Svg>
  ),
  teams: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </Svg>
  ),
  banners: (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" d="M3 10h18M8 15h2" />
    </Svg>
  ),
  schedule: (
    <Svg>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  ),
  trials: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20c0-3.866-3.134-7-7-7s-7 3.134-7 7" />
    </Svg>
  ),
  blog: (
    <Svg>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Svg>
  ),
};

export function AdminNavIconView({ name }: { name: AdminNavIcon }) {
  return icons[name] ?? icons.dashboard;
}
