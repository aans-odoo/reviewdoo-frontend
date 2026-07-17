import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Logo } from "../ui/logo";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Header() {
  const { isAuthenticated } = useAuth();
  const { settings } = useAppSettings();
  const teamName = settings?.teamName || "Team";

  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between rounded-md border border-border bg-theme-bg-card px-5">
      <Link to="/">
        <Logo />
      </Link>
      <div className="flex items-center gap-3">
        {!isAuthenticated && (
          <>
            <Link to="/about" className="hidden text-sm text-theme-text-dim hover:text-theme-text transition-colors sm:flex items-center gap-2">
              <BookOpen className="w-4 h-4" />About
            </Link>
            <span className="w-px h-4 bg-theme-text-muted opacity-30"/>
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <TeamLogo
              logoUrl={settings?.teamLogoUrl}
              teamName={settings?.teamName}
              className="w-8 cursor-default"
            />
          </TooltipTrigger>
          <TooltipContent side="right">{teamName}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
