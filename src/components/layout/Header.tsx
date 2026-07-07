import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "../ui/logo";
import { BookOpen } from "lucide-react";

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between rounded-md border border-border bg-theme-bg-card px-5">
      <Link to="/">
        <Logo />
      </Link>
      {!isAuthenticated ? (
        <Link to="/about" className="hidden text-sm text-theme-text-dim hover:text-theme-text transition-colors sm:flex items-center gap-2">
          <BookOpen className="w-4 h-4"/>About
        </Link>
      ) : (
        <span className="hidden text-sm text-theme-text-dim sm:block">
          Self-check your changes before you open a PR
        </span>
      )}
    </header>
  );
}
