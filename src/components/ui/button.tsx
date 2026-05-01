import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 rounded-full",
  {
    variants: {
      variant: {
        default:
          "bg-theme-primary text-white hover:bg-theme-primary-dark",
        destructive:
          "bg-theme-danger text-white hover:opacity-90",
        outline:
          "border border-border-light bg-transparent text-theme-text hover:bg-theme-bg-hover",
        secondary:
          "bg-theme-bg-elevated text-theme-text border border-border hover:bg-theme-bg-hover",
        ghost:
          "text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text",
        link: "text-theme-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-br from-theme-primary to-theme-accent text-white hover:opacity-90",
      },
      size: {
        default: "h-[38px] px-5 py-2 text-[14px]",
        sm: "h-8 px-3.5 text-[13px]",
        lg: "h-11 px-7 text-[15px]",
        icon: "h-[38px] w-[38px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
