import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomer } from "@/contexts/CustomerContext";

const fields = [
  { key: "policy-client-id", group: "Policy", label: "Policy - Policy Client ID", hint: "Enter full Policy Client ID", type: "text" },
  { key: "postal-code", group: "Policy", label: "Policy - Postal code", hint: "Enter full postal code", type: "text" },
  { key: "email", group: "Driver", label: "Driver - Email address", hint: "Enter full email address", type: "email" },
  { key: "date-of-birth", group: "Driver", label: "Driver - Date of birth", hint: "Enter full date of birth", type: "date" },
];

const SearchUserDataPage = () => {
  const { selectedCustomer } = useCustomer();
  const [fieldKey, setFieldKey] = useState(fields[0].key);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const field = fields.find((item) => item.key === fieldKey) ?? fields[0];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <AdminLayout title="Search User Data" crumbs={[{ label: "Insurer Portal", to: "/admin/insurer" }, { label: selectedCustomer?.name ?? "Search" }]}>
      <div className="mx-auto max-w-4xl">
        <form onSubmit={submit} className="rounded-md border border-portal-border bg-portal-panel p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_auto]">
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-query" className="font-normal text-portal-muted">Query</Label>
              <Input id="search-query" type={field.type} value={query} onChange={(event) => { setQuery(event.target.value); setSubmitted(false); }} required aria-describedby="search-hint" className="rounded-none border-portal-border bg-portal-panel" />
              <p id="search-hint" className="text-xs text-portal-muted">{field.hint}</p>
            </div>
            <Button type="submit" className="gap-2 rounded-sm sm:mt-7"><Search className="h-4 w-4" />Search</Button>
          </div>
        </form>
        {submitted && <p role="status" className="mt-5 border border-portal-border bg-portal-panel p-4 text-sm text-portal-muted">User data search is not connected yet. No search has been performed.</p>}
      </div>
    </AdminLayout>
  );
};

export default SearchUserDataPage;