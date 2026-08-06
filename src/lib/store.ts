import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db, flushQueue, isOnline, pendingCount } from "./offline-db";

import type {
  Company,
  Employee,
  Task,
  TaskStatus,
  EmployeeRequest,
  RequestStatus,
  PayrollIssue,
  NoteEntry,
  CompanyHistoryEntry,
} from "./mock-data";

interface State {
  companies: Company[];
  employees: Employee[];
  tasks: Task[];
  requests: EmployeeRequest[];
  payrollIssues: PayrollIssue[];
  loaded: boolean;
}

let state: State = {
  companies: [],
  employees: [],
  tasks: [],
  requests: [],
  payrollIssues: [],
  loaded: false,
};

const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/* ---------------- row mappers ---------------- */

type Row = Record<string, unknown>;

const s = (v: unknown) => (v == null ? "" : String(v));
const d = (v: unknown) => (v == null ? "" : String(v).slice(0, 10));

function toCompany(r: Row): Company {
  return { code: s(r.code), name: s(r.name), location: s(r.location), notes: s(r.notes) };
}

function toEmployee(r: Row): Employee {
  return {
    id: s(r.id),
    employeeNumber: s(r.employee_number),
    name: s(r.name),
    phone: s(r.phone),
    email: s(r.email),
    address: s(r.address),
    emergencyContact: s(r.emergency_contact),
    status: (s(r.status) || "Active") as Employee["status"],
    position: s(r.position),
    payRate: Number(r.pay_rate ?? 0),
    hireDate: d(r.hire_date),
    companyCode: s(r.company_code),
    currentAssignment: s(r.current_assignment),
    directDeposit: (s(r.direct_deposit) || "None") as Employee["directDeposit"],
    notes: s(r.notes),
    scheduledStartDate: r.scheduled_start_date ? d(r.scheduled_start_date) : undefined,
    companyHistory: [],
    noteLog: [],
  };
}

function toTask(r: Row): Task {
  return {
    id: s(r.id),
    title: s(r.title),
    dueDate: d(r.due_date),
    priority: (s(r.priority) || "Medium") as Task["priority"],
    assignedEmployeeId: r.assigned_employee_id ? s(r.assigned_employee_id) : undefined,
    companyCode: r.company_code ? s(r.company_code) : undefined,
    status: (s(r.status) || "Open") as TaskStatus,
    notes: s(r.notes),
    completedAt: r.completed_at ? s(r.completed_at) : undefined,
  };
}

function toRequest(r: Row): EmployeeRequest {
  return {
    id: s(r.id),
    employeeId: s(r.employee_id),
    companyCode: s(r.company_code),
    type: (s(r.type) || "General HR") as EmployeeRequest["type"],
    submittedAt: d(r.submitted_at),
    priority: (s(r.priority) || "Medium") as EmployeeRequest["priority"],
    status: (s(r.status) || "Open") as RequestStatus,
    assignedTo: s(r.assigned_to),
    notes: s(r.notes),
    completedAt: r.completed_at ? s(r.completed_at) : undefined,
  };
}

function toPayroll(r: Row): PayrollIssue {
  return {
    id: s(r.id),
    employeeId: s(r.employee_id),
    companyCode: s(r.company_code),
    issue: s(r.issue),
    amount: r.amount == null ? undefined : Number(r.amount),
    reportedAt: d(r.reported_at),
    status: (s(r.status) || "Open") as PayrollIssue["status"],
  };
}

/* ---------------- loading ---------------- */

let loadPromise: Promise<void> | undefined;

async function fetchAll() {
  const [companies, employees, tasks, requests, payroll, history, notes] = await Promise.all([
    db.from("companies").select("*").order("name"),
    db.from("employees").select("*").order("name"),
    db.from("tasks").select("*").order("created_at", { ascending: false }),
    db.from("requests").select("*").order("submitted_at", { ascending: false }),
    db.from("payroll_issues").select("*").order("reported_at", { ascending: false }),
    db.from("company_history").select("*").order("from_date", { ascending: false }),
    db.from("employee_notes").select("*").order("at", { ascending: false }),
  ]);

  const emps = (employees.data ?? []).map((r) => toEmployee(r as Row));
  const byId = new Map(emps.map((e) => [e.id, e]));
  for (const h of history.data ?? []) {
    const row = h as Row;
    byId.get(s(row.employee_id))?.companyHistory?.push({
      companyCode: s(row.company_code),
      position: s(row.position),
      from: d(row.from_date),
      to: row.to_date ? d(row.to_date) : undefined,
      note: s(row.note),
    });
  }
  for (const n of notes.data ?? []) {
    const row = n as Row;
    byId.get(s(row.employee_id))?.noteLog?.push({
      at: s(row.at),
      text: s(row.text),
      author: s(row.author),
    });
  }

  set({
    companies: (companies.data ?? []).map((r) => toCompany(r as Row)),
    employees: emps,
    tasks: (tasks.data ?? []).map((r) => toTask(r as Row)),
    requests: (requests.data ?? []).map((r) => toRequest(r as Row)),
    payrollIssues: (payroll.data ?? []).map((r) => toPayroll(r as Row)),
    loaded: true,
  });
}

export function loadStore(force = false) {
  if (force) loadPromise = undefined;
  if (!loadPromise) {
    // Show cached data instantly (and keep working with it while offline).
    hydrateFromCache();
    if (!isOnline()) {
      set({ loaded: true });
      loadPromise = Promise.resolve();
      return loadPromise;
    }
    loadPromise = fetchAll().catch((e) => {
      console.error("Failed to load data", e);
      loadPromise = undefined;
      set({ loaded: true });
    });
  }
  return loadPromise;
}

export function resetStore() {
  loadPromise = undefined;
  clearCache();
  set({
    companies: [],
    employees: [],
    tasks: [],
    requests: [],
    payrollIssues: [],
    loaded: false,
  });
}

/* ---------------- sync ---------------- */

export async function syncNow() {
  if (!isOnline()) return { synced: 0, failed: pendingCount() };
  const result = await flushQueue();
  await loadStore(true);
  return result;
}

export function watchConnection() {
  if (typeof window === "undefined") return () => {};
  const onOnline = () => {
    void syncNow();
  };
  window.addEventListener("online", onOnline);
  return () => window.removeEventListener("online", onOnline);
}


let channel: ReturnType<typeof supabase.channel> | undefined;

export function subscribeRealtime() {
  if (channel) return () => {};
  const refresh = () => {
    loadPromise = undefined;
    void loadStore();
  };
  channel = supabase
    .channel("staffhub-sync")
    .on("postgres_changes", { event: "*", schema: "public" }, refresh)
    .subscribe();
  return () => {
    if (channel) supabase.removeChannel(channel);
    channel = undefined;
  };
}

/* ---------------- mutations ---------------- */

const today = () => new Date().toISOString().slice(0, 10);
const nullable = (v?: string) => (v && v.trim() ? v : null);

function localNote(employeeId: string, text: string, author = "System") {
  const entry: NoteEntry = { at: new Date().toISOString(), text, author };
  state = {
    ...state,
    employees: state.employees.map((e) =>
      e.id === employeeId ? { ...e, noteLog: [entry, ...(e.noteLog ?? [])] } : e,
    ),
  };
}

async function persistNote(employeeId: string, text: string, author = "System") {
  localNote(employeeId, text, author);
  emit();
  await db.from("employee_notes").insert({ employee_id: employeeId, text, author });
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  async updateTask(id: string, patch: Partial<Task>) {
    const prev = state.tasks.find((t) => t.id === id);
    const completedAt =
      patch.status === "Completed"
        ? new Date().toISOString()
        : patch.status
          ? undefined
          : prev?.completedAt;

    state = {
      ...state,
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch, completedAt } : t)),
    };
    emit();

    await supabase
      .from("tasks")
      .update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.dueDate !== undefined ? { due_date: nullable(patch.dueDate) } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.assignedEmployeeId !== undefined
          ? { assigned_employee_id: nullable(patch.assignedEmployeeId) }
          : {}),
        ...(patch.companyCode !== undefined ? { company_code: nullable(patch.companyCode) } : {}),
        completed_at: completedAt ?? null,
      })
      .eq("id", id);

    if (prev && patch.status === "Completed" && prev.status !== "Completed" && prev.assignedEmployeeId) {
      await persistNote(
        prev.assignedEmployeeId,
        `✓ Task completed: "${prev.title}"${prev.notes ? ` — ${prev.notes}` : ""}`,
      );
    }
  },

  async addTask(t: Omit<Task, "id" | "status"> & { status?: TaskStatus }) {
    const { data } = await supabase
      .from("tasks")
      .insert({
        title: t.title,
        due_date: nullable(t.dueDate),
        priority: t.priority,
        status: t.status ?? "Open",
        notes: t.notes ?? "",
        assigned_employee_id: nullable(t.assignedEmployeeId),
        company_code: nullable(t.companyCode),
      })
      .select()
      .single();
    if (data) set({ tasks: [toTask(data as Row), ...state.tasks] });
  },

  async updateRequest(id: string, patch: Partial<EmployeeRequest>) {
    const prev = state.requests.find((r) => r.id === id);
    const completedAt =
      patch.status === "Resolved"
        ? (prev?.completedAt ?? new Date().toISOString())
        : patch.status
          ? undefined
          : prev?.completedAt;

    state = {
      ...state,
      requests: state.requests.map((r) => (r.id === id ? { ...r, ...patch, completedAt } : r)),
    };
    emit();

    await supabase
      .from("requests")
      .update({
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.assignedTo !== undefined ? { assigned_to: patch.assignedTo } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.companyCode !== undefined ? { company_code: nullable(patch.companyCode) } : {}),
        completed_at: completedAt ?? null,
      })
      .eq("id", id);

    if (prev && patch.status === "Resolved" && prev.status !== "Resolved") {
      await persistNote(
        prev.employeeId,
        `✓ Request resolved: ${prev.type}${prev.notes ? ` — ${prev.notes}` : ""}`,
      );
    }
  },

  async addRequest(
    req: Omit<EmployeeRequest, "id" | "submittedAt" | "status"> & { status?: RequestStatus },
  ) {
    const { data } = await supabase
      .from("requests")
      .insert({
        employee_id: nullable(req.employeeId),
        company_code: nullable(req.companyCode),
        type: req.type,
        priority: req.priority,
        status: req.status ?? "Open",
        assigned_to: req.assignedTo ?? "",
        notes: req.notes ?? "",
      })
      .select()
      .single();
    if (data) set({ requests: [toRequest(data as Row), ...state.requests] });
  },

  async updateEmployee(id: string, patch: Partial<Employee>) {
    state = {
      ...state,
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    };
    emit();

    await supabase
      .from("employees")
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.employeeNumber !== undefined ? { employee_number: patch.employeeNumber } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.email !== undefined ? { email: patch.email } : {}),
        ...(patch.address !== undefined ? { address: patch.address } : {}),
        ...(patch.emergencyContact !== undefined
          ? { emergency_contact: patch.emergencyContact }
          : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.position !== undefined ? { position: patch.position } : {}),
        ...(patch.payRate !== undefined ? { pay_rate: patch.payRate } : {}),
        ...(patch.hireDate !== undefined ? { hire_date: nullable(patch.hireDate) } : {}),
        ...(patch.scheduledStartDate !== undefined
          ? { scheduled_start_date: nullable(patch.scheduledStartDate) }
          : {}),
        ...(patch.companyCode !== undefined ? { company_code: nullable(patch.companyCode) } : {}),
        ...(patch.currentAssignment !== undefined
          ? { current_assignment: patch.currentAssignment }
          : {}),
        ...(patch.directDeposit !== undefined ? { direct_deposit: patch.directDeposit } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      })
      .eq("id", id);
  },

  async addEmployee(e: Partial<Employee> & { name: string }) {
    const { data } = await supabase
      .from("employees")
      .insert({
        name: e.name,
        employee_number: e.employeeNumber ?? "",
        phone: e.phone ?? "",
        email: e.email ?? "",
        address: e.address ?? "",
        emergency_contact: e.emergencyContact ?? "",
        status: e.status ?? "Active",
        position: e.position ?? "",
        pay_rate: e.payRate ?? 0,
        hire_date: nullable(e.hireDate),
        scheduled_start_date: nullable(e.scheduledStartDate),
        company_code: nullable(e.companyCode),
        current_assignment: e.currentAssignment ?? "",
        direct_deposit: e.directDeposit ?? "None",
        notes: e.notes ?? "",
      })
      .select()
      .single();
    if (data) set({ employees: [...state.employees, toEmployee(data as Row)] });
  },

  async addCompany(c: Company) {
    if (state.companies.some((x) => x.code === c.code)) return;
    const { data } = await db.from("companies").insert(c).select().single();
    if (data) set({ companies: [...state.companies, toCompany(data as Row)] });
  },

  async updateCompany(code: string, patch: Partial<Omit<Company, "code">>) {
    set({
      companies: state.companies.map((c) => (c.code === code ? { ...c, ...patch } : c)),
    });
    await db.from("companies").update(patch).eq("code", code);
  },

  async changeEmployeeCompany(id: string, newCode: string, startDate: string, note?: string) {
    const prev = state.employees.find((e) => e.id === id);
    if (!prev || newCode === prev.companyCode) return;
    const now = today();
    const historyEntry: CompanyHistoryEntry = {
      companyCode: prev.companyCode,
      position: prev.position,
      from: prev.hireDate || prev.scheduledStartDate || now,
      to: now,
      note: note || "Transferred",
    };
    const scheduled = startDate > now;
    const patch: Partial<Employee> = {
      companyCode: newCode,
      currentAssignment: newCode,
      hireDate: scheduled ? prev.hireDate : startDate,
      scheduledStartDate: scheduled ? startDate : undefined,
      status: scheduled ? "Pending Start" : "Active",
    };

    state = {
      ...state,
      employees: state.employees.map((e) =>
        e.id === id
          ? { ...e, ...patch, companyHistory: [historyEntry, ...(e.companyHistory ?? [])] }
          : e,
      ),
    };
    emit();

    await db.from("company_history").insert({
      employee_id: id,
      company_code: historyEntry.companyCode,
      position: historyEntry.position ?? "",
      from_date: nullable(historyEntry.from),
      to_date: nullable(historyEntry.to),
      note: historyEntry.note ?? "",
    });
    await this.updateEmployee(id, patch);
    await persistNote(id, `↔ Transferred from ${prev.companyCode} to ${newCode} (start ${startDate})`);
  },

  async terminateEmployee(id: string, endDate: string, reason?: string) {
    const prev = state.employees.find((e) => e.id === id);
    if (!prev) return;
    const historyEntry =
      prev.companyCode && prev.companyCode !== "FORMER"
        ? {
            companyCode: prev.companyCode,
            position: prev.position,
            from: prev.hireDate || endDate,
            to: endDate,
            note: reason || "Terminated",
          }
        : null;

    const patch: Partial<Employee> = {
      status: "Former",
      companyCode: "FORMER",
      currentAssignment: "",
      scheduledStartDate: undefined,
    };

    state = {
      ...state,
      employees: state.employees.map((e) =>
        e.id === id
          ? {
              ...e,
              ...patch,
              companyHistory: historyEntry
                ? [historyEntry, ...(e.companyHistory ?? [])]
                : e.companyHistory,
            }
          : e,
      ),
    };
    emit();

    if (historyEntry) {
      await db.from("company_history").insert({
        employee_id: id,
        company_code: historyEntry.companyCode,
        position: historyEntry.position ?? "",
        from_date: nullable(historyEntry.from),
        to_date: nullable(historyEntry.to),
        note: historyEntry.note,
      });
    }
    await this.updateEmployee(id, patch);
    await persistNote(id, `✗ Ended employment on ${endDate}${reason ? ` — ${reason}` : ""}`);
  },

  async addEmployeeNote(id: string, text: string, author?: string) {
    await persistNote(id, text, author || "Staff");
  },

  async addCompanyHistory(id: string, entry: CompanyHistoryEntry) {
    state = {
      ...state,
      employees: state.employees.map((e) =>
        e.id === id ? { ...e, companyHistory: [entry, ...(e.companyHistory ?? [])] } : e,
      ),
    };
    emit();
    await db.from("company_history").insert({
      employee_id: id,
      company_code: entry.companyCode,
      position: entry.position ?? "",
      from_date: nullable(entry.from),
      to_date: nullable(entry.to),
      note: entry.note ?? "",
    });
  },

  async addPayrollIssue(
    p: Omit<PayrollIssue, "id" | "reportedAt" | "status"> & { status?: PayrollIssue["status"] },
  ) {
    const { data } = await supabase
      .from("payroll_issues")
      .insert({
        employee_id: nullable(p.employeeId),
        company_code: nullable(p.companyCode),
        issue: p.issue,
        amount: p.amount ?? null,
        status: p.status ?? "Open",
      })
      .select()
      .single();
    if (data) set({ payrollIssues: [toPayroll(data as Row), ...state.payrollIssues] });
  },

  async resolvePayroll(id: string) {
    const prev = state.payrollIssues.find((p) => p.id === id);
    set({
      payrollIssues: state.payrollIssues.map((p) =>
        p.id === id ? { ...p, status: "Resolved" } : p,
      ),
    });
    await db.from("payroll_issues").update({ status: "Resolved" }).eq("id", id);
    if (prev && prev.status !== "Resolved") {
      const amt = prev.amount ? ` ($${prev.amount.toFixed(2)})` : "";
      await persistNote(prev.employeeId, `✓ Payroll issue resolved: ${prev.issue}${amt}`);
    }
  },

  async updatePayroll(id: string, patch: Partial<PayrollIssue>) {
    if (patch.status === "Resolved") {
      await this.resolvePayroll(id);
      return;
    }
    set({
      payrollIssues: state.payrollIssues.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
    await supabase
      .from("payroll_issues")
      .update({
        ...(patch.issue !== undefined ? { issue: patch.issue } : {}),
        ...(patch.amount !== undefined ? { amount: patch.amount ?? null } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.companyCode !== undefined ? { company_code: nullable(patch.companyCode) } : {}),
      })
      .eq("id", id);
  },

  async deleteTask(id: string) {
    set({ tasks: state.tasks.filter((t) => t.id !== id) });
    await db.from("tasks").delete().eq("id", id);
  },

  async deleteRequest(id: string) {
    set({ requests: state.requests.filter((r) => r.id !== id) });
    await db.from("requests").delete().eq("id", id);
  },

  async deletePayroll(id: string) {
    set({ payrollIssues: state.payrollIssues.filter((p) => p.id !== id) });
    await db.from("payroll_issues").delete().eq("id", id);
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
