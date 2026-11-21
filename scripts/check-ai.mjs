#!/usr/bin/env node

/**
 * Preflight script: check-ai.mjs
 * Validates connection to Gemini API or DeepSeek API.
 * Never prints full API key (at most last 4 chars).
 */

const apiKey =
  process.env.DEEPSEEK_API_KEY?.trim() ||
  process.env.TOKEN_GATEWAY_API_KEY?.trim() ||
  process.env.GEMINI_API_KEY?.trim();

const isGoogleKey = apiKey?.startsWith("AIza");

const configuredModel =
  process.env.DEEPSEEK_MODEL?.trim() ||
  process.env.GEMINI_MODEL?.trim() ||
  (isGoogleKey ? "gemini-2.5-flash" : "deepseek-flash");

let rawBaseUrl =
  process.env.DEEPSEEK_BASE_URL?.trim() ||
  process.env.GEMINI_BASE_URL?.trim() ||
  (isGoogleKey
    ? "https://generativelanguage.googleapis.com/v1beta/openai"
    : "https://tokengateway.dev/v1");

if (rawBaseUrl.includes("generativelanguage.googleapis.com") && !rawBaseUrl.includes("/openai")) {
  rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, "")}/openai`;
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");
const isGemini = configuredModel.toLowerCase().includes("gemini") || isGoogleKey;
const disableThinking = !isGemini && process.env.DEEPSEEK_DISABLE_THINKING !== "false";

console.log("=== KARIERLENS AI GATEWAY PREFLIGHT ===");
console.log(`Provider          : ${isGemini ? "Google Gemini" : "DeepSeek / TokenGateway"}`);
console.log(`Base URL          : ${baseUrl}`);
console.log(`Configured Model  : ${configuredModel}`);
if (!isGemini) {
  console.log(`Disable Thinking  : ${disableThinking}`);
}

if (!apiKey || apiKey === "isi_api_key_anda_di_sini" || apiKey === "isi_api_key_tokengateway_di_sini" || apiKey === "isi_api_key_gemini_di_sini" || apiKey.trim() === "") {
  console.error("\n❌ ERROR: API key belum diisi di .env.local.");
  console.error("   Tambahkan baris berikut di .env.local Anda:");
  console.error("   DEEPSEEK_API_KEY=kunci_api_tokengateway_anda");
  console.error("   DEEPSEEK_BASE_URL=https://tokengateway.dev/v1");
  console.error("   DEEPSEEK_MODEL=deepseek-flash");
  process.exit(1);
}

const maskedKey = apiKey.length > 4 ? `...${apiKey.slice(-4)}` : "***";
console.log(`API Key           : ${maskedKey}`);
console.log("-----------------------------------------");

async function main() {
  let modelsFound = [];

  // Step 1: Query models
  console.log(`\n[1/3] Memeriksa daftar model yang tersedia...`);
  try {
    const modelsUrl = isGoogleKey && !baseUrl.includes("/openai")
      ? `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      : `${baseUrl}/models`;

    const headers = isGoogleKey && !baseUrl.includes("/openai")
      ? {}
      : { Authorization: `Bearer ${apiKey}` };

    const modelsRes = await fetch(modelsUrl, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (modelsRes.ok) {
      const data = await modelsRes.json();
      const list = Array.isArray(data?.models)
        ? data.models
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      modelsFound = list.map((m) => {
        const id = typeof m === "string" ? m : m.id || m.name || "";
        return id.replace(/^models\//, "");
      }).filter(Boolean);

      console.log(`✓ Ditemukan ${modelsFound.length} model.`);
      const top30 = modelsFound.slice(0, 30);
      console.log(`  Daftar (maks 30): ${top30.join(", ")}`);

      const hasModel = modelsFound.some((m) => m.toLowerCase() === configuredModel.toLowerCase());
      if (hasModel) {
        console.log(`✓ Model "${configuredModel}" DITEMUKAN di daftar.`);
      } else {
        console.warn(`⚠️ Catatan: Model "${configuredModel}" tidak langsung muncul di cuplikan /models, namun tetap dapat digunakan.`);
      }
    } else {
      console.warn(`⚠️ Endpoint /models mengembalikan status ${modelsRes.status}. Melanjutkan ke tes chat...`);
    }
  } catch (err) {
    console.warn(`⚠️ Tidak dapat mengambil daftar /models: ${err.message}. Melanjutkan ke tes chat...`);
  }

  // Step 2: Test Chat Completion with JSON mode
  console.log("\n[2/3] Menguji Chat Completion dengan format JSON...");
  const testPayload1 = {
    model: configuredModel,
    messages: [
      { role: "system", content: "Balas HANYA dengan JSON valid: {\"ok\": true}" },
      { role: "user", content: "Ping" },
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" },
  };

  const startT1 = Date.now();
  let test1Success = false;

  try {
    const res1 = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(testPayload1),
      signal: AbortSignal.timeout(15000),
    });

    const lat1 = Date.now() - startT1;
    console.log(`  HTTP Status: ${res1.status} (${lat1} ms)`);

    if (res1.ok) {
      const json1 = await res1.json();
      const content = json1.choices?.[0]?.message?.content || "";
      console.log(`  Konten respon: ${content.trim()}`);
      try {
        const parsed = JSON.parse(content);
        if (parsed.ok === true) {
          console.log("✓ Tes JSON mode berhasil! Konfigurasi saat ini bekerja dengan sempurna.");
          test1Success = true;
        }
      } catch {
        console.warn("⚠️ Respons bukan JSON valid.");
      }
    } else {
      const errText = await res1.text().catch(() => "");
      console.warn(`⚠️ Percobaan endpoint OpenAI mengembalikan (${res1.status}): ${errText.slice(0, 150)}`);
    }
  } catch (err) {
    console.warn(`⚠️ Percobaan OpenAI format gagal: ${err.message}`);
  }

  if (test1Success) {
    console.log("\n🎉 SEMUA PREFLIGHT CHECK SELESAI DAN BERHASIL!");
    process.exit(0);
  }

  // Step 3: If Google key, test native generateContent endpoint
  if (isGemini) {
    console.log("\n[3/3] Menguji native Google Gemini generateContent endpoint...");
    const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent?key=${apiKey}`;
    const nativePayload = {
      contents: [{ role: "user", parts: [{ text: "Balas HANYA satu objek JSON: {\"ok\": true}" }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const startT2 = Date.now();
    try {
      const res2 = await fetch(nativeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nativePayload),
        signal: AbortSignal.timeout(15000),
      });

      const lat2 = Date.now() - startT2;
      console.log(`  Native HTTP Status: ${res2.status} (${lat2} ms)`);

      if (res2.ok) {
        const json2 = await res2.json();
        const text = json2.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log(`  Konten respon: ${text.trim()}`);
        const parsed = JSON.parse(text);
        if (parsed.ok === true) {
          console.log("✓ Tes native Google Gemini generateContent BERHASIL!");
          console.log("\n🎉 SEMUA PREFLIGHT CHECK SELESAI DAN BERHASIL!");
          process.exit(0);
        }
      } else {
        const errText = await res2.text().catch(() => "");
        console.error(`❌ Native Gemini endpoint ditolak (${res2.status}): ${errText.slice(0, 150)}`);
      }
    } catch (err) {
      console.error(`❌ Native Gemini endpoint gagal: ${err.message}`);
    }
  }

  console.error("\n❌ PREFLIGHT CHECK GAGAL.");
  console.error("Periksa kredensial, koneksi jaringan, dan nama model yang tersedia.");
  process.exit(1);
}

main();
