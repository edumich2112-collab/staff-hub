import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store, useStore } from "@/lib/store";
import type { Priority, Task, TaskStatus } from "@/lib/mock-data";

interface Props {
  task: Task;
  children: React.ReactNode;
}

export function EditTaskDialog({ task, children }: Props) {
  const [open, setOpen] = useState(false);
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);

  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [employeeId, setEmployeeId] = useState(task.assignedEmployeeId ?? "none");
  const [companyCode, setCompanyCode] = useState(task.companyCode ?? "none");
  const [notes, setNotes] = useState(task.notes ?? "");

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDueDate(task.dueDate);
      setPriority(task.priority);
      setStatus(task.status);
      setEmployeeId(task.assignedEmployeeId ?? "none");
      setCompanyCode(task.companyCode ?? "none");
      setNotes(task.notes ?? "");
    }
  }, [open, task]);

  const empChoices =
    companyCode !== "none"
      ? employees.filter((e) => e.companyCode === companyCode)
      : employees;

  function save() {
    if (!title.trim() || !dueDate) return;
    store.updateTask(task.id, {
      title: title.trim(),
      dueDate,
      priority,
      status,
      assignedEmployeeId: employeeId !== "none" ? employeeId : undefined,
      companyCode: companyCode !== "none" ? companyCode : undefined,
      notes: notes.trim(),
    });
    setOpen(false);
  }

  function remove() {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    store.deleteTask(task.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update any field. Marking Completed logs a permanent note.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Due</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Company</Label>
            <Select value={companyCode} onValueChange={setCompanyCode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="none">None</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Assigned employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="none">Unassigned</SelectItem>
                {empChoices.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.companyCode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={remove} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
