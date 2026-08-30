import type { AppConfig, GeneratedLesson, LessonSelection } from "../types.js";
import { fallbackLesson } from "./fallback.js";
import { validateLesson } from "./validate.js";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export async function generateLessonWithReview(selection: LessonSelection, prompt: string, config: AppConfig): Promise<GeneratedLesson> {
  if (!config.geminiApiKey) {
    return withQualityReview(fallbackLesson(selection), ["Generated with local fallback because GEMINI_API_KEY is not set."]);
  }

  const attempts = 3;
  let lastError = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const lesson = await callGemini(prompt, config);
      const reviewed = withQualityReview(lesson, [`Gemini generation succeeded on attempt ${attempt}.`]);
      validateLesson(reviewed);
      return reviewed;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await sleep(800 * attempt);
    }
  }

  return withQualityReview(fallbackLesson(selection), [`Gemini failed after ${attempts} attempts: ${lastError}`, "Used validated local fallback."]);
}

async function callGemini(prompt: string, config: AppConfig): Promise<GeneratedLesson> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel)}:generateContent?key=${encodeURIComponent(config.geminiApiKey || "")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned no text.");
  return JSON.parse(stripJsonFences(text)) as GeneratedLesson;
}

function withQualityReview(lesson: GeneratedLesson, notes: string[]): GeneratedLesson {
  const validationNotes = validateLesson(lesson);
  return {
    ...lesson,
    qualityReview: {
      passed: validationNotes.length === 0,
      notes: [...notes, ...validationNotes]
    }
  };
}

function stripJsonFences(text: string): string {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
