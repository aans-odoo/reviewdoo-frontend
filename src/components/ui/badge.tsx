import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-theme-bg-elevated text-theme-text border-border",
        secondary:
          "bg-theme-bg-elevated text-theme-text border-border",
        destructive:
          "bg-theme-danger/15 text-theme-danger border-theme-danger/30",
        outline:
          "bg-transparent text-theme-text-muted border-border-light",
        purple:
          "bg-theme-primary/15 text-theme-primary-light border-theme-primary/30",
        green:
          "bg-theme-success/15 text-theme-success border-theme-success/30",
        orange:
          "bg-theme-accent/15 text-theme-accent-light border-theme-accent/30",
        blue:
          "bg-theme-info/15 text-theme-info border-theme-info/30",
        red:
          "bg-theme-danger/15 text-theme-danger border-theme-danger/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
