"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Side panel built on the Radix Dialog primitive — same focus trap,
 * ESC handling and aria wiring as Dialog, docked to a screen edge.
 */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right";
    showClose?: boolean;
  }
>(({ className, children, side = "right", showClose = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/35 data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out motion-reduce:animate-none" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-4 z-50 flex w-[calc(100%-2rem)] flex-col overflow-hidden rounded-3xl bg-card shadow-xl focus:outline-none motion-reduce:animate-none",
        side === "right"
          ? "right-4 max-w-[480px] data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right"
          : "left-4 max-w-[300px] data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left",
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X size={18} />
          <span className="sr-only">Tutup</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
};
