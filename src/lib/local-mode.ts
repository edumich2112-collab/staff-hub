/**
 * Local-only mode: use the dashboard without signing in.
 *
 * Everything is read from / written to the local cache, and every write is
 * queued so it can be shared with the team later, after signing in.
 */
const KEY = "staffhub.local-mode.v1";

const listeners = new Set<() => void>();

export function subscribeLocalMode(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function isLocalMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLocalMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
