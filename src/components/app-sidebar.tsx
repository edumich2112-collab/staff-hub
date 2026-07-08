import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CheckSquare,
  Building2,
  Inbox,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Requests", url: "/requests", icon: Inbox },
  { title: "Employees", url: "/employees", icon: Users },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openReqs = useStore((s) => s.requests.filter((r) => r.status !== "Resolved").length);
  const openTasks = useStore((s) => s.tasks.filter((t) => t.status !== "Completed").length);

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.url : pathname.startsWith(item.url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
            S
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Staffhub</span>
            <span className="text-[11px] text-muted-foreground">Operations</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = isActive(item);
                const badge =
                  item.url === "/requests" ? openReqs : item.url === "/tasks" ? openTasks : 0;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {badge > 0 && (
                          <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                            {badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
