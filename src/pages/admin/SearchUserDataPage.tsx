import { FormEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomer } from "@/contexts/CustomerContext";
import { searchInputType, useSearchMatching } from "@/hooks/useSearchMatching";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { userSearchParameters } from "@/lib/userSearch";

const fields = [
  { key: "policy-client-id", group: "Policy", label: "Policy - Policy Client ID", hint: "Enter full Policy Client ID", type: "text" },
  { key: "postal-code", group: "Policy", label: "Policy - Postal code", hint: "Enter full postal code", type: "text" },
  { key: "email", group: "Driver", label: "Driver - Email address", hint: "Enter full email address", type: "email" },
  { key: "date-of-birth", group: "Driver", label: "Driver - Date of birth", hint: "Enter full date of birth", type: "date" },
];

const SearchUserDataPage = () => {
  const { selectedCustomer } = useCustomer();
  const { mode } = useSearchMatching();
  const smart = mode === "smart";
  const [fieldKey, setFieldKey] = useState(fields[0].key);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Tables<"insurer_users">[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const field = fields.find((item) => item.key === fieldKey) ?? fields[0];
  useEffect(() => { setQuery(""); setSubmitted(false); setResults([]); setError(""); }, [mode, selectedCustomer?.id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer || !query.trim()) return;
    setSearching(true); setError(""); setResults([]);
    const { data, error } = await supabase.rpc("search_insurer_users", userSearchParameters(selectedCustomer.id, query, mode, fieldKey));
    setSearching(false);
    if (error) { setError("Unable to search user records. Please try again."); setSubmitted(false); return; }
    setResults(data ?? []);
    setSubmitted(true);
  };

  return (
    <AdminLayout title="Search User Data" crumbs={[{ label: "Insurer Portal", to: "/admin/insurer" }, { label: selectedCustomer?.name ?? "Search" }]}>
      <div className="mx-auto max-w-4xl">
        <form onSubmit={submit} className="rounded-md border border-portal-border bg-portal-panel p-5 sm:p-6 shadow-sm">
          <div className={`grid grid-cols-1 items-start gap-4 ${smart ? "sm:grid-cols-[minmax(0,1fr)_auto]" : "sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_auto]"}`}>
            {!smart && <div className="space-y-2">
              <Label htmlFor="search-field" className="font-normal text-portal-muted">Field</Label>
              <Select value={fieldKey} onValueChange={(value) => { setFieldKey(value); setQuery(""); setSubmitted(false); }}>
                <SelectTrigger id="search-field" className="rounded-none border-portal-border bg-portal-panel text-portal-text"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none">
                  {["Policy", "Driver"].map((group) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {fields.filter((item) => item.group === group).map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>}
            <div className="space-y-2">
              <Label htmlFor="search-query" className="font-normal text-portal-muted">{smart ? "Search user data" : "Query"}</Label>
              <Input id="search-query" type={searchInputType(mode, field.type)} placeholder={smart ? "Enter a policy ID, postal code, email address or date of birth" : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setSubmitted(false); }} required aria-describedby="search-hint" className="rounded-none border-portal-border bg-portal-panel" />
              <p id="search-hint" className="text-xs leading-relaxed text-portal-muted">{smart ? "Search by name, Policy Client ID, postal code, driver email address or date of birth. You can enter part of a value, such as part of an email address or the start of a postal code — a full exact match is not required." : field.hint}</p>
            </div>
            <Button type="submit" disabled={searching || !selectedCustomer} className="gap-2 rounded-sm sm:mt-7"><Search className="h-4 w-4" />{searching ? "Searching…" : "Search"}</Button>
          </div>
        </form>
        {error && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
        {submitted && <section className="mt-5 overflow-hidden rounded-md border border-portal-border bg-portal-panel"><h2 role="status" className="border-b border-portal-border p-4 font-semibold">{results.length} result(s) found</h2><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead className="bg-portal-panel-header"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Policy Client ID</th><th className="p-4">Account</th></tr></thead><tbody>{results.map((user) => <tr key={user.id} className="border-t border-portal-border"><td className="p-4"><Link to={`/admin/insurer/users/${user.id}`} className="font-semibold text-primary underline">{user.first_name} {user.last_name}</Link></td><td className="p-4">{user.email}</td><td className="p-4">{user.policy_client_id ?? "—"}</td><td className="p-4"><Button asChild size="sm"><Link to={`/admin/insurer/users/${user.id}`}>View account</Link></Button></td></tr>)}{!results.length && <tr><td colSpan={4} className="p-5 text-center text-portal-muted">No users match your search in this client.</td></tr>}</tbody></table></div></section>}
      </div>
    </AdminLayout>
  );
};

export default SearchUserDataPage;