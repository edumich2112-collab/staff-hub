import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore, store } from "@/lib/store";
import { daysUntil, formatDate } from "@/lib/format";
import { PriorityBadge, TaskStatusPill } from "@/components/pills";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/mock-data";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [{ title: "Tasks — Staffhub" }],
  }),
  component: TasksPage,
});

function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [when, setWhen] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("due");

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (when === "past" && !(daysUntil(t.dueDate) < 0 && t.status !== "Completed")) return false;
      if (when === "upcoming" && !(daysUntil(t.dueDate) >= 0 && t.status !== "Completed")) return false;
      if (q) {
        const s = q.toLowerCase();
        const emp = employees.find((e) => e.id === t.assignedEmployeeId)?.name.toLowerCase() ?? "";
        if (!t.title.toLowerCase().includes(s) && !emp.includes(s) && !(t.companyCode ?? "").toLowerCase().includes(s))
          return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sortBy === "priority") {
        const rank = { High: 0, Medium: 1, Low: 2 } as const;
        return rank[a.priority] - rank[b.priority];
      }
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return a.dueDate.localeCompare(b.dueDate);
    });
    return list;
  }, [tasks, employees, q, status, priority, when, sortBy]);

  const empName = (id?: string) => (id ? employees.find((e) => e.id === id)?.name ?? "—" : "—");
  const compName = (code?: string) =>
    code ? companies.find((c) => c.code === code)?.name ?? code : "—";

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {tasks.length} tasks
          </p>
        </div>
        <AddTaskDialog />
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search tasks…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            <Select value={when} onValueChange={setWhen}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past due</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">Due date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => {
              const overdue = t.status !== "Completed" && daysUntil(t.dueDate) < 0;
              return (
                <TableRow key={t.id} className={cn(t.status === "Completed" && "opacity-60")}>
                  <TableCell>
                    <Checkbox
                      checked={t.status === "Completed"}
                      onCheckedChange={(v) =>
                        store.updateTask(t.id, { status: (v ? "Completed" : "Open") as TaskStatus })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <EditTaskDialog task={t}>
                      <button className="text-left">
                        <div className={cn("font-medium hover:text-primary", t.status === "Completed" && "line-through")}>
                          {t.title}
                        </div>
                        {t.notes && <div className="text-xs text-muted-foreground">{t.notes}</div>}
                      </button>
                    </EditTaskDialog>
                  </TableCell>
                  <TableCell>
                    <div className={cn("text-sm", overdue && "text-destructive font-medium")}>
                      {formatDate(t.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  <TableCell className="text-sm">{compName(t.companyCode)}</TableCell>
                  <TableCell className="text-sm">{empName(t.assignedEmployeeId)}</TableCell>
                  <TableCell><TaskStatusPill status={t.status} /></TableCell>
                  <TableCell>
                    <EditTaskDialog task={t}>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </EditTaskDialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No tasks match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
