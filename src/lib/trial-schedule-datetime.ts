const IST_OFFSET = "+05:30";

/** Combine HTML date + time inputs as an ISO instant in India time. */
export function combineDateAndTimeIst(date: string, time: string): string {
  const d = date.trim();
  const t = time.trim() || "09:00";
  return `${d}T${t.length === 5 ? t : "09:00"}:00${IST_OFFSET}`;
}

export function splitDateTimeIst(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function formatTrialScheduleDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function formatTrialScheduleTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function calendarDayIst(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Date line for schedule cards — spans multiple days when endAt is on a later date. */
export function formatTrialScheduleDateRange(startIso: string | Date, endIso: string | Date | null): string {
  if (!endIso) return formatTrialScheduleDate(startIso);
  const start = typeof startIso === "string" ? new Date(startIso) : startIso;
  const end = typeof endIso === "string" ? new Date(endIso) : endIso;
  if (calendarDayIst(start) === calendarDayIst(end)) {
    return formatTrialScheduleDate(start);
  }
  const dayMonth: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  };
  const startPart = start.toLocaleDateString("en-IN", dayMonth);
  const endPart = end.toLocaleDateString("en-IN", { ...dayMonth, year: "numeric" });
  return `${startPart} to ${endPart}`;
}

export function formatTrialScheduleRange(startIso: string | Date, endIso: string | Date | null): string {
  if (!endIso) return formatTrialScheduleTime(startIso);
  if (calendarDayIst(startIso) !== calendarDayIst(endIso)) {
    return `From ${formatTrialScheduleTime(startIso)} (IST)`;
  }
  return `${formatTrialScheduleTime(startIso)} – ${formatTrialScheduleTime(endIso)}`;
}
