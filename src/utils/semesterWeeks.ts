/**
 * Utilities for semester week calculations, day-date mapping, and formatting.
 */

export interface WeekDayInfo {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  date: Date;
  dateStr: string; // YYYY-MM-DD
  formattedDate: string; // DD-MM-YYYY (e.g. 12-08-2026)
  dayWithDate: string; // "Monday (12-08-2026)"
}

export interface WeekRange {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  startStr: string; // YYYY-MM-DD
  endStr: string; // YYYY-MM-DD
  rangeLabel: string; // e.g. "12-08-2026 - 18-08-2026"
}

const DAYS_OF_WEEK: Array<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"> = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function padZero(num: number): string {
  return String(num).padStart(2, "0");
}

export function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = padZero(date.getMonth() + 1);
  const d = padZero(date.getDate());
  return `${y}-${m}-${d}`;
}

export function formatDateToDDMMYYYY(date: Date): string {
  const d = padZero(date.getDate());
  const m = padZero(date.getMonth() + 1);
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Normalizes a date string to start of day in local time.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Align date to the Monday of its week.
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Computes total number of weeks in a date range.
 */
export function getTotalWeeks(
  startDateStr?: string,
  endDateStr?: string,
  defaultWeeks = 15
): number {
  if (!startDateStr || !endDateStr) return defaultWeeks;
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime <= 0) return defaultWeeks;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.ceil(diffDays / 7);
  return Math.max(1, weeks);
}

/**
 * Computes the current academic week number (1-indexed).
 */
export function getCurrentWeekNumber(
  startDateStr?: string,
  endDateStr?: string,
  totalWeeks = 15
): number {
  if (!startDateStr) return 1;
  const start = getMondayOfWeek(parseLocalDate(startDateStr));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today < start) return 1;

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;

  const maxWeeks = getTotalWeeks(startDateStr, endDateStr, totalWeeks);
  return Math.min(Math.max(1, weekNum), maxWeeks);
}

/**
 * Computes the date range for a specific week number (1-indexed).
 */
export function getWeekRange(
  startDateStr?: string,
  weekNumber = 1
): WeekRange {
  const baseStart = startDateStr
    ? getMondayOfWeek(parseLocalDate(startDateStr))
    : getMondayOfWeek(new Date());

  const weekStart = new Date(baseStart);
  weekStart.setDate(baseStart.getDate() + (weekNumber - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday end of week

  return {
    weekNumber,
    startDate: weekStart,
    endDate: weekEnd,
    startStr: formatDateToYYYYMMDD(weekStart),
    endStr: formatDateToYYYYMMDD(weekEnd),
    rangeLabel: `${formatDateToDDMMYYYY(weekStart)} to ${formatDateToDDMMYYYY(weekEnd)}`,
  };
}

/**
 * Returns Monday through Saturday info with dates for a given week.
 */
export function getWeekDayDates(weekStartDate: Date): WeekDayInfo[] {
  const monday = getMondayOfWeek(weekStartDate);

  return DAYS_OF_WEEK.map((dayName, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dateStr = formatDateToYYYYMMDD(dayDate);
    const formattedDate = formatDateToDDMMYYYY(dayDate);
    return {
      day: dayName,
      date: dayDate,
      dateStr,
      formattedDate,
      dayWithDate: `${dayName} (${formattedDate})`,
    };
  });
}

