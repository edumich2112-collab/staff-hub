/**
 * Offline-first data layer.
 *
 * Wraps the small subset of the Supabase query builder that the store uses and
 * adds two things:
 *   - reads fail soft when the device is offline (the store falls back to its
 *     local cache)
 *   - writes made while offline are queued in localStorage and replayed, in
 *     order, as soon as the device is back online and signed in.
 */
import { supabase } from "@/integrations/supabase/client";

export type QueuedOp = {
  id: string;
  table: string;
  op: "insert" | "update" | "delete";
  values?: Record<string, unknown>;
  match?: Record<string, unknown>;
  at: number;
};

const QUEUE_KEY = "staffhub.pending-ops.v1";

const isBrowser = () => typeof window !== "undefined";

export const isOnline = () => (isBrowser() ? navigator.onLine : true);

function uuid() {
  if (isBrowser() && typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/* ---------------- queue storage ---------------- */

const queueListeners = new Set<() => void>();

export function subscribeQueue(l: () => void) {
  queueListeners.add(l);
  return () => queueListeners.delete(l);
}

function notifyQueue() {
  queueListeners.forEach((l) => l());
}

export function readQueue(): QueuedOp[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(ops: QueuedOp[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
  } catch {
    /* storage full — nothing we can do */
  }
  notifyQueue();
}

export function pendingCount() {
  return readQueue().length;
}

export function clearQueue() {
  writeQueue([]);
}

function enqueue(op: Omit<QueuedOp, "id" | "at">) {
  writeQueue([...readQueue(), { ...op, id: uuid(), at: Date.now() }]);
}

/* ---------------- query builders ---------------- */

type Result<T> = { data: T; error: unknown };

const offlineError = { message: "offline", offline: true };

class SelectBuilder implements PromiseLike<Result<Record<string, unknown>[] | null>> {
  constructor(private table: string) {}
  private orderArgs: [string, { ascending?: boolean }?] | undefined;

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderArgs = [col, opts];
    return this;
  }

  private async run(): Promise<Result<Record<string, unknown>[] | null>> {
    if (!isOnline()) return { data: null, error: offlineError };
    let q = supabase.from(this.table as never).select("*");
    if (this.orderArgs) q = q.order(this.orderArgs[0], this.orderArgs[1]) as typeof q;
    const res = await q;
    return { data: (res.data as Record<string, unknown>[] | null) ?? null, error: res.error };
  }

  then<R1 = Result<Record<string, unknown>[] | null>, R2 = never>(
    onfulfilled?: ((v: Result<Record<string, unknown>[] | null>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

class InsertBuilder implements PromiseLike<Result<null>> {
  constructor(
    private table: string,
    private values: Record<string, unknown>,
  ) {}

  select() {
    return {
      single: async (): Promise<Result<Record<string, unknown> | null>> => {
        if (!isOnline()) {
          const row = this.localRow();
          enqueue({ table: this.table, op: "insert", values: row });
          return { data: row, error: null };
        }
        const res = await supabase
          .from(this.table as never)
          .insert(this.values as never)
          .select()
          .single();
        if (res.error) {
          const row = this.localRow();
          enqueue({ table: this.table, op: "insert", values: row });
          return { data: row, error: null };
        }
        return { data: res.data as Record<string, unknown>, error: null };
      },
    };
  }

  private localRow(): Record<string, unknown> {
    const now = new Date().toISOString();
    const row: Record<string, unknown> = { ...this.values };
    if (this.table !== "companies" && row.id == null) row.id = uuid();
    row.created_at ??= now;
    if (this.table === "employee_notes") row.at ??= now;
    if (this.table === "requests") row.submitted_at ??= now;
    if (this.table === "payroll_issues") row.reported_at ??= now.slice(0, 10);
    return row;
  }

  private async run(): Promise<Result<null>> {
    if (!isOnline()) {
      enqueue({ table: this.table, op: "insert", values: this.localRow() });
      return { data: null, error: null };
    }
    const res = await supabase.from(this.table as never).insert(this.values as never);
    if (res.error) enqueue({ table: this.table, op: "insert", values: this.localRow() });
    return { data: null, error: null };
  }

  then<R1 = Result<null>, R2 = never>(
    onfulfilled?: ((v: Result<null>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

class MutateBuilder implements PromiseLike<Result<null>> {
  private match: Record<string, unknown> = {};
  constructor(
    private table: string,
    private op: "update" | "delete",
    private values?: Record<string, unknown>,
  ) {}

  eq(col: string, val: unknown) {
    this.match[col] = val;
    return this;
  }

  private async run(): Promise<Result<null>> {
    if (!isOnline()) {
      enqueue({ table: this.table, op: this.op, values: this.values, match: this.match });
      return { data: null, error: null };
    }
    const base = supabase.from(this.table as never);
    let q =
      this.op === "update"
        ? (base.update(this.values as never) as unknown as { eq: (c: string, v: unknown) => never })
        : (base.delete() as unknown as { eq: (c: string, v: unknown) => never });
    for (const [col, val] of Object.entries(this.match)) {
      q = (q as { eq: (c: string, v: unknown) => never }).eq(col, val);
    }
    const res = (await (q as unknown as PromiseLike<{ error: unknown }>)) as { error: unknown };
    if (res.error) {
      enqueue({ table: this.table, op: this.op, values: this.values, match: this.match });
    }
    return { data: null, error: null };
  }

  then<R1 = Result<null>, R2 = never>(
    onfulfilled?: ((v: Result<null>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export const db = {
  from(table: string) {
    return {
      select: (_cols?: string) => new SelectBuilder(table),
      insert: (values: Record<string, unknown>) => new InsertBuilder(table, values),
      update: (values: Record<string, unknown>) => new MutateBuilder(table, "update", values),
      delete: () => new MutateBuilder(table, "delete"),
    };
  },
};

/* ---------------- replay ---------------- */

let flushing = false;

export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  if (flushing || !isOnline()) return { synced: 0, failed: 0 };
  const ops = readQueue();
  if (ops.length === 0) return { synced: 0, failed: 0 };

  flushing = true;
  let synced = 0;
  const remaining: QueuedOp[] = [];

  try {
    for (const op of ops) {
      try {
        const base = supabase.from(op.table as never);
        let error: unknown = null;
        if (op.op === "insert") {
          ({ error } = await base.upsert(op.values as never));
        } else if (op.op === "update") {
          let q = base.update(op.values as never) as unknown as {
            eq: (c: string, v: unknown) => never;
          };
          for (const [c, v] of Object.entries(op.match ?? {})) q = (q as never as typeof q).eq(c, v);
          ({ error } = (await (q as unknown as PromiseLike<{ error: unknown }>)) as {
            error: unknown;
          });
        } else {
          let q = base.delete() as unknown as { eq: (c: string, v: unknown) => never };
          for (const [c, v] of Object.entries(op.match ?? {})) q = (q as never as typeof q).eq(c, v);
          ({ error } = (await (q as unknown as PromiseLike<{ error: unknown }>)) as {
            error: unknown;
          });
        }
        if (error) remaining.push(op);
        else synced++;
      } catch {
        remaining.push(op);
      }
    }
  } finally {
    flushing = false;
    writeQueue(remaining);
  }

  return { synced, failed: remaining.length };
}
