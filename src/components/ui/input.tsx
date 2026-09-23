import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * Filled/pill style input — no visible border by default, label text
 * lives inside as placeholder (ref: minimal login form mockup) rather
 * than as a separate <Label> above the field.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-full border bg-muted px-5 py-3 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-transparent",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
