// Helper function to get the ISO week number for a date.
const getWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return weekNo;
};

/**
 * Returns a unique week identifier string (e.g., "2023-W34").
 * Uses ISO 8601 week date system.
 * @param date The date to get the week identifier for.
 * @returns A string in the format "YYYY-Www".
 */
export const getWeekId = (date: Date): string => {
  const year = date.getUTCFullYear(); // Use UTC year for ISO week consistency
  const weekNumber = getWeek(date);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

/**
 * Gets the start date of the week for a given date.
 * @param date The date within the target week.
 * @param startDay The day the week starts on (0 for Sunday, 1 for Monday, etc.). Defaults to 1 (Monday).
 * @returns A Date object representing the start of the week at 00:00:00.
 */
export const getStartOfWeek = (date: Date, startDay: number = 1): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 for Sunday, 1 for Monday, ...
  const diff = d.getDate() - day + (day === 0 && startDay !== 0 ? -6 : startDay); // Adjust diff based on startDay
  
  const startDate = new Date(d.setDate(diff));
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};


/**
 * Gets the end date of the week for a given date.
 * @param date The date within the target week.
 * @param startDay The day the week starts on (0 for Sunday, 1 for Monday, etc.). Defaults to 1 (Monday).
 * @returns A Date object representing the end of the week at 23:59:59.999.
 */
export const getEndOfWeek = (date: Date, startDay: number = 1): Date => {
  const startDate = getStartOfWeek(date, startDay);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};