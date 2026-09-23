import { Wallet } from "lucide-react";

/**
 * Auth layout — split screen (ref: contact-form mockup), left side form
 * (via children), right side a brand visual panel instead of a generic
 * photo, reusing the same floating rounded-3xl + coral gradient language
 * as the dashboard sidebar/stat cards.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen gap-4 bg-background p-4">
      <div className="flex flex-1 flex-col overflow-y-auto rounded-3xl bg-card p-8">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet size={22} />
          </div>
          <span className="text-2xl font-bold text-foreground">Pocketly</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {children}
        </div>
      </div>

      <div className="relative hidden w-[60%] shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#EC8264] to-[#F3AD91] lg:block">
        {/* Decorative circles — echoes the nested-circle chart motif */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute right-10 top-1/3 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <div>
            <h2 className="text-3xl font-semibold leading-snug">
              Kelola keuanganmu,
              <br />
              ditemani AI.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/80">
              Scan struk, catat pengeluaran, dan dapatkan insight otomatis
              dari kebiasaan finansialmu.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-white/70">Income</p>
              <p className="text-lg font-semibold">+Rp 8.000.000</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-white/70">Expense</p>
              <p className="text-lg font-semibold">-Rp 3.750.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
