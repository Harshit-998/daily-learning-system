import type { AppConfig } from "../types.js";

export async function sendTelegram(config: AppConfig, text: string): Promise<string> {
  if (!config.telegramBotToken || !config.telegramChatId) return "Skipped Telegram: missing credentials.";

  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: config.telegramChatId,
      text,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram send error ${response.status}: ${await response.text()}`);
  }
  return "Sent Telegram message.";
}
