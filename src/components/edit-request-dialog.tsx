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
import type { EmployeeRequest, Priority, RequestStatus, RequestType } from "@/lib/mock-data";

const TYPES: RequestType[] = [
  "Returned Check",
  "Direct Deposit Change",
  "W-2 Request",
  "Employment Verification",
  "Address Change",
  "General HR",
];

interface Props {
  request: EmployeeRequest;
  children: React.ReactNode;
}

export function EditRequestDialog({ request, children }: Props) {
  const [open, setOpen] = useState(false);
  const employees = useStore((s) => s.employees);

  const [employeeId, setEmployeeId] = useState(request.employeeId);
  const [type, setType] = useState<RequestType>(request.type);
  const [priority, setPriority] = useState<Priority>(request.priority);
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [assignedTo, setAssignedTo] = useState(request.assignedTo ?? "");
  const [notes, setNotes] = useState(request.notes ?? "");

  useEffect(() => {
    if (open) {
      setEmployeeId(request.employeeId);
      setType(request.type);
      setPriority(request.priority);
      setStatus(request.status);
      setAssignedTo(request.assignedTo ?? "");
      setNotes(request.notes ?? "");
    }
  }, [open, request]);

  function save() {
    const emp = employees.find((e) => e.id === employeeId);
    store.updateRequest(request.id, {
      employeeId,
      companyCode: emp?.companyCode ?? request.companyCode,
      type,
      priority,
      status,
      assignedTo: assignedTo || "Unassigned",
      notes: notes.trim(),
    });
    setOpen(false);
  }

  function remove() {
    if (!confirm("Delete this request?")) return;
    store.deleteRequest(request.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit request</DialogTitle>
          <DialogDescription>Resolving auto-timestamps and logs a permanent note.</DialogDescription>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
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
