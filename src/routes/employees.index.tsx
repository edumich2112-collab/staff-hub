import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { store, useStore } from "@/lib/store";
import type { Employee, EmployeeStatus } from "@/lib/mock-data";
import { EditEmployeeDialog } from "@/components/edit-employee-dialog";

export const Route = createFileRoute("/employees/")({
  head: () => ({ meta: [{ title: "Employees — Staffhub" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const employees = useStore((s) => s.employees);
  const companies = useStore((s) => s.companies);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [company, setCompany] = useState("all");

  const requests = useStore((s) => s.requests);
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return employees
      .filter((e) => {
        if (status !== "all" && e.status !== status) return false;
        if (company !== "all" && e.companyCode !== company) return false;
        if (!q) return true;
        const reqMatch = requests.some(
          (r) => r.employeeId === e.id && r.notes.toLowerCase().includes(s),
        );
        return (
          e.name.toLowerCase().includes(s) ||
          e.employeeNumber.toLowerCase().includes(s) ||
          e.phone.includes(s) ||
          e.position.toLowerCase().includes(s) ||
          e.notes.toLowerCase().includes(s) ||
          reqMatch
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, requests, q, status, company]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} of {employees.length}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search name, phone, number, or request notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-96"
          />
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending Start">Pending Start</SelectItem>
              <SelectItem value="Former">Former</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Emp #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Pay</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 200).map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Link
                    to="/employees/$id"
                    params={{ id: e.id }}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {e.name}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.employeeNumber}</TableCell>
                <TableCell>
                  <Link to="/companies/$code" params={{ code: e.companyCode }} className="text-sm hover:underline">
                    {e.companyCode}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{e.position}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.phone}</TableCell>
                <TableCell className="text-sm">${e.payRate.toFixed(2)}</TableCell>
                <TableCell><EmployeeStatusPill status={e.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length > 200 && (
          <div className="border-t p-3 text-center text-xs text-muted-foreground">
            Showing 200 of {filtered.length}. Refine your search to see more.
          </div>
        )}
      </Card>
    </div>
  );
}
