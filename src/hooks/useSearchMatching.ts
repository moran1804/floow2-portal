import { useEffect, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

export type SearchMatchingMode = "exact" | "smart";
export const searchMatchingKey = (customerId: string) => `portal.searchMatching.${customerId}`;
export function readSearchMatching(customerId: string | null): SearchMatchingMode {
  if (!customerId) return "exact";
  return localStorage.getItem(searchMatchingKey(customerId)) === "smart" ? "smart" : "exact";
}
export const searchInputType = (mode: SearchMatchingMode, fieldType: string) => mode === "smart" ? "text" : fieldType;

export function useSearchMatching() {
  const { selectedCustomerId } = useCustomer();
  const [mode, setMode] = useState<SearchMatchingMode>(() => readSearchMatching(selectedCustomerId));
  useEffect(() => {
    const refresh = () => setMode(readSearchMatching(selectedCustomerId));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("portal-search-matching", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("portal-search-matching", refresh);
    };
  }, [selectedCustomerId]);
  const saveMode = (value: SearchMatchingMode) => {
    if (!selectedCustomerId) return;
    localStorage.setItem(searchMatchingKey(selectedCustomerId), value);
    setMode(value);
    window.dispatchEvent(new Event("portal-search-matching"));
  };
  return { mode, saveMode };
}