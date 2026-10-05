const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Algiers",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** Always shown in Algeria time, whatever the server's timezone. */
export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

export function formatDZD(amount: number) {
  return `${amount.toLocaleString("en-US")} DZD`;
}

/** 0551234567 -> 0551 23 45 67 */
export function formatPhone(phone: string) {
  return phone.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
}
