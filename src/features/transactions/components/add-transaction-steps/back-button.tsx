import { ChevronLeft } from "lucide-react";

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft size={14} />
      Kembali
    </button>
  );
}
