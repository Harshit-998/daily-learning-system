import type { AppConfig } from "../types.js";

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export async function sendGmail(config: AppConfig, subject: string, html: string): Promise<string> {
  const required = [config.gmailClientId, config.gmailClientSecret, config.gmailRefreshToken, config.gmailFromEmail, config.recipientEmail];
  if (required.some((value) => !value)) return "Skipped Gmail: missing credentials.";

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.gmailClientId || "",
      client_secret: config.gmailClientSecret || "",
      refresh_token: config.gmailRefreshToken || "",
      grant_type: "refresh_token"
    })
  });

  const tokenPayload = (await tokenResponse.json()) as TokenResponse;
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error(`Gmail token error: ${tokenPayload.error_description || tokenPayload.error || tokenResponse.status}`);
  }

  const raw = createRawEmail(config.gmailFromEmail || "", config.recipientEmail || "", subject, html);
  const sendResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw })
  });

  if (!sendResponse.ok) {
    throw new Error(`Gmail send error ${sendResponse.status}: ${await sendResponse.text()}`);
  }
  return "Sent Gmail email.";
}

function createRawEmail(from: string, to: string, subject: string, html: string): string {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeWord(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html
  ].join("\r\n");

  return Buffer.from(message).toString("base64url");
}

function encodeMimeWord(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}
