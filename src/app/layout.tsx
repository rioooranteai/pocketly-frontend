import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  // Pages set just their own name, e.g. "Transaksi · Pocketly".
  title: {
    template: "%s · Pocketly",
    default: "Pocketly - AI Finance Tracker",
  },
  description: "Track your expenses with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={roboto.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
