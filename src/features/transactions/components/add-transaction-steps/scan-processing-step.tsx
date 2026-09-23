import { Loader2 } from "lucide-react";

export function ScanProcessingStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
      <Loader2 size={32} className="animate-spin text-primary" />
      <div>
        <p className="text-sm font-medium text-foreground">
          AI lagi baca struk kamu...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Biasanya cuma beberapa detik. Jangan tutup jendela ini dulu.
        </p>
      </div>
    </div>
  );
}
