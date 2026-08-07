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
import type { Priority, RequestType } from "@/lib/mock-data";

const TYPES: RequestType[] = [
  "Returned Check",
  "Direct Deposit Change",
  "W-2 Request",
  "Employment Verification",
  "Address Change",
  "General HR",
];

interface Props {
  employeeId?: string;
  companyCode?: string;
  triggerLabel?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}

export function AddRequestDialog({
  employeeId: fixedEmp,
  companyCode: fixedCompany,
  triggerLabel,
  variant = "outline",
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);
  const [target, setTarget] = useState<"employee" | "company">(
    fixedEmp ? "employee" : fixedCompany ? "company" : "employee",
  );
  const [employeeId, setEmployeeId] = useState(fixedEmp ?? "");
  const [company, setCompany] = useState(fixedCompany ?? "");
  const [type, setType] = useState<RequestType>("General HR");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const emp = useMemo(() => employees.find((e) => e.id === employeeId), [employees, employeeId]);
  const companyCode =
    target === "company" ? company : (fixedCompany ?? emp?.companyCode ?? "");

  const employeeChoices = useMemo(
    () =>
      fixedCompany
        ? employees.filter((e) => e.companyCode === fixedCompany)
        : employees,
    [employees, fixedCompany],
  );

  const valid = notes.trim() && companyCode && (target === "company" || employeeId);

  const submit = () => {
    if (!valid) return;
    store.addRequest({
      employeeId: target === "company" ? "" : employeeId,
      companyCode,
      type,
      priority,
      assignedTo: assignedTo || "Unassigned",
      notes: notes.trim(),
    });
    setNotes("");
    setAssignedTo("");
    setPriority("Medium");
    setType("General HR");
    if (!fixedEmp) setEmployeeId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <Plus className="mr-1 h-3.5 w-3.5" /> {triggerLabel ?? (fixedEmp ? "Attach request" : "New request")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach a new request</DialogTitle>
          <DialogDescription>
            Log a request from an employee or a client company. When marked Resolved, it's time-stamped.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {!fixedEmp && (
            <div className="grid gap-1.5">
              <Label>Request from</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as "employee" | "company")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">An employee</SelectItem>
                  <SelectItem value="company">A company (client)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {!fixedEmp && target === "employee" && (
            <div className="grid gap-1.5">
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {employeeChoices.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} — {e.companyCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {target === "company" && !fixedCompany && (
            <div className="grid gap-1.5">
              <Label>Company</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {companies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} — {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label>Request type</Label>
            <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <Label>Assigned to</Label>
              <Input
                placeholder="e.g. Sarah K."
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Details / notes</Label>
            <Textarea
              placeholder='e.g. "Hold check at the office — will pick up 7/10/2026"'
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>Attach request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
