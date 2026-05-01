import { NavLink } from "react-router-dom";
import {
  ClipboardCheck,
  BookOpen,
  Users,
  ScrollText,
  Brain,
  Sparkles,
  UserCog,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsSticky } from "@/hooks/useIsSticky";
import { Logo } from "../ui/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/checklist-items", label: "Checklist Items", icon: ClipboardCheck },
  { to: "/guidelines", label: "Guidelines", icon: BookOpen },
  { to: "/authors", label: "Authors", icon: Users },
  { to: "/ingestion-logs", label: "Ingestion Logs", icon: ScrollText },
  { to: "/ai-config", label: "AI Config", icon: Brain },
  { to: "/prompt-generator", label: "Prompt Generator", icon: Sparkles },
];

const adminItems = [
  { to: "/users", label: "User Management", icon: UserCog },
  { to: "/smtp-config", label: "SMTP Config", icon: Mail },
];

export function Sidebar() {
  const { isAdmin, user, logout } = useAuth();
  const { stickyElRef, isSticky } = useIsSticky<HTMLElement>();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside
      ref={stickyElRef}
      className={cn(
        "flex w-[260px] sticky top-2 flex-shrink-0 flex-col rounded-md border border-border bg-theme-bg-card overflow-hidden transition-all",
        isSticky ? "h-[calc(100vh-1rem)]" : "h-[calc(100vh-60px-1.5rem)]"
      )}
    >
      {/* Collapsible logo — visible when header scrolls away */}
      <div
        className={cn(
          "px-5 overflow-hidden transition-all duration-500",
          isSticky ? "h-20 pt-6 pb-4 border-b" : "h-0"
        )}
      >
        <Logo />
      </div>

      {/* Nav items */}
      <nav className={`flex-1 space-y-0.5 overflow-y-auto p-3 ${isSticky ? "mt-6" : "mt-14"}`}>
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
        {isAdmin && (
          <div className="pt-5">
            <div className="border-t border-border pt-5" />
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-theme-text-dim">
              Admin
            </p>
            {adminItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        )}
      </nav>

      {/* User area with settings dropdown */}
      <div className="border-t border-border">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-theme-text truncate">
              {user?.name ?? user?.email}
            </div>
            <div className="text-[11px] text-theme-text-dim capitalize">
              {user?.role}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                aria-label="Settings menu"
              >
                <Settings size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-48">
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-theme-text-muted focus:text-theme-text"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-normal transition-all duration-150",
          isActive
            ? "bg-theme-primary-muted text-theme-primary-light font-medium"
            : "text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text"
        )
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
