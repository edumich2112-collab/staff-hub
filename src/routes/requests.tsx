import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore, store } from "@/lib/store";
import { formatDate, formatDateTime } from "@/lib/format";
import { PriorityBadge, RequestStatusPill } from "@/components/pills";
import type { RequestStatus } from "@/lib/mock-data";
import { AddRequestDialog } from "@/components/add-request-dialog";
import { EditRequestDialog } from "@/components/edit-request-dialog";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Requests — Staffhub" }] }),
  component: RequestsPage,
});

function RequestsPage() {
  const requests = useStore((s) => s.requests);
  const employees = useStore((s) => s.employees);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    return requests
      .filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (type !== "all" && r.type !== type) return false;
        if (q) {
          const s = q.toLowerCase();
          if (
            !empName(r.employeeId).toLowerCase().includes(s) &&
            !r.type.toLowerCase().includes(s) &&
            !r.companyCode.toLowerCase().includes(s) &&
            !r.notes.toLowerCase().includes(s)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [requests, employees, q, status, type]);

  const types = Array.from(new Set(requests.map((r) => r.type)));

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {requests.length}
          </p>
        </div>
        <AddRequestDialog />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link
                    to="/employees/$id"
                    params={{ id: r.employeeId }}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {empName(r.employeeId)}
                  </Link>
                  {r.notes && <div className="text-xs text-muted-foreground">{r.notes}</div>}
                </TableCell>
                <TableCell>
                  <Link to="/companies/$code" params={{ code: r.companyCode }} className="text-sm hover:underline">
                    {r.companyCode}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  <EditRequestDialog request={r}>
                    <button className="text-left hover:text-primary">{r.type}</button>
                  </EditRequestDialog>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(r.submittedAt)}
                  {r.completedAt && (
                    <div className="text-[11px] text-success">
                      ✓ {formatDateTime(r.completedAt)}
                    </div>
                  )}
                </TableCell>
                <TableCell><PriorityBadge priority={r.priority} /></TableCell>
                <TableCell className="text-sm">{r.assignedTo}</TableCell>
                <TableCell>
                  <Select
                    value={r.status}
                    onValueChange={(v) => store.updateRequest(r.id, { status: v as RequestStatus })}
                  >
                    <SelectTrigger className="h-8 w-32 border-none bg-transparent p-0 shadow-none focus:ring-0">
                      <RequestStatusPill status={r.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <EditRequestDialog request={r}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </EditRequestDialog>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No requests match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
