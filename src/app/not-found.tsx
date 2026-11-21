import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md space-y-4">
        <h2 className="text-xl font-bold text-slate-900">404 — Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-600">
          Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
