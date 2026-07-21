import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, ShieldAlert, FileText, CheckCircle2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, store } from "@/lib/store";
import { formatDate, formatDateTime } from "@/lib/format";
import { EmployeeStatusPill, StatusPill, PriorityBadge } from "@/components/pills";
import { AddRequestDialog } from "@/components/add-request-dialog";
import { AddPayrollDialog } from "@/components/add-payroll-dialog";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { EditRequestDialog } from "@/components/edit-request-dialog";
import { EditPayrollDialog } from "@/components/edit-payroll-dialog";
import { Pencil } from "lucide-react";
import { employees as employeeList } from "@/lib/mock-data";
import type { RequestStatus } from "@/lib/mock-data";


export const Route = createFileRoute("/employees/$id")({
  loader: ({ params }) => {
    if (!employeeList.find((e) => e.id === params.id)) throw notFound();
    return { id: params.id };
  },
  head: ({ params }) => ({
    meta: [{ title: `Employee ${params.id} — Staffhub` }],
  }),
  component: EmployeePage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      {error?.message ?? "Something went wrong."}
    </div>
  ),
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
  const emp = useStore((s) => s.employees.find((e) => e.id === id));
  const company = useStore((s) => s.companies.find((c) => c.code === emp?.companyCode));
  const allTasks = useStore((s) => s.tasks);
  const allRequests = useStore((s) => s.requests);
  const allPayroll = useStore((s) => s.payrollIssues);

  const empTasks = useMemo(
    () => allTasks.filter((t) => t.assignedEmployeeId === id).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [allTasks, id],
  );
  const empRequests = useMemo(
    () => allRequests.filter((r) => r.employeeId === id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [allRequests, id],
  );
  const empPayroll = useMemo(
    () => allPayroll.filter((p) => p.employeeId === id),
    [allPayroll, id],
  );

  if (!emp) {
    return <div className="p-10 text-center text-muted-foreground">Employee not found.</div>;
  }


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
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold">Payroll</CardTitle>
            <AddPayrollDialog employeeId={emp.id} companyCode={emp.companyCode} triggerLabel="Add issue" />
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <InfoRow label="Direct Deposit" value={<StatusPill status={emp.directDeposit} />} />
            {empPayroll.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payroll issues.</p>
            ) : (
              empPayroll.map((p) => (
                <EditPayrollDialog key={p.id} payroll={p}>
                  <button className="w-full rounded-md border p-3 text-left transition-colors hover:border-ring/40 hover:bg-muted/30">
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
                  </button>
                </EditPayrollDialog>
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
                  <div key={r.id} className="group py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.type}</span>
                      <PriorityBadge priority={r.priority} />
                      <Select
                        value={r.status}
                        onValueChange={(v) => store.updateRequest(r.id, { status: v as RequestStatus })}
                      >
                        <SelectTrigger className="h-7 w-32 border-none bg-transparent p-0 shadow-none focus:ring-0">
                          <StatusPill status={r.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Submitted {formatDate(r.submittedAt)}
                        {r.assignedTo && ` · ${r.assignedTo}`}
                      </span>
                      <EditRequestDialog request={r}>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </EditRequestDialog>
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
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold">Task History</CardTitle>
            <AddTaskDialog employeeId={emp.id} companyCode={emp.companyCode} triggerLabel="Add task" variant="outline" />
          </CardHeader>
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
                    <Select
                      value={t.status}
                      onValueChange={(v) => store.updateTask(t.id, { status: v as any })}
                    >
                      <SelectTrigger className="h-7 w-28 border-none bg-transparent p-0 shadow-none focus:ring-0">
                        <StatusPill status={t.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
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
              Company History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CompanyHistorySection employeeId={emp.id} currentCode={emp.companyCode} currentPosition={emp.position} hireDate={emp.hireDate} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <NotesSection employeeId={emp.id} generalNote={emp.notes} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function CompanyHistorySection({
  employeeId,
  currentCode,
  currentPosition,
  hireDate,
}: {
  employeeId: string;
  currentCode: string;
  currentPosition: string;
  hireDate: string;
}) {
  const emp = useStore((s) => s.employees.find((e) => e.id === employeeId));
  const companies = useStore((s) => s.companies);
  const [open, setOpen] = useState(false);
  const [companyCode, setCompanyCode] = useState(currentCode);
  const [position, setPosition] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");

  const history = emp?.companyHistory ?? [];
  const combined = useMemo(
    () => [
      { companyCode: currentCode, position: currentPosition, from: hireDate, to: undefined, note: "Current assignment", current: true },
      ...history.map((h) => ({ ...h, current: false })),
    ],
    [history, currentCode, currentPosition, hireDate],
  );

  const codeToName = (code: string) => companies.find((c) => c.code === code)?.name ?? code;

  function submit() {
    if (!companyCode || !from) return;
    store.addCompanyHistory(employeeId, { companyCode, position: position || undefined, from, to: to || undefined, note: note || undefined });
    setOpen(false);
    setPosition("");
    setFrom("");
    setTo("");
    setNote("");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" /> Add past assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add past assignment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Company</Label>
                <Select value={companyCode} onValueChange={setCompanyCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Position</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Groundskeeper" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start</Label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y">
        {combined.map((h, i) => (
          <div key={i} className="py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{codeToName(h.companyCode)}</span>
              {h.position && <span className="text-xs text-muted-foreground">· {h.position}</span>}
              {h.current && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Current</span>}
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDate(h.from)} — {h.to ? formatDate(h.to) : "Present"}
              </span>
            </div>
            {h.note && <p className="mt-1 text-sm text-foreground/90">{h.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesSection({ employeeId, generalNote }: { employeeId: string; generalNote: string }) {
  const emp = useStore((s) => s.employees.find((e) => e.id === employeeId));
  const [text, setText] = useState("");
  const log = emp?.noteLog ?? [];

  function submit() {
    if (!text.trim()) return;
    store.addEmployeeNote(employeeId, text.trim());
    setText("");
  }

  return (
    <div className="space-y-3">
      {generalNote && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm text-foreground">{generalNote}</div>
      )}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note. Timestamped and saved to this employee."
          rows={2}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={!text.trim()}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add note
          </Button>
        </div>
      </div>
      {log.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="divide-y">
          {log.map((n, i) => (
            <div key={i} className="py-2.5">
              <div className="text-xs text-muted-foreground">{formatDateTime(n.at)}{n.author ? ` · ${n.author}` : ""}</div>
              <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

