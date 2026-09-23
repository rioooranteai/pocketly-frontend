import { Sidebar } from "@/components/shared/sidebar";
// import { AuthGuard } from "@/components/shared/auth-guard";

/**
 * ⚠️ AuthGuard temporarily disabled — FE-only development mode, no
 * need to hit backend/login every time to preview pages. Re-enable by
 * uncommenting the import above and wrapping children with <AuthGuard>
 * again before shipping / connecting to real backend flows.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen gap-4 bg-background p-4">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
