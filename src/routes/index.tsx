import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Inbox,
  UserPlus,
  Users,
  Building2,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { daysUntil, formatDate, relativeDay } from "@/lib/format";
import { PriorityBadge, StatusPill } from "@/components/pills";
import { cn } from "@/lib/utils";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { AddRequestDialog } from "@/components/add-request-dialog";
import { AddPayrollDialog } from "@/components/add-payroll-dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Staffhub" },
      {
        name: "description",
        content: "Daily operations overview: tasks, requests, payroll issues, and new starts.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground dark:text-warning",
    info: "bg-info/12 text-info",
  };
  const inner = (
    <Card className="transition-shadow hover:shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("grid h-11 w-11 place-items-center rounded-lg", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

function SectionCard({
  title,
  href,
  count,
  children,
  empty,
  icon: Icon,
  action,
}: {
  title: string;
  href?: string;
  count?: number;
  children: React.ReactNode;
  empty?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
          {count !== undefined && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {action}
          {href && (
            <Link
              to={href}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {count === 0 && empty ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="divide-y divide-border">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const tasks = useStore((s) => s.tasks);
  const requests = useStore((s) => s.requests);
  const payroll = useStore((s) => s.payrollIssues);
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);

  const upcoming = tasks
    .filter((t) => t.status !== "Completed" && daysUntil(t.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const pastDue = tasks
    .filter((t) => t.status !== "Completed" && daysUntil(t.dueDate) < 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const openRequests = requests.filter((r) => r.status !== "Resolved").slice(0, 5);
  const openPayroll = payroll.filter((p) => p.status === "Open");
  const startingSoon = employees
    .filter((e) => e.status === "Pending Start")
    .sort((a, b) => a.hireDate.localeCompare(b.hireDate))
    .slice(0, 5);
  const recentDone = tasks
    .filter((t) => t.status === "Completed")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 5);

  const activeEmp = employees.filter((e) => e.status === "Active").length;

  const empName = (id?: string) =>
    id ? employees.find((e) => e.id === id)?.name ?? "—" : "—";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Good morning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what needs your attention today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Employees" value={activeEmp} icon={Users} tone="primary" />
        <StatCard label="Total Clients" value={companies.length} icon={Building2} href="/companies" tone="info" />
        <StatCard
          label="Open Requests"
          value={requests.filter((r) => r.status !== "Resolved").length}
          icon={Inbox}
          href="/requests"
          tone="warning"
        />
        <StatCard
          label="Payroll Issues"
          value={openPayroll.length}
          icon={DollarSign}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Past Due Tasks"
          icon={AlertTriangle}
          href="/tasks"
          count={pastDue.length}
          empty="Nothing overdue. Nice."
        >
          {pastDue.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-destructive">{relativeDay(t.dueDate)}</span>
                  <span>·</span>
                  <span>{t.companyCode ?? "—"}</span>
                  {t.assignedEmployeeId && (
                    <>
                      <span>·</span>
                      <span className="truncate">{empName(t.assignedEmployeeId)}</span>
                    </>
                  )}
                </div>
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Upcoming Tasks"
          icon={CalendarClock}
          href="/tasks"
          count={upcoming.length}
          empty="No upcoming tasks."
          action={<AddTaskDialog />}
        >
          {upcoming.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{relativeDay(t.dueDate)}</span>
                  <span>·</span>
                  <span>{t.companyCode ?? "—"}</span>
                  {t.assignedEmployeeId && (
                    <>
                      <span>·</span>
                      <span className="truncate">{empName(t.assignedEmployeeId)}</span>
                    </>
                  )}
                </div>
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Employee Requests"
          icon={Inbox}
          href="/requests"
          count={openRequests.length}
          empty="No open requests."
        >
          {openRequests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{r.type}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{empName(r.employeeId)}</span>
                  <span>·</span>
                  <span>{r.companyCode}</span>
                  <span>·</span>
                  <span>{relativeDay(r.submittedAt)}</span>
                </div>
              </div>
              <StatusPill status={r.status} />
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Payroll Issues"
          icon={DollarSign}
          count={openPayroll.length}
          empty="All caught up."
        >
          {openPayroll.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{p.issue}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{empName(p.employeeId)}</span>
                  <span>·</span>
                  <span>{p.companyCode}</span>
                  {p.amount && (
                    <>
                      <span>·</span>
                      <span>${p.amount.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>
              <StatusPill status="Open" tone="warning" />
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Starting Soon"
          icon={UserPlus}
          count={startingSoon.length}
          empty="No new starts scheduled."
        >
          {startingSoon.map((e) => (
            <Link
              key={e.id}
              to="/employees/$id"
              params={{ id: e.id }}
              className="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-md"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {e.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{e.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {e.position} · {e.companyCode} · starts {formatDate(e.hireDate)}
                </div>
              </div>
              <StatusPill status="Pending Start" />
            </Link>
          ))}
        </SectionCard>

        <SectionCard
          title="Recently Completed"
          icon={CheckCircle2}
          count={recentDone.length}
          empty="No completed tasks yet."
        >
          {recentDone.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm text-muted-foreground line-through">
                  {t.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.completedAt ? relativeDay(t.completedAt) : ""}</span>
                  <span>·</span>
                  <span>{t.companyCode ?? "—"}</span>
                </div>
              </div>
              <StatusPill status="Completed" />
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
