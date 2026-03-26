/** Returns today's date as YYYY-MM-DD string. */
export function getTodayString(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Returns current month as YYYY-MM string. */
export function getCurrentMonthString(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Returns today's date in Bangkok timezone (UTC+7) as YYYY-MM-DD string. */
export function getBangkokDateString(now = new Date()): string {
  const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return `${bangkok.getUTCFullYear()}-${String(bangkok.getUTCMonth() + 1).padStart(2, '0')}-${String(bangkok.getUTCDate()).padStart(2, '0')}`;
}

/** Returns today's date in the given IANA timezone as YYYY-MM-DD string. */
export function getDateStringForTimezone(timezone: string, now = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now);
  } catch {
    // Invalid timezone — fall back to Bangkok
    return getBangkokDateString(now);
  }
}
