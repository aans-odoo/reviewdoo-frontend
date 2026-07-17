import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ClipboardCheck,
  Brain,
  Network,
  UserCog,
  Mail,
  Settings,
  SlidersHorizontal,
  LogOut,
  Info,
  HelpCircle,
  Radio,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsSticky } from "@/hooks/useIsSticky";
import { Logo } from "../ui/logo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const { isAdmin, user, logout, updateProfile } = useAuth();
  const { stickyElRef, isSticky } = useIsSticky<HTMLElement>();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  function openProfileDialog() {
    setProfileName(user?.name ?? "");
    setProfileAvatarUrl(user?.avatarUrl ?? "");
    setProfileOpen(true);
  }

  async function handleProfileSave() {
    setProfileSaving(true);
    try {
      await updateProfile({ name: profileName, avatarUrl: profileAvatarUrl });
      setProfileOpen(false);
    } finally {
      setProfileSaving(false);
    }
  }

  const navItems = [
    {
      to: "/review-checklists",
      label: "Review Checklists",
      icon: ClipboardCheck,
    },
    { to: "/mcp-config", label: "MCP Config", icon: Network },
    { to: "/ai-config", label: "AI Config", icon: Brain },
  ];

  const adminItems = [
    { to: "/users", label: "User Management", icon: UserCog },
    { to: "/mcp-clients", label: "MCP Clients", icon: Radio },
    { to: "/smtp-config", label: "SMTP Config", icon: Mail },
    { to: "/app-settings", label: "App Settings", icon: SlidersHorizontal },
  ];

  return (
    <>
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
        <nav className={`flex-1 space-y-1 overflow-y-auto px-2 py-3 ${isSticky ? "mt-6" : "mt-14"}`}>
          {navItems.map((item) => (
            <div key={item.to}>
              <SidebarLink to={item.to} label={item.label} icon={item.icon} />
            </div>
          ))}
          {isAdmin && (
            <div className="pt-5">
              <div className="border-t border-border pt-5" />
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-theme-text-dim">
                Admin
              </p>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <SidebarLink key={item.to} {...item} />
                ))}
              </div>
            </div>
          )}

          {/* About link at the end */}
          <div className="pt-5">
            <div className="border-t border-border pt-5" />
            <SidebarLink to="/how-to-use" label="How to Use" icon={HelpCircle} />
            <SidebarLink to="/about" label="About" icon={Info} />
          </div>
        </nav>

        {/* User area with settings dropdown */}
        <div className="border-t border-border">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <Avatar>
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name ?? "User avatar"} />}
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
                  onClick={openProfileDialog}
                  className="cursor-pointer text-theme-text-muted focus:text-theme-text"
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
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

      {/* Profile Edit Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your display name and avatar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-avatar">Avatar URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="profile-avatar"
                  value={profileAvatarUrl}
                  onChange={(e) => setProfileAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
                {profileAvatarUrl && (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profileAvatarUrl} alt="Avatar preview" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileSave} disabled={profileSaving || !profileName.trim()}>
              {profileSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SidebarLink({
  to,
  label,
  icon: Icon,
  indent = false,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  indent?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 relative rounded-md px-4 py-2.5 text-sm font-normal transition-all duration-150",
          indent && "ml-8 my-1",
          isActive
            ? "bg-theme-primary-muted text-theme-primary-light font-medium"
            : "text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text"
        )
      }
    >
      {indent
        &&
        <span className="absolute -left-2.5 top-1 w-2 h-4 border-l border-b border-dotted border-theme-text-muted/50 rounded-bl-[4px]" />
      }
      <Icon size={indent ? 15 : 18} />
      {label}
    </NavLink>
  );
}
