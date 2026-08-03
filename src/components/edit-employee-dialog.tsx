import { useEffect, useState } from "react";
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
import type { Employee, EmployeeStatus } from "@/lib/mock-data";

interface Props {
  employee: Employee;
  children: React.ReactNode;
}

const STATUSES: EmployeeStatus[] = ["Active", "Pending Start", "On Assignment", "Former"];

export function EditEmployeeDialog({ employee, children }: Props) {
  const [open, setOpen] = useState(false);
  const companies = useStore((s) => s.companies);

  const [name, setName] = useState(employee.name);
  const [employeeNumber, setEmployeeNumber] = useState(employee.employeeNumber);
  const [phone, setPhone] = useState(employee.phone);
  const [email, setEmail] = useState(employee.email);
  const [address, setAddress] = useState(employee.address);
  const [emergencyContact, setEmergencyContact] = useState(employee.emergencyContact);
  const [position, setPosition] = useState(employee.position);
  const [currentAssignment, setCurrentAssignment] = useState(employee.currentAssignment);
  const [hireDate, setHireDate] = useState(employee.hireDate);
  const [directDeposit, setDirectDeposit] = useState<Employee["directDeposit"]>(employee.directDeposit);
  const [payRate, setPayRate] = useState(String(employee.payRate));
  const [companyCode, setCompanyCode] = useState(employee.companyCode);
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<EmployeeStatus>(employee.status);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduledStart, setScheduledStart] = useState(employee.scheduledStartDate ?? "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState(employee.notes);

  useEffect(() => {
    if (open) {
      setName(employee.name);
      setEmployeeNumber(employee.employeeNumber);
      setPhone(employee.phone);
      setEmail(employee.email);
      setAddress(employee.address);
      setEmergencyContact(employee.emergencyContact);
      setPosition(employee.position);
      setCurrentAssignment(employee.currentAssignment);
      setHireDate(employee.hireDate);
      setDirectDeposit(employee.directDeposit);
      setPayRate(String(employee.payRate));
      setCompanyCode(employee.companyCode);
      setStartDate("");
      setStatus(employee.status);
      setEndDate(new Date().toISOString().slice(0, 10));
      setScheduledStart(employee.scheduledStartDate ?? "");
      setReason("");
      setNotes(employee.notes);
    }
  }, [open, employee]);

  const companyChanged = companyCode !== employee.companyCode;
  const becomingFormer = status === "Former" && employee.status !== "Former";
  const becomingPending = status === "Pending Start";

  const canSave =
    !!name.trim() &&
    (!companyChanged || !!startDate) &&
    (!becomingFormer || !!endDate) &&
    (!becomingPending || !!scheduledStart);

  function save() {
    if (!canSave) return;

    // Base fields (always applied)
    store.updateEmployee(employee.id, {
      name: name.trim(),
      employeeNumber: employeeNumber.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      emergencyContact: emergencyContact.trim(),
      position: position.trim(),
      currentAssignment: currentAssignment.trim(),
      hireDate,
      directDeposit,
      payRate: Number(payRate) || 0,
      notes: notes.trim(),
    });

    if (companyChanged) {
      store.changeEmployeeCompany(employee.id, companyCode, startDate);
      // status will be recomputed by changeEmployeeCompany; skip further status logic
    } else if (becomingFormer) {
      store.terminateEmployee(employee.id, endDate, reason || undefined);
    } else if (status !== employee.status || (becomingPending && scheduledStart !== employee.scheduledStartDate)) {
      store.updateEmployee(employee.id, {
        status,
        scheduledStartDate: becomingPending ? scheduledStart : undefined,
      });
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit employee</DialogTitle>
          <DialogDescription>
            Change assignment, status, or profile. Company changes and terminations are auto-logged.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 grid gap-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Employee #</Label>
              <Input value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Emergency contact</Label>
            <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Current assignment</Label>
              <Input value={currentAssignment} onChange={(e) => setCurrentAssignment(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Company start date</Label>
              <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Direct deposit</Label>
            <Select value={directDeposit} onValueChange={(value) => setDirectDeposit(value as Employee["directDeposit"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Position</Label>
              <Input value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Pay rate ($/hr)</Label>
              <Input type="number" value={payRate} onChange={(e) => setPayRate(e.target.value)} />
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assignment
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Company</Label>
                <Select value={companyCode} onValueChange={setCompanyCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {companies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {companyChanged && (
                <div className="grid gap-1.5">
                  <Label>
                    Start date at {companyCode} <span className="text-destructive">*</span>
                  </Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <p className="text-xs text-muted-foreground">
                    Previous assignment at {employee.companyCode} will be closed today and added to history.
                  </p>
                </div>
              )}
            </div>
          </div>

          {!companyChanged && (
            <div className="rounded-md border p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Employment status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as EmployeeStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {becomingPending && (
                  <div className="grid gap-1.5">
                    <Label>Scheduled start date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} />
                  </div>
                )}
                {becomingFormer && (
                  <>
                    <div className="grid gap-1.5">
                      <Label>End date <span className="text-destructive">*</span></Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Reason (optional)</Label>
                      <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Terminated, Resigned, No-show…"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!canSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
