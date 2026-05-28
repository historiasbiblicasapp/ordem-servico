export function formatDate(value: string): string {
  if (!value) return "-";
  const [datePart, timePart] = value.split("T");
  const parts = datePart.split("-");
  if (parts.length !== 3) return value;
  const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
  return timePart ? `${formatted} ${timePart.slice(0, 5)}` : formatted;
}
