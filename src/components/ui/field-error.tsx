import { cn } from "@/lib/utils";

interface FieldErrorProps {
  /** Referenced by the input's `aria-describedby`. */
  id: string;
  message?: string | null;
  className?: string;
}

/** Validation message under a single field; renders nothing when valid. */
export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className={cn("mt-1.5 px-5 text-xs text-expense", className)}>
      {message}
    </p>
  );
}
