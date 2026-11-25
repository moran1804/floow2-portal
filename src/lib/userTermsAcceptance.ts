export interface RawAcceptanceRow {
  id: string;
  accepted_at: string;
  terms_versions: { version: string; customer_id: string; products: { code: string } | null } | null;
}

export interface AcceptanceRow {
  id: string;
  accepted_at: string;
  version: string;
  product_code: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Renders an accepted timestamp as "5 Oct 2026 - 8.00pm" in the viewer's timezone. */
export function formatAcceptedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const hours24 = date.getHours();
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} - ${hours}.${minutes}${suffix}`;
}

/** Keeps only the acceptances whose T&Cs version belongs to the selected client. */
export function scopeAcceptanceRows(rows: RawAcceptanceRow[], customerId: string | null): AcceptanceRow[] {
  if (!customerId) return [];
  return rows
    .filter((row) => row.terms_versions?.customer_id === customerId)
    .map((row) => ({
      id: row.id,
      accepted_at: row.accepted_at,
      version: row.terms_versions?.version ?? "—",
      product_code: row.terms_versions?.products?.code ?? "—",
    }));
}
