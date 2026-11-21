import type { ApiErrorCode } from "@/types/karierlens";

export interface LlmCallOptions {
  task: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  maxTokens: number;
  temperature?: number;
}

export interface LlmCallResult {
  rawJson: string;
  parsed: unknown;
  model: string;
  ms: number;
  usage?: { prompt: number; completion: number };
}

export class LlmError extends Error {
  code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "LlmError";
    this.code = code;
  }
}

/**
 * Sanitizes model output: strips markdown fences and extracts from first { to last }.
 */
export function sanitizeJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Strip ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Find first '{' and last '}'
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

/**
 * Calls native Google Gemini generateContent endpoint.
 */
async function callGeminiNative(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number,
  timeoutMs = 28000
): Promise<{ text: string; usage?: { prompt: number; completion: number } }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const cleanModel = model.replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.status === 401 || response.status === 403) {
      throw new LlmError(
        "UPSTREAM",
        "API key Gemini ditolak oleh Google. Periksa kunci API Anda."
      );
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new LlmError(
        "UPSTREAM",
        `Google Gemini API mengembalikan status ${response.status}: ${errText.slice(0, 120)}`
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") {
      throw new LlmError("BAD_JSON", "Gemini tidak mengembalikan teks respon yang valid.");
    }

    const usage = data.usageMetadata
      ? {
          prompt: data.usageMetadata.promptTokenCount ?? 0,
          completion: data.usageMetadata.candidatesTokenCount ?? 0,
        }
      : undefined;

    return { text, usage };
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof LlmError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new LlmError("TIMEOUT", "Waktu permintaan ke Gemini habis (melebihi 28 detik).");
    }
    throw new LlmError("UPSTREAM", `Gagal menghubungi Google Gemini: ${(err as Error).message}`);
  }
}

/**
 * Performs low-level fetch with graceful degradation of optional gateway parameters (OpenAI compatible).
 */
async function fetchWithDegradation(
  baseUrl: string,
  apiKey: string,
  bodyBase: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    max_tokens: number;
  },
  disableThinking: boolean,
  timeoutMs = 28000
): Promise<{ json: Record<string, unknown>; status: number }> {
  // If model is Gemini, do not include thinking parameter
  const isGemini = bodyBase.model.toLowerCase().includes("gemini");

  const attempts = [
    {
      includeResponseFormat: true,
      includeThinking: !isGemini && disableThinking,
    },
    {
      includeResponseFormat: true,
      includeThinking: false,
    },
    {
      includeResponseFormat: false,
      includeThinking: false,
    },
  ];

  let lastResponse: Response | null = null;
  let lastError: Error | null = null;

  for (let i = 0; i < attempts.length; i++) {
    const config = attempts[i];
    const payload: Record<string, unknown> = { ...bodyBase };

    if (config.includeResponseFormat) {
      payload.response_format = { type: "json_object" };
    }
    if (config.includeThinking) {
      payload.thinking = { type: "disabled" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      lastResponse = response;

      // 401 or 403: auth failure
      if (response.status === 401 || response.status === 403) {
        throw new LlmError(
          "UPSTREAM",
          "API key ditolak oleh penyedia model. Periksa key dan base URL."
        );
      }

      // 400 or 422: degrade to next level
      if ((response.status === 400 || response.status === 422) && i < attempts.length - 1) {
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        if (response.status >= 500) {
          throw new LlmError("UPSTREAM", `Layanan AI upstream mengalami kendala (${response.status}). Coba lagi beberapa saat.`);
        }
        throw new LlmError("UPSTREAM", `Permintaan ditolak oleh penyedia (${response.status}): ${errorText.slice(0, 100)}`);
      }

      const resJson = (await response.json()) as Record<string, unknown>;
      return { json: resJson, status: response.status };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof LlmError) {
        throw err;
      }
      if (err instanceof Error && err.name === "AbortError") {
        throw new LlmError("TIMEOUT", "Waktu permintaan ke AI habis (melebihi 28 detik).");
      }
      lastError = err as Error;
      break;
    }
  }

  if (lastResponse && !lastResponse.ok) {
    throw new LlmError("UPSTREAM", `Layanan AI upstream merespons dengan status ${lastResponse.status}`);
  }

  throw new LlmError(
    "UPSTREAM",
    lastError ? `Gagal menghubungi penyedia AI: ${lastError.message}` : "Gagal menghubungi penyedia AI."
  );
}

/**
 * Main LLM call with retry and JSON parsing. Supports Gemini & DeepSeek.
 */
export async function callLLM(options: LlmCallOptions): Promise<LlmCallResult> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey || apiKey === "isi_api_key_anda_di_sini" || apiKey === "isi_api_key_gemini_di_sini") {
    throw new LlmError(
      "NO_API_KEY",
      "API key belum diisi. Isi GEMINI_API_KEY di .env.local atau gunakan hasil simulasi."
    );
  }

  const isGoogleKey = apiKey.startsWith("AIza");

  // Determine model: prioritize GEMINI_MODEL, then DEEPSEEK_MODEL
  const configuredModel =
    process.env.GEMINI_MODEL?.trim() ||
    process.env.DEEPSEEK_MODEL?.trim() ||
    (isGoogleKey ? "gemini-2.5-flash" : "deepseek-flash");

  // Determine baseUrl: prioritize GEMINI_BASE_URL, then DEEPSEEK_BASE_URL
  let rawBaseUrl =
    process.env.GEMINI_BASE_URL?.trim() ||
    process.env.DEEPSEEK_BASE_URL?.trim() ||
    (isGoogleKey
      ? "https://generativelanguage.googleapis.com/v1beta/openai"
      : "https://tokengateway.dev/v1");

  // If using Google endpoint without /openai for chat completions, append /openai
  if (rawBaseUrl.includes("generativelanguage.googleapis.com") && !rawBaseUrl.includes("/openai")) {
    rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, "")}/openai`;
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const model = configuredModel;
  const isGeminiModel = model.toLowerCase().includes("gemini");
  const disableThinking = !isGeminiModel && process.env.DEEPSEEK_DISABLE_THINKING !== "false";

  const startTime = Date.now();
  let currentMessages = [...options.messages];
  let lastRawContent = "";
  let lastError: Error | null = null;

  // Max 2 total attempts
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      let content = "";
      let usage: { prompt: number; completion: number } | undefined;

      // If key is Google AI and base URL is direct Google without OpenAI endpoint or user prefers native
      if (isGoogleKey && !baseUrl.includes("/openai")) {
        const sysMsg = currentMessages.find((m) => m.role === "system")?.content || "";
        const userMsg = currentMessages.filter((m) => m.role !== "system").map((m) => m.content).join("\n\n");
        const res = await callGeminiNative(apiKey, model, sysMsg, userMsg, options.maxTokens, options.temperature ?? 0.2);
        content = res.text;
        usage = res.usage;
      } else {
        // OpenAI-compatible format (works on Google's openai endpoint and tokengateway)
        const bodyBase = {
          model,
          messages: currentMessages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens,
        };

        try {
          const result = await fetchWithDegradation(baseUrl, apiKey, bodyBase, disableThinking, 28000);
          const data = result.json;

          const choices = (data.choices as Array<{ message?: { content?: string } }>) || [];
          const choiceContent = choices[0]?.message?.content;

          if (!choiceContent || typeof choiceContent !== "string") {
            throw new LlmError("BAD_JSON", "Model tidak mengembalikan konten teks yang valid.");
          }

          content = choiceContent;
          const usageRaw = data.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
          usage = usageRaw
            ? {
                prompt: usageRaw.prompt_tokens ?? 0,
                completion: usageRaw.completion_tokens ?? 0,
              }
            : undefined;
        } catch (fetchErr) {
          // If OpenAI endpoint failed on Google endpoint, try native generateContent as seamless fallback
          if (isGoogleKey || baseUrl.includes("generativelanguage.googleapis.com")) {
            const sysMsg = currentMessages.find((m) => m.role === "system")?.content || "";
            const userMsg = currentMessages.filter((m) => m.role !== "system").map((m) => m.content).join("\n\n");
            const res = await callGeminiNative(apiKey, model, sysMsg, userMsg, options.maxTokens, options.temperature ?? 0.2);
            content = res.text;
            usage = res.usage;
          } else {
            throw fetchErr;
          }
        }
      }

      lastRawContent = content;
      const sanitized = sanitizeJsonResponse(content);

      let parsed: unknown;
      try {
        parsed = JSON.parse(sanitized);
      } catch {
        throw new LlmError("BAD_JSON", "Hasil dari model AI bukan format JSON yang valid.");
      }

      const durationMs = Date.now() - startTime;

      // Safe server logging: only task, duration, status, tokens
      console.log(
        `[LLM] task=${options.task} status=200 ms=${durationMs} model=${model} tokens=${usage?.prompt ?? 0}+${usage?.completion ?? 0}`
      );

      return {
        rawJson: sanitized,
        parsed,
        model,
        ms: durationMs,
        usage,
      };
    } catch (err: unknown) {
      const error = err as Error;
      lastError = error;

      // If auth error, do not retry
      if (err instanceof LlmError && (err.code === "NO_API_KEY" || (err.code === "UPSTREAM" && err.message.includes("ditolak")))) {
        throw err;
      }

      // Retry once if attempt 1
      if (attempt === 1) {
        console.warn(`[LLM] Percobaan 1 gagal untuk task ${options.task}: ${error.message}. Mencoba kembali...`);
        if (err instanceof LlmError && err.code === "BAD_JSON") {
          currentMessages = [
            ...options.messages,
            { role: "assistant", content: lastRawContent || "{}" },
            {
              role: "user",
              content:
                "Balasan sebelumnya bukan JSON valid. Balas ulang HANYA dengan objek JSON sesuai skema.",
            },
          ];
        }
        continue;
      }
    }
  }

  const durationMs = Date.now() - startTime;
  console.error(`[LLM] task=${options.task} FAILED ms=${durationMs}: ${lastError?.message}`);

  if (lastError instanceof LlmError) {
    throw lastError;
  }

  throw new LlmError("UPSTREAM", `Gagal memproses AI: ${lastError?.message || "Kesalahan tidak diketahui"}`);
}
