import { cn } from "@/lib/utils";
import type { Priority, TaskStatus, EmployeeStatus, RequestStatus } from "@/lib/mock-data";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    High: "bg-destructive/10 text-destructive ring-destructive/20",
    Medium: "bg-warning/15 text-warning-foreground ring-warning/25 dark:text-warning",
    Low: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        map[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function StatusPill({
  status,
  tone,
}: {
  status: string;
  tone?: "success" | "info" | "warning" | "muted" | "destructive";
}) {
  const auto: Record<string, typeof tone> = {
    Completed: "success",
    Resolved: "success",
    Active: "success",
    "In Progress": "info",
    "Pending Start": "warning",
    Pending: "warning",
    Open: "warning",
    Former: "muted",
    None: "muted",
    "On Assignment": "info",
  };
  const t = tone ?? auto[status] ?? "muted";
  const map = {
    success: "bg-success/12 text-success ring-success/20",
    info: "bg-info/12 text-info ring-info/25",
    warning: "bg-warning/15 text-warning-foreground ring-warning/25 dark:text-warning",
    muted: "bg-muted text-muted-foreground ring-border",
    destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        map[t],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function TaskStatusPill({ status }: { status: TaskStatus }) {
  return <StatusPill status={status} />;
}
export function EmployeeStatusPill({ status }: { status: EmployeeStatus }) {
  return <StatusPill status={status} />;
}
export function RequestStatusPill({ status }: { status: RequestStatus }) {
  return <StatusPill status={status} />;
}
