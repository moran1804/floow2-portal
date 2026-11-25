import type { SearchMatchingMode } from "@/hooks/useSearchMatching";

export function userSearchParameters(customerId: string, query: string, mode: SearchMatchingMode, field: string) {
  return { _customer_id: customerId, _query: query.trim(), _mode: mode, _field: field };
}