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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store, useStore } from "@/lib/store";
import type { PayrollIssue } from "@/lib/mock-data";

interface Props {
  payroll: PayrollIssue;
  children: React.ReactNode;
}

export function EditPayrollDialog({ payroll, children }: Props) {
  const [open, setOpen] = useState(false);
  const employees = useStore((s) => s.employees);

  const [employeeId, setEmployeeId] = useState(payroll.employeeId);
  const [issue, setIssue] = useState(payroll.issue);
  const [amount, setAmount] = useState(payroll.amount != null ? String(payroll.amount) : "");
  const [status, setStatus] = useState<PayrollIssue["status"]>(payroll.status);

  useEffect(() => {
    if (open) {
      setEmployeeId(payroll.employeeId);
      setIssue(payroll.issue);
      setAmount(payroll.amount != null ? String(payroll.amount) : "");
      setStatus(payroll.status);
    }
  }, [open, payroll]);

  function save() {
    if (!issue.trim()) return;
    const emp = employees.find((e) => e.id === employeeId);
    store.updatePayroll(payroll.id, {
      employeeId,
      companyCode: emp?.companyCode ?? payroll.companyCode,
      issue: issue.trim(),
      amount: amount ? Number(amount) : undefined,
      status,
    });
    setOpen(false);
  }

  function remove() {
    if (!confirm("Delete this payroll issue?")) return;
    store.deletePayroll(payroll.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit payroll issue</DialogTitle>
          <DialogDescription>Marking Resolved logs a permanent note on the employee.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.companyCode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Issue</Label>
            <Input value={issue} onChange={(e) => setIssue(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PayrollIssue["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
