import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { SearchMatchingMode } from "@/hooks/useSearchMatching";
import { userSearchParameters } from "@/lib/userSearch";

export function useUserSearch(customerId: string | undefined, query: string, mode: SearchMatchingMode, field: string) {
  const [results, setResults] = useState<Tables<"insurer_users">[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const submit = useCallback(async () => {
    clearTimeout(timer.current);
    const request = ++generation.current;
    if (!customerId || !query.trim()) return;
    setSearching(true);
    setSubmitted(false);
    setError("");
    setResults([]);
    try {
      const response = await supabase.rpc("search_insurer_users", userSearchParameters(customerId, query, mode, field));
      if (request !== generation.current) return;
      if (response.error) throw response.error;
      setResults(response.data ?? []);
      setSubmitted(true);
    } catch {
      if (request === generation.current) setError("Unable to search user records. Please try again.");
    } finally {
      if (request === generation.current) setSearching(false);
    }
  }, [customerId, query, mode, field]);

  useEffect(() => {
    ++generation.current;
    setResults([]);
    setSubmitted(false);
    setError("");
    setSearching(false);
    if (mode === "smart" && customerId && query.trim()) {
      setSearching(true);
      timer.current = setTimeout(() => { void submit(); }, 300);
    }
    return () => {
      clearTimeout(timer.current);
      ++generation.current;
    };
  }, [customerId, query, mode, field, submit]);

  return { results, searching, submitted, error, submit };
}