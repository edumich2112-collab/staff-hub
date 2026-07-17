import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
import type { Priority } from "@/lib/mock-data";

interface Props {
  employeeId?: string;
  companyCode?: string;
  triggerLabel?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}

export function AddTaskDialog({
  employeeId: fixedEmp,
  companyCode: fixedCompany,
  triggerLabel = "New task",
  variant = "default",
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Priority>("Medium");
  const [employeeId, setEmployeeId] = useState(fixedEmp ?? "none");
  const [companyCode, setCompanyCode] = useState(fixedCompany ?? "none");
  const [notes, setNotes] = useState("");

  const employeeChoices = useMemo(
    () =>
      companyCode && companyCode !== "none"
        ? employees.filter((e) => e.companyCode === companyCode)
        : employees,
    [employees, companyCode],
  );

  function submit() {
    if (!title.trim() || !dueDate) return;
    store.addTask({
      title: title.trim(),
      dueDate,
      priority,
      assignedEmployeeId: employeeId !== "none" ? employeeId : undefined,
      companyCode: companyCode !== "none" ? companyCode : undefined,
      notes: notes.trim(),
    });
    setTitle("");
    setNotes("");
    setPriority("Medium");
    if (!fixedEmp) setEmployeeId("none");
    if (!fixedCompany) setCompanyCode("none");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <Plus className="mr-1 h-3.5 w-3.5" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            When completed, a permanent note is logged on the assigned employee.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Follow up on I-9 for Maria" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Due date</Label>
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
          </div>
          {!fixedCompany && (
            <div className="grid gap-1.5">
              <Label>Company (optional)</Label>
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
          )}
          {!fixedEmp && (
            <div className="grid gap-1.5">
              <Label>Assign to employee (optional)</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="none">Unassigned</SelectItem>
                  {employeeChoices.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} — {e.companyCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || !dueDate}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
