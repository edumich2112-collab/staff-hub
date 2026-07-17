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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store, useStore } from "@/lib/store";

interface Props {
  employeeId?: string;
  companyCode?: string;
  triggerLabel?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}

export function AddPayrollDialog({
  employeeId: fixedEmp,
  companyCode: fixedCompany,
  triggerLabel = "Add payroll issue",
  variant = "outline",
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const employees = useStore((s) => s.employees);
  const [employeeId, setEmployeeId] = useState(fixedEmp ?? "");
  const [issue, setIssue] = useState("");
  const [amount, setAmount] = useState("");

  const emp = useMemo(() => employees.find((e) => e.id === employeeId), [employees, employeeId]);
  const companyCode = fixedCompany ?? emp?.companyCode ?? "";

  const employeeChoices = useMemo(
    () =>
      fixedCompany
        ? employees.filter((e) => e.companyCode === fixedCompany)
        : employees,
    [employees, fixedCompany],
  );

  function submit() {
    if (!employeeId || !issue.trim() || !companyCode) return;
    store.addPayrollIssue({
      employeeId,
      companyCode,
      issue: issue.trim(),
      amount: amount ? Number(amount) : undefined,
    });
    setIssue("");
    setAmount("");
    if (!fixedEmp) setEmployeeId("");
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
          <DialogTitle>New payroll issue</DialogTitle>
          <DialogDescription>
            When you mark this Resolved, a permanent note is added to the employee automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {!fixedEmp && (
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
          <div className="grid gap-1.5">
            <Label>Issue</Label>
            <Input
              placeholder='e.g. "Missing hours on 7/10 paycheck"'
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Amount (optional)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!employeeId || !issue.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
