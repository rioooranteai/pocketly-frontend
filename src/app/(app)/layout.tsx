import { Sidebar } from "@/components/shared/sidebar";
import { MobileNav } from "@/components/shared/mobile-nav";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-dvh flex-col gap-4 bg-background p-4 md:flex-row">
        <MobileNav className="md:hidden" />
        <Sidebar className="hidden md:block" />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
