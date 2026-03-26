/** Returns the device's IANA timezone string (e.g. 'America/New_York'). */
export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
