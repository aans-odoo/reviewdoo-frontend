import { Bell } from "lucide-react";
import { Logo } from "../ui/logo";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between rounded-md border border-border bg-theme-bg-card px-5">
      <Logo />

      {/* Notification */}
      <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
        <Bell size={20} />
      </Button>
    </header>
  );
}
