import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.resolve(__dirname, "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const targetDir = path.resolve(__dirname, "../public");
const target = path.resolve(targetDir, "pdf.worker.min.mjs");

try {
  if (!fs.existsSync(source)) {
    console.warn("Peringatan: pdfjs-dist belum terpasang atau file worker tidak ditemukan di:", source);
    process.exit(0);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.copyFileSync(source, target);
  console.log("Berhasil menyalin pdf.worker.min.mjs ke public/");
} catch (err) {
  console.warn("Gagal menyalin pdf.worker.min.mjs:", err.message);
  process.exit(0);
}
