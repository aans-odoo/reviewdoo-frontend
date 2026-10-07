import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** shadcn-style convenience callback, called alongside `onChange`. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Themed checkbox. Built on a native `<input type="checkbox">` (no extra
 * dependency), so labels, forms and keyboard support work as usual.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onChange, onCheckedChange, ...props }, ref) => (
    <span className={cn("relative inline-flex h-4 w-4 shrink-0", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="peer h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-border-light bg-theme-bg-elevated transition-colors hover:border-theme-primary/60 checked:border-theme-primary checked:bg-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        {...props}
      />
      <Check
        aria-hidden="true"
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
      />
    </span>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
