import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);
  const requests = useStore((s) => s.requests);

  const items = useMemo(() => {
    return {
      companies: companies.slice(0, 50),
      employees: employees.slice(0, 200),
      requestNotes: requests.filter((r) => r.notes.trim().length > 0).slice(0, 100),
    };
  }, [employees, companies, requests]);

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-sm text-muted-foreground shadow-soft transition-colors hover:border-ring/40"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search employees, companies, phone…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search everything…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Companies">
            {items.companies.map((c) => (
              <CommandItem
                key={c.code}
                value={`${c.code} ${c.name} ${c.location}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/companies/$code", params: { code: c.code } });
                }}
              >
                <Building className="text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.code} · {c.location}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Employees">
            {items.employees.map((e) => (
              <CommandItem
                key={e.id}
                value={`${e.name} ${e.employeeNumber} ${e.phone} ${e.companyCode}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/employees/$id", params: { id: e.id } });
                }}
              >
                <UserIcon className="text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.employeeNumber} · {e.phone} · {e.companyCode}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

import { Building, User as UserIcon } from "lucide-react";
