import { Logo } from "../ui/logo";

export function Header() {
  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between rounded-md border border-border bg-theme-bg-card px-5">
      <Logo />
      <span className="hidden text-sm text-theme-text-dim sm:block">
        Self-check your changes before you open a PR
      </span>
    </header>
  );
}
