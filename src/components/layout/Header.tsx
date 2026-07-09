import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "../ui/logo";
import { BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Header() {
  const { isAuthenticated } = useAuth();

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
            <img src="https://download.odoocdn.com/icons/website/static/description/icon.svg" className="w-6 h-6" />
          </TooltipTrigger>
          <TooltipContent side="right">Website</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
