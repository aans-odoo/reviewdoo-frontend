import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamLogoProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  /** Team logo image URL. When empty, an initial-based avatar is shown. */
  logoUrl?: string | null;
  /** Team name — drives the fallback initial and the image alt text. */
  teamName?: string | null;
}

/**
 * The team logo shown in the header and in the settings preview. Centralizing
 * it here means logo styling (size, border, etc.) is managed in one place.
 *
 * Falls back to an avatar with the team's first initial when no logo URL is
 * set, and to "O" when there's no team name either.
 */
export const TeamLogo = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  TeamLogoProps
>(({ logoUrl, teamName, className, ...props }, ref) => {
  const initial = teamName?.trim()?.charAt(0).toUpperCase() || "O";
  const url = logoUrl?.trim();

  return (
    <Avatar ref={ref} className={cn("h-8 w-8", className)} {...props}>
      {url && <AvatarImage src={url} alt={teamName ? `${teamName} logo` : "Team logo"} />}
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
});
TeamLogo.displayName = "TeamLogo";
