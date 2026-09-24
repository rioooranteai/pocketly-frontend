import { Wallet } from "lucide-react";
import { AuthVisualPanel } from "@/features/auth/components/auth-visual-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen gap-4 bg-background p-4">
      {/* Left — form panel */}
      <div className="flex flex-1 flex-col overflow-y-auto rounded-3xl bg-card p-8">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet size={22} />
          </div>
          <span className="text-2xl font-bold text-foreground">Pocketly</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="auth-form-enter w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>

      {/* Right — crossfade image */}
      <AuthVisualPanel />
    </div>
  );
}
