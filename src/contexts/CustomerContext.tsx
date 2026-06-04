import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Customer = {
  id: string;
  name: string;
  code: string;
  is_default: boolean;
  archived_at: string | null;
};

type CustomerContextValue = {
  customers: Customer[];
  selectedCustomerId: string | null;
  selectedCustomer: Customer | null;
  setSelectedCustomerId: (id: string) => void;
  loading: boolean;
};

const STORAGE_KEY = "portal.selectedCustomerId";

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCustomerId, setSelectedCustomerIdState] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null)
  );

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, code, is_default, archived_at")
        .is("archived_at", null)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Customer[];
    },
  });

  // Default to the default customer (or first) once loaded
  useEffect(() => {
    if (customers.length === 0) return;
    const stillExists = selectedCustomerId && customers.some((c) => c.id === selectedCustomerId);
    if (!stillExists) {
      const fallback = customers.find((c) => c.is_default) ?? customers[0];
      setSelectedCustomerIdState(fallback.id);
      localStorage.setItem(STORAGE_KEY, fallback.id);
    }
  }, [customers, selectedCustomerId]);

  const setSelectedCustomerId = (id: string) => {
    setSelectedCustomerIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  return (
    <CustomerContext.Provider
      value={{
        customers,
        selectedCustomerId,
        selectedCustomer,
        setSelectedCustomerId,
        loading: isLoading,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
};