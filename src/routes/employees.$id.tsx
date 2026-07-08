import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, MapPin, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { formatDate, formatDateTime } from "@/lib/format";
import { EmployeeStatusPill, StatusPill, PriorityBadge } from "@/components/pills";
import { AddRequestDialog } from "@/components/add-request-dialog";
import { employees as employeeList } from "@/lib/mock-data";

export const Route = createFileRoute("/employees/$id")({
  loader: ({ params }) => {
    if (!employeeList.find((e) => e.id === params.id)) throw notFound();
    return { id: params.id };
  },
  head: ({ params }) => ({
    meta: [{ title: `Employee ${params.id} — Staffhub` }],
  }),
  component: EmployeePage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Employee not found.</div>
  ),
});

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="text-right font-medium">{value}</div>
    </div>
  );
}

function EmployeePage() {
  const { id } = Route.useParams();
  const emp = useStore((s) => s.employees.find((e) => e.id === id)!);
  const company = useStore((s) => s.companies.find((c) => c.code === emp.companyCode));
  const empTasks = useStore((s) =>
    s.tasks.filter((t) => t.assignedEmployeeId === id).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
  );
  const empRequests = useStore((s) =>
    s.requests.filter((r) => r.employeeId === id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
  );
  const empPayroll = useStore((s) => s.payrollIssues.filter((p) => p.employeeId === id));

  const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Link
        to="/companies/$code"
        params={{ code: emp.companyCode }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {company?.code}
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{emp.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{emp.employeeNumber}</span>
            <span>·</span>
            <span>{emp.position}</span>
            <span>·</span>
            <EmployeeStatusPill status={emp.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Contact</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <InfoRow icon={Phone} label="Phone" value={emp.phone} />
            <InfoRow icon={Mail} label="Email" value={emp.email} />
            <InfoRow icon={MapPin} label="Address" value={emp.address} />
            <div className="mt-3 border-t pt-3">
              <div className="mb-1 text-xs font-medium text-muted-foreground">Emergency contact</div>
              <div className="text-sm">{emp.emergencyContact}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Employment</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <InfoRow label="Company" value={<Link to="/companies/$code" params={{ code: emp.companyCode }} className="hover:underline">{company?.name}</Link>} />
            <InfoRow label="Assignment" value={emp.currentAssignment} />
            <InfoRow label="Position" value={emp.position} />
            <InfoRow label="Pay Rate" value={`$${emp.payRate.toFixed(2)}/hr`} />
            <InfoRow label="Hire Date" value={formatDate(emp.hireDate)} />
            <InfoRow label="Status" value={<EmployeeStatusPill status={emp.status} />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Payroll</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <InfoRow label="Direct Deposit" value={<StatusPill status={emp.directDeposit} />} />
            {empPayroll.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payroll issues.</p>
            ) : (
              empPayroll.map((p) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                      {p.issue}
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                  {p.amount && (
                    <div className="mt-1 text-xs text-muted-foreground">${p.amount.toFixed(2)}</div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold">Requests</CardTitle>
            <AddRequestDialog employeeId={emp.id} companyCode={emp.companyCode} />
          </CardHeader>
          <CardContent className="pt-0">
            {empRequests.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No requests filed. Click <span className="font-medium">Attach request</span> to log one.
              </p>
            ) : (
              <div className="divide-y">
                {empRequests.map((r) => (
                  <div key={r.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.type}</span>
                      <PriorityBadge priority={r.priority} />
                      <StatusPill status={r.status} />
                      <span className="ml-auto text-xs text-muted-foreground">
                        Submitted {formatDate(r.submittedAt)}
                        {r.assignedTo && ` · ${r.assignedTo}`}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="mt-1.5 text-sm text-foreground/90">{r.notes}</p>
                    )}
                    {r.completedAt && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed {formatDateTime(r.completedAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Task History</CardTitle></CardHeader>
          <CardContent className="pt-0">
            {empTasks.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No task history.</p>
            ) : (
              <div className="divide-y">
                {empTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 py-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">Due {formatDate(t.dueDate)}</div>
                    </div>
                    <PriorityBadge priority={t.priority} />
                    <StatusPill status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Documents & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            <p className="mb-3">
              W-2, I-9, direct deposit forms, and other documents appear here once uploaded.
            </p>
            <div className="rounded-md border bg-muted/30 p-3 text-foreground">
              {emp.notes || "No general notes yet."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
