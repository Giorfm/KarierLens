import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KarierLens — Penerjemah Pengalaman Kampus ke Bahasa Rekruter",
  description:
    "Ubah pengalaman organisasi, kepanitiaan, danus, asisten lab, dan proyek kuliah menjadi poin CV terukur dan relevan dengan Job Description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
