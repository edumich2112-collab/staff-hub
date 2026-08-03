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
import { store } from "@/lib/store";
import type { Company } from "@/lib/mock-data";

interface Props {
  company: Company;
  children: React.ReactNode;
}

export function EditCompanyDialog({ company, children }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(company.name);
  const [location, setLocation] = useState(company.location);
  const [notes, setNotes] = useState(company.notes);

  useEffect(() => {
    if (!open) return;
    setName(company.name);
    setLocation(company.location);
    setNotes(company.notes);
  }, [open, company]);

  function save() {
    if (!name.trim()) return;
    store.updateCompany(company.code, {
      name: name.trim(),
      location: location.trim(),
      notes: notes.trim(),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit company</DialogTitle>
          <DialogDescription>Update the details for {company.code}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Company code</Label>
            <Input value={company.code} disabled />
          </div>
          <div className="grid gap-1.5">
            <Label>Company name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Location</Label>
            <Input value={location} onChange={(event) => setLocation(event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}