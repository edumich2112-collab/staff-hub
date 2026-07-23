import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { AddCompanyDialog } from "@/components/add-company-dialog";

export const Route = createFileRoute("/companies/")({
  head: () => ({ meta: [{ title: "Companies — Staffhub" }] }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const companies = useStore((s) => s.companies);
  const employees = useStore((s) => s.employees);
  const [q, setQ] = useState("");

  const enriched = useMemo(
    () =>
      companies.map((c) => {
        const emps = employees.filter((e) => e.companyCode === c.code);
        return {
          ...c,
          active: emps.filter((e) => e.status === "Active").length,
          pending: emps.filter((e) => e.status === "Pending Start").length,
          total: emps.length,
        };
      }),
    [companies, employees],
  );

  const filtered = enriched.filter((c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.code.toLowerCase().includes(s) ||
      c.location.toLowerCase().includes(s)
    );
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} clients</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search companies…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <AddCompanyDialog />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => (
          <Link key={c.code} to="/companies/$code" params={{ code: c.code }}>
            <Card className="group h-full transition-shadow hover:shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {c.code}
                  </span>
                </div>
                <div className="mt-4 font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.location}</div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                  <div>
                    <div className="text-sm font-semibold">{c.active}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{c.pending}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{c.total}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end text-xs font-medium text-muted-foreground group-hover:text-primary">
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
