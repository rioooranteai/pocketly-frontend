"use client";

import { useState, type MouseEvent } from "react";
import { Menu, Wallet } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/sidebar";
import { cn } from "@/lib/utils";

/** Top bar for small screens; the menu opens the sidebar as a drawer. */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  // Close after any nav link / logout click inside the drawer.
  function closeOnNavigate(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a, button")) setOpen(false);
  }

  return (
    <header className={cn("flex shrink-0 items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
          <Wallet size={16} />
        </div>
        <span className="text-[17px] font-bold text-foreground">Pocketly</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Buka menu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu size={18} />
        </SheetTrigger>
        <SheetContent
          side="left"
          showClose={false}
          aria-describedby={undefined}
          className="bg-transparent shadow-none"
        >
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
          <div className="h-full" onClick={closeOnNavigate}>
            <Sidebar variant="drawer" />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
