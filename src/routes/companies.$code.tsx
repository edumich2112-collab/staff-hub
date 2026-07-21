import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { store, useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/pills";
import { companies as companyList, type Employee, type EmployeeStatus } from "@/lib/mock-data";
import { AddPayrollDialog } from "@/components/add-payroll-dialog";
import { AddRequestDialog } from "@/components/add-request-dialog";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { EditRequestDialog } from "@/components/edit-request-dialog";
import { EditPayrollDialog } from "@/components/edit-payroll-dialog";

const STATUSES: EmployeeStatus[] = ["Active", "Pending Start", "On Assignment", "Former"];

export const Route = createFileRoute("/companies/$code")({
  loader: ({ params }) => {
    const c = companyList.find((c) => c.code === params.code);
    if (!c) throw notFound();
    return { code: params.code };
  },
  head: ({ params }) => ({ meta: [{ title: `${params.code} — Staffhub` }] }),
  component: CompanyPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Company not found.</div>
  ),
});

function CompanyPage() {
  const { code } = Route.useParams();
  const allCompanies = useStore((s) => s.companies);
  const allEmployees = useStore((s) => s.employees);
  const allRequests = useStore((s) => s.requests);
  const allPayroll = useStore((s) => s.payrollIssues);
  const [q, setQ] = useState("");

  const company = allCompanies.find((c) => c.code === code)!;
  const employees = useMemo(
    () => allEmployees.filter((e) => e.companyCode === code),
    [allEmployees, code],
  );
  const requests = useMemo(
    () => allRequests.filter((r) => r.companyCode === code),
    [allRequests, code],
  );
  const payroll = useMemo(
    () => allPayroll.filter((p) => p.companyCode === code),
    [allPayroll, code],
  );

  const active = employees.filter((e) => e.status === "Active");
  const pending = employees.filter((e) => e.status === "Pending Start");
  const former = employees.filter((e) => e.status === "Former");
  const filtered = useMemo(() => {
    if (!q) return employees;
    const s = q.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.employeeNumber.toLowerCase().includes(s) ||
        e.phone.includes(s) ||
        e.position.toLowerCase().includes(s) ||
        e.notes.toLowerCase().includes(s),
    );
  }, [employees, q]);

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";
  const filteredIds = useMemo(() => new Set(filtered.map((e) => e.id)), [filtered]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All companies
      </Link>

      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {company.code}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{company.location}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Active" value={active.length} />
        <Stat label="Pending Starts" value={pending.length} />
        <Stat label="Payroll Issues" value={payroll.filter((p) => p.status === "Open").length} />
        <Stat label="Open Requests" value={requests.filter((r) => r.status !== "Resolved").length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, number, phone, position, notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mb-3 max-w-md"
            />
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                <TabsTrigger value="former">Former ({former.length})</TabsTrigger>
                <TabsTrigger value="all">All results ({filtered.length})</TabsTrigger>
              </TabsList>
              {[
                { key: "active", data: active.filter((e) => filteredIds.has(e.id)) },
                { key: "pending", data: pending.filter((e) => filteredIds.has(e.id)) },
                { key: "former", data: former.filter((e) => filteredIds.has(e.id)) },
                { key: "all", data: filtered },
              ].map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className="mt-3">
                  <EmployeeTable rows={tab.data} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Company Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {company.notes || "No notes yet."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold">Payroll Issues</CardTitle>
              <AddPayrollDialog companyCode={code} triggerLabel="Add" />
            </CardHeader>
            <CardContent className="space-y-2">
              {payroll.length === 0 && (
                <p className="text-sm text-muted-foreground">No payroll issues.</p>
              )}
              {payroll.map((p) => (
                <EditPayrollDialog key={p.id} payroll={p}>
                  <button className="w-full rounded-md border p-3 text-left transition-colors hover:border-ring/40 hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{p.issue}</div>
                      <StatusPill status={p.status} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {empName(p.employeeId)}
                      {p.amount && ` · $${p.amount.toFixed(2)}`}
                    </div>
                  </button>
                </EditPayrollDialog>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold">Employee Requests</CardTitle>
              <AddRequestDialog companyCode={code} triggerLabel="Add" />
            </CardHeader>
            <CardContent className="space-y-2">
              {requests.length === 0 && (
                <p className="text-sm text-muted-foreground">No requests.</p>
              )}
              {requests.map((r) => (
                <div key={r.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium">{r.type}</div>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {empName(r.employeeId)} · {formatDate(r.submittedAt)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold">Quick add</CardTitle>
            </CardHeader>
            <CardContent>
              <AddTaskDialog companyCode={code} triggerLabel="New task for this client" variant="outline" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function EmployeeTable({ rows }: { rows: Employee[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Pay Rate</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead className="w-[210px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell>
              <Link
                to="/employees/$id"
                params={{ id: e.id }}
                className="font-medium hover:text-primary hover:underline"
              >
                {e.name}
              </Link>
              <div className="text-[11px] text-muted-foreground">{e.employeeNumber}</div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{e.phone || "—"}</TableCell>
            <TableCell className="text-sm">{e.position}</TableCell>
            <TableCell className="text-sm">${e.payRate.toFixed(2)}/hr</TableCell>
            <TableCell className="text-sm">
              {e.status === "Pending Start" && e.scheduledStartDate
                ? `Starts ${formatDate(e.scheduledStartDate)}`
                : e.hireDate
                  ? formatDate(e.hireDate)
                  : "—"}
            </TableCell>
            <TableCell>
              <StatusEditor employee={e} />
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
              No employees.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function StatusEditor({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={employee.status}
        onValueChange={(v) =>
          store.updateEmployee(employee.id, {
            status: v as EmployeeStatus,
            scheduledStartDate:
              v === "Pending Start" ? employee.scheduledStartDate : undefined,
          })
        }
      >
        <SelectTrigger className="h-7 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {employee.status === "Pending Start" && (
        <input
          type="date"
          value={employee.scheduledStartDate ?? ""}
          onChange={(ev) =>
            store.updateEmployee(employee.id, { scheduledStartDate: ev.target.value })
          }
          className="h-7 rounded-md border bg-background px-1.5 text-xs"
        />
      )}
    </div>
  );
}
