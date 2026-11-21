import { NextRequest, NextResponse } from "next/server";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ScoreResult,
  RewriteResult,
  InterviewResult,
} from "@/types/karierlens";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildSystemPrompt, buildTaskPrompt, buildGlossaryBlock } from "@/lib/prompts";
import { detectGlossary } from "@/lib/glossary";
import { callLLM, LlmError } from "@/lib/llm";
import {
  scoreResultSchema,
  rewriteResultSchema,
  interviewResultSchema,
} from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Up to 60s for Vercel/serverless

export async function POST(req: NextRequest) {
  try {
    let body: AnalyzeRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "VALIDATION",
          message: "Format payload request tidak valid (harus JSON).",
        },
        { status: 400 }
      );
    }

    const { task, cvText, jobDescription, language = "id" } = body;

    // 1. Task validation
    if (!task || !["score", "rewrite", "interview"].includes(task)) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "VALIDATION",
          message: "Parameter task tidak valid. Harus 'score', 'rewrite', atau 'interview'.",
        },
        { status: 400 }
      );
    }

    // 2. Length validation
    if (!cvText || cvText.trim().length < 30) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "VALIDATION",
          message: "Teks CV terlalu singkat (minimal 30 karakter).",
        },
        { status: 400 }
      );
    }

    if (cvText.length > 12000) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "VALIDATION",
          message: "Teks CV melebihi batas maksimal 12.000 karakter.",
        },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "VALIDATION",
          message: "Deskripsi pekerjaan (JD) terlalu singkat (minimal 30 karakter).",
        },
        { status: 400 }
      );
    }

    if (jobDescription.length > 8000) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "VALIDATION",
          message: "Deskripsi pekerjaan (JD) melebihi batas maksimal 8.000 karakter.",
        },
        { status: 400 }
      );
    }

    // 3. In-memory Rate Limit
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "local";
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "RATE_LIMIT",
          message: "Batas frekuensi permintaan tercapai. Tunggu beberapa menit atau gunakan hasil simulasi.",
        },
        { status: 429 }
      );
    }

    // 4. API Key Verification
    const apiKey =
      process.env.DEEPSEEK_API_KEY?.trim() ||
      process.env.TOKEN_GATEWAY_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim();

    if (
      !apiKey ||
      apiKey === "" ||
      apiKey === "isi_api_key_anda_di_sini" ||
      apiKey === "isi_api_key_tokengateway_di_sini" ||
      apiKey === "isi_api_key_gemini_di_sini"
    ) {
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: "NO_API_KEY",
          message: "API key belum diisi. Isi DEEPSEEK_API_KEY di .env.local atau gunakan hasil simulasi.",
        },
        { status: 503 }
      );
    }

    // 5. Construct prompts with Glossary Injection
    const systemPrompt = buildSystemPrompt(language);
    const glossaryHits = detectGlossary(cvText);
    const glossaryBlock = buildGlossaryBlock(glossaryHits, language);

    let userPrompt = `${buildTaskPrompt(task)}\n\n`;
    if (glossaryBlock) {
      userPrompt += `${glossaryBlock}\n\n`;
    }
    userPrompt += `<cv>\n${cvText}\n</cv>\n\n<jd>\n${jobDescription}\n</jd>`;

    const maxTokensMap = {
      score: 900,
      rewrite: 2400,
      interview: 2000,
    };

    // 6. Call LLM
    const llmResult = await callLLM({
      task,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: maxTokensMap[task],
      temperature: 0.2,
    });

    // 7. Validate schema with zod
    let validatedData: ScoreResult | RewriteResult | InterviewResult;

    if (task === "score") {
      const parsed = scoreResultSchema.safeParse(llmResult.parsed);
      if (!parsed.success) {
        console.error("[API] Validasi skema score gagal:", parsed.error.issues);
        return NextResponse.json<AnalyzeResponse<never>>(
          {
            ok: false,
            code: "BAD_JSON",
            message: "Format hasil skor dari AI tidak sesuai skema.",
          },
          { status: 502 }
        );
      }
      validatedData = parsed.data;
    } else if (task === "rewrite") {
      const parsed = rewriteResultSchema.safeParse(llmResult.parsed);
      if (!parsed.success) {
        console.error("[API] Validasi skema rewrite gagal:", parsed.error.issues);
        return NextResponse.json<AnalyzeResponse<never>>(
          {
            ok: false,
            code: "BAD_JSON",
            message: "Format hasil penulisan ulang dari AI tidak sesuai skema.",
          },
          { status: 502 }
        );
      }
      validatedData = parsed.data;
    } else {
      const parsed = interviewResultSchema.safeParse(llmResult.parsed);
      if (!parsed.success) {
        console.error("[API] Validasi skema interview gagal:", parsed.error.issues);
        return NextResponse.json<AnalyzeResponse<never>>(
          {
            ok: false,
            code: "BAD_JSON",
            message: "Format simulasi wawancara dari AI tidak sesuai skema.",
          },
          { status: 502 }
        );
      }
      validatedData = parsed.data;
    }

    return NextResponse.json<AnalyzeResponse<typeof validatedData>>({
      ok: true,
      data: validatedData,
      meta: {
        model: llmResult.model,
        ms: llmResult.ms,
        usage: llmResult.usage,
      },
    });
  } catch (err: unknown) {
    if (err instanceof LlmError) {
      const statusMap: Record<string, number> = {
        NO_API_KEY: 503,
        RATE_LIMIT: 429,
        VALIDATION: 400,
        TIMEOUT: 504,
        UPSTREAM: 502,
        BAD_JSON: 502,
      };
      return NextResponse.json<AnalyzeResponse<never>>(
        {
          ok: false,
          code: err.code,
          message: err.message,
        },
        { status: statusMap[err.code] || 500 }
      );
    }

    const error = err as Error;
    console.error("[API] Unhandled Error:", error.message);
    return NextResponse.json<AnalyzeResponse<never>>(
      {
        ok: false,
        code: "UPSTREAM",
        message: "Terjadi kesalahan internal pada server. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}
