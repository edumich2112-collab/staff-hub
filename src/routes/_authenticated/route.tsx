import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isLocalMode, setLocalMode } from "@/lib/local-mode";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalSearch } from "@/components/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { SyncStatus } from "@/components/sync-status";
import { Button } from "@/components/ui/button";
import {
  loadStore,
  resetStore,
  subscribeRealtime,
  syncNow,
  useStore,
  watchConnection,
} from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Local-only mode: no account, everything stays on this computer.
    if (isLocalMode()) return { user: null };
    // Offline: trust the locally cached session instead of hitting the network.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw redirect({ to: "/auth" });
      return { user: data.session.user };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const loaded = useStore((s) => s.loaded);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    void loadStore().then(() => syncNow());
    const stopWatching = watchConnection();
    const stopRealtime = subscribeRealtime();
    return () => {
      stopWatching();
      stopRealtime();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    resetStore();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <SyncStatus />
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <main className="flex-1 p-6">
            {loaded ? (
              <Outlet />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Loading your workspace…
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
