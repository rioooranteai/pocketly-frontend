import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { StatusScreen } from "@/components/shared/status-screen";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

/**
 * 404 for unmatched URLs. Sits outside the (app) group because it can't
 * know whether the visitor is signed in; the dashboard link lets AuthGuard
 * send signed-out visitors on to /login.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <StatusScreen
        className="w-full max-w-lg rounded-3xl bg-card"
        icon={<SearchX size={28} />}
        title="Halaman tidak ditemukan"
        description="Alamat yang kamu buka tidak ada atau sudah dipindahkan."
      >
        <Button asChild className="rounded-full px-5">
          <Link href={ROUTES.DASHBOARD}>Ke dashboard</Link>
        </Button>
      </StatusScreen>
    </main>
  );
}
