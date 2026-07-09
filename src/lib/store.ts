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

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  updateTask(id: string, patch: Partial<Task>) {
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
    emit();
  },
  updateRequest(id: string, patch: Partial<EmployeeRequest>) {
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
  resolvePayroll(id: string) {
    state = {
      ...state,
      payrollIssues: state.payrollIssues.map((p) =>
        p.id === id ? { ...p, status: "Resolved" } : p,
      ),
    };
    emit();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
