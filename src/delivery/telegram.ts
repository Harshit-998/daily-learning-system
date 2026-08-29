import type { AppConfig } from "../types.js";

export async function sendTelegramDocument(
  config: AppConfig,
  html: string,
  fileName: string
): Promise<string> {
  if (!config.telegramBotToken || !config.telegramChatId) {
    return "Skipped Telegram: missing credentials.";
  }

  const form = new FormData();
  form.append("chat_id", config.telegramChatId);
  form.append(
    "document",
    new Blob([html], { type: "text/html; charset=utf-8" }),
    fileName
  );

  const response = await fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendDocument`,
    {
      method: "POST",
      body: form
    }
  );

  if (!response.ok) {
    throw new Error(
      `Telegram document send error ${response.status}: ${await response.text()}`
    );
  }

  return "Sent Telegram HTML attachment.";
}
