/**
 * Client-side PDF text extractor using local pdfjs-dist worker from /public/pdf.worker.min.mjs.
 * Zero external CDN runtime dependencies.
 */

export async function extractTextFromPdf(file: File): Promise<string> {
  // 1. Validasi tipe file
  if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Format file tidak didukung. Harap unggah file PDF.");
  }

  // 2. Batas ukuran 5 MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran file PDF melebihi batas maksimal 5 MB.");
  }

  let pdfDoc;
  try {
    // Dynamic import client-side only
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });

    pdfDoc = await loadingTask.promise;
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || "";
    if (errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("encrypted")) {
      throw new Error("PDF terkunci. Tempel teks CV secara manual.");
    }
    throw new Error(`Gagal membuka file PDF: ${errorMsg || "File rusak atau tidak terbaca."}`);
  }

  const numPages = pdfDoc.numPages;
  const pagesToExtract = Math.min(numPages, 5);
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pagesToExtract; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageString = "";
      for (const item of textContent.items) {
        if ("str" in item) {
          pageString += item.str + (item.hasEOL ? "\n" : " ");
        }
      }

      if (pageString.trim().length > 0) {
        pageTexts.push(pageString.trim());
      }
    } catch {
      // Continue next page if one page fails
    }
  }

  const fullText = pageTexts
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 3. Validasi hasil ekstraksi
  if (fullText.length < 80) {
    throw new Error(
      "PDF sepertinya hasil scan/gambar sehingga teksnya tidak terbaca. Tempel teks CV secara manual."
    );
  }

  return fullText;
}
