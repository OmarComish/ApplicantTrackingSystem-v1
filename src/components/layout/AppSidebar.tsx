import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Users, BarChart3, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, Permission } from "@/contexts/AuthContext";

interface AppSidebarProps {
  collapsed: boolean;
}

const navItems: { icon: React.ElementType; label: string; path: string; permission: Permission }[] = [
  { icon: LayoutDashboard, label: "Dashboard",    path: "/",           permission: "view:dashboard"  },
  { icon: Briefcase,       label: "Job Postings", path: "/jobs",       permission: "view:jobs"       },
  { icon: Users,           label: "Applicants",   path: "/applicants", permission: "view:applicants" },
  { icon: BarChart3,       label: "Reports",      path: "/reports",    permission: "view:reports"    },
  { icon: Settings,        label: "Settings",     path: "/settings",   permission: "view:settings"   },
];

const ROLE_BADGE: Record<string, string> = {
  Admin:        "bg-destructive/20 text-destructive",
  "HR Manager": "bg-primary/20 text-primary",
  Recruiter:    "bg-accent/20 text-accent",
  Viewer:       "bg-muted-foreground/20 text-muted-foreground",
};

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const location = useLocation();
  const { can, user } = useAuth();

  const visibleItems = navItems.filter((item) => can(item.permission));

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        "hidden lg:flex"
      )}
    >
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-sidebar-primary">
              {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??"}
            </span>
          </div>
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="h-2.5 w-2.5 flex-shrink-0 text-sidebar-foreground/50" />
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium",
                  ROLE_BADGE[user.role] ?? "bg-muted text-muted-foreground"
                )}>
                  {user.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
