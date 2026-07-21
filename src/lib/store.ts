import { useSyncExternalStore } from "react";
import {
  companies,
  employees,
  tasks,
  requests,
  payrollIssues,
  type Company,
  type Employee,
  type Task,
  type EmployeeRequest,
  type RequestStatus,
  type PayrollIssue,
  type NoteEntry,
  type CompanyHistoryEntry,
} from "./mock-data";


interface State {
  companies: Company[];
  employees: Employee[];
  tasks: Task[];
  requests: EmployeeRequest[];
  payrollIssues: PayrollIssue[];
}

let state: State = { companies, employees, tasks, requests, payrollIssues };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function appendNote(employeeId: string, text: string) {
  const entry: NoteEntry = { at: new Date().toISOString(), text, author: "System" };
  state = {
    ...state,
    employees: state.employees.map((e) =>
      e.id === employeeId ? { ...e, noteLog: [entry, ...(e.noteLog ?? [])] } : e,
    ),
  };
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  updateTask(id: string, patch: Partial<Task>) {
    const prev = state.tasks.find((t) => t.id === id);
    state = {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              ...patch,
              completedAt:
                patch.status === "Completed"
                  ? new Date().toISOString().slice(0, 10)
                  : patch.status
                    ? undefined
                    : t.completedAt,
            }
          : t,
      ),
    };
    if (
      prev &&
      patch.status === "Completed" &&
      prev.status !== "Completed" &&
      prev.assignedEmployeeId
    ) {
      appendNote(
        prev.assignedEmployeeId,
        `✓ Task completed: "${prev.title}"${prev.notes ? ` — ${prev.notes}` : ""}`,
      );
    }
    emit();
  },
  addTask(t: Omit<Task, "id" | "status"> & { status?: TaskStatus }) {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      status: t.status ?? "Open",
      ...t,
    } as Task;
    state = { ...state, tasks: [newTask, ...state.tasks] };
    emit();
  },
  updateRequest(id: string, patch: Partial<EmployeeRequest>) {
    const prev = state.requests.find((r) => r.id === id);
    state = {
      ...state,
      requests: state.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              completedAt:
                patch.status === "Resolved"
                  ? (r.completedAt ?? new Date().toISOString())
                  : patch.status
                    ? undefined
                    : r.completedAt,
            }
          : r,
      ),
    };
    if (prev && patch.status === "Resolved" && prev.status !== "Resolved") {
      appendNote(
        prev.employeeId,
        `✓ Request resolved: ${prev.type}${prev.notes ? ` — ${prev.notes}` : ""}`,
      );
    }
    emit();
  },
  addRequest(req: Omit<EmployeeRequest, "id" | "submittedAt" | "status"> & { status?: RequestStatus }) {
    const id = `r_${Date.now()}`;
    const newReq: EmployeeRequest = {
      id,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: req.status ?? "Open",
      ...req,
    };
    state = { ...state, requests: [newReq, ...state.requests] };
    emit();
  },
  updateEmployee(id: string, patch: Partial<Employee>) {
    state = {
      ...state,
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    };
    emit();
  },
  addEmployeeNote(id: string, text: string, author?: string) {
    const entry: NoteEntry = { at: new Date().toISOString(), text, author };
    state = {
      ...state,
      employees: state.employees.map((e) =>
        e.id === id ? { ...e, noteLog: [entry, ...(e.noteLog ?? [])] } : e,
      ),
    };
    emit();
  },
  addCompanyHistory(id: string, entry: CompanyHistoryEntry) {
    state = {
      ...state,
      employees: state.employees.map((e) =>
        e.id === id ? { ...e, companyHistory: [entry, ...(e.companyHistory ?? [])] } : e,
      ),
    };
    emit();
  },
  addPayrollIssue(p: Omit<PayrollIssue, "id" | "reportedAt" | "status"> & { status?: PayrollIssue["status"] }) {
    const newP: PayrollIssue = {
      id: `p_${Date.now()}`,
      reportedAt: new Date().toISOString().slice(0, 10),
      status: p.status ?? "Open",
      ...p,
    };
    state = { ...state, payrollIssues: [newP, ...state.payrollIssues] };
    emit();
  },
  resolvePayroll(id: string) {
    const prev = state.payrollIssues.find((p) => p.id === id);
    state = {
      ...state,
      payrollIssues: state.payrollIssues.map((p) =>
        p.id === id ? { ...p, status: "Resolved" } : p,
      ),
    };
    if (prev && prev.status !== "Resolved") {
      const amt = prev.amount ? ` ($${prev.amount.toFixed(2)})` : "";
      appendNote(prev.employeeId, `✓ Payroll issue resolved: ${prev.issue}${amt}`);
    }
    emit();
  },
  updatePayroll(id: string, patch: Partial<PayrollIssue>) {
    if (patch.status === "Resolved") {
      this.resolvePayroll(id);
      return;
    }
    state = {
      ...state,
      payrollIssues: state.payrollIssues.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    };
    emit();
  },
  deleteTask(id: string) {
    state = { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
    emit();
  },
  deleteRequest(id: string) {
    state = { ...state, requests: state.requests.filter((r) => r.id !== id) };
    emit();
  },
  deletePayroll(id: string) {
    state = { ...state, payrollIssues: state.payrollIssues.filter((p) => p.id !== id) };
    emit();
  },
};

import type { TaskStatus } from "./mock-data";

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
