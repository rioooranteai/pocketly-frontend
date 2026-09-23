import type { ReactNode } from "react";
import { PenLine, Camera } from "lucide-react";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ChooseMethodStepProps {
  onManual: () => void;
  onScan: () => void;
}

export function ChooseMethodStep({ onManual, onScan }: ChooseMethodStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Tambah Transaksi</DialogTitle>
        <DialogDescription>Pilih cara mencatat pengeluaran kamu.</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <MethodOption
          onClick={onManual}
          icon={<PenLine size={20} />}
          iconClassName="bg-muted text-foreground"
          title="Input Manual"
          subtitle="Isi sendiri detailnya"
        />
        <MethodOption
          onClick={onScan}
          icon={<Camera size={20} />}
          iconClassName="bg-primary/15 text-primary"
          title="Scan Struk"
          subtitle="AI baca otomatis"
        />
      </div>
    </>
  );
}

interface MethodOptionProps {
  onClick: () => void;
  icon: ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
}

function MethodOption({
  onClick,
  icon,
  iconClassName,
  title,
  subtitle,
}: MethodOptionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 rounded-2xl border border-border p-6 text-center transition-colors hover:border-primary hover:bg-muted/50"
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          iconClassName
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}
