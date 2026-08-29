import type { AppConfig, Difficulty } from "./types.js";

function boolFromEnv(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function difficultyFromEnv(value: string | undefined): Difficulty {
  if (value === "easy" || value === "medium" || value === "hard") return value;
  return "medium";
}

export function loadConfig(): AppConfig {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    gmailClientId: process.env.GMAIL_CLIENT_ID,
    gmailClientSecret: process.env.GMAIL_CLIENT_SECRET,
    gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN,
    gmailFromEmail: process.env.GMAIL_FROM_EMAIL,
    recipientEmail: process.env.RECIPIENT_EMAIL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    difficulty: difficultyFromEnv(process.env.DIFFICULTY),
    focusAreas: (process.env.FOCUS_AREAS || "system-design,dsa").split(",").map((item) => item.trim()).filter(Boolean),
    paused: boolFromEnv(process.env.PAUSED),
    dryRun: boolFromEnv(process.env.DRY_RUN),
    forceNewLesson: boolFromEnv(process.env.FORCE_NEW_LESSON)
  };
}
