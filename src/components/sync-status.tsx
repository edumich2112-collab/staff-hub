import { useEffect, useState, useSyncExternalStore } from "react";
import { Cloud, CloudOff, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { pendingCount, subscribeQueue } from "@/lib/offline-db";
import { isLocalMode, subscribeLocalMode } from "@/lib/local-mode";
import { syncNow } from "@/lib/store";
import { cn } from "@/lib/utils";

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function usePending() {
  return useSyncExternalStore(
    subscribeQueue,
    () => pendingCount(),
    () => 0,
  );
}

function useLocalOnly() {
  return useSyncExternalStore(
    subscribeLocalMode,
    () => isLocalMode(),
    () => false,
  );
}

export function SyncStatus() {
  const online = useOnline();
  const localOnly = useLocalOnly();
  const pending = usePending();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (localOnly) {
      toast.info("You're working offline without an account — sign in to share these changes.");
      return;
    }
    if (!online) {
      toast.error("You're offline — changes will sync when you reconnect.");
      return;
    }
    setSyncing(true);
    const { synced, failed } = await syncNow();
    setSyncing(false);
    if (failed > 0) toast.error(`${failed} change${failed === 1 ? "" : "s"} couldn't sync yet.`);
    else if (synced > 0) toast.success(`Shared ${synced} offline change${synced === 1 ? "" : "s"}.`);
    else toast.success("Everything is up to date.");
  }


  const connected = online && !localOnly;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex",
          connected
            ? "border-success/30 bg-success/10 text-success"
            : "border-warning/30 bg-warning/10 text-warning",
        )}
        title={
          localOnly
            ? "Local only — no account, data stays on this computer"
            : connected
              ? "Connected — data is shared with your team"
              : "Offline — working locally"
        }
      >
        {localOnly ? (
          <HardDrive className="h-3.5 w-3.5" />
        ) : connected ? (
          <Cloud className="h-3.5 w-3.5" />
        ) : (
          <CloudOff className="h-3.5 w-3.5" />
        )}
        {localOnly ? "Local only" : connected ? "Online" : "Offline"}
        {pending > 0 && <span className="opacity-80">· {pending} pending</span>}
      </span>
      <Button
        variant={pending > 0 && connected ? "default" : "ghost"}
        size="sm"
        className="h-8 gap-1.5 px-2"
        onClick={handleSync}
        disabled={syncing}
        aria-label="Share offline changes"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
        <span className="hidden md:inline">{pending > 0 ? `Share ${pending}` : "Sync"}</span>
      </Button>
    </div>

  );
}
