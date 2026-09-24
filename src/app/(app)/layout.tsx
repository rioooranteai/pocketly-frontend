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
      <div className="flex h-dvh flex-col gap-4 bg-background p-4 lg:flex-row">
        <MobileNav className="lg:hidden" />
        <Sidebar className="hidden lg:block" />
        {/* min-w-0: a flex child otherwise grows to its content's width,
            which is what pushes the page into horizontal scrolling. */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
