import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "karierlens. — Audit CV Kampus ke Bahasa Rekruter",
  description:
    "Terjemahkan pengalaman kampus ke bahasa rekruter dengan poin CV terukur dan relevan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F4F1EA] text-[#1D1D1B] font-sans antialiased selection:bg-[#EFE84A] selection:text-[#1D1D1B]">
        {children}
      </body>
    </html>
  );
}
