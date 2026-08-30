# Zero-Cost Daily Learning System

This V1 sends one daily System Design + DSA lesson at 8:00 AM Asia/Kolkata using free-tier services only:

- Gemini API free tier for lesson generation
- GitHub Actions for scheduling
- Gmail API for the full responsive HTML email
- Telegram Bot API for the full HTML lesson as a file attachment
- JSON files in the repository for progress and lesson history
- No paid services and no always-on server

## What It Teaches

System Design follows a long-term curriculum:

1. Fundamentals
2. Core components
3. Data and storage
4. Distributed systems
5. Reliability and scaling
6. Advanced architecture
7. Complete system designs

DSA is organized around reusable problem-solving patterns. Difficulty is adaptive through `DIFFICULTY`, and spaced review is persisted in `data/progress.json`.

The default calibration is not beginner-level. It assumes intermediate System Design ability and intermediate/advanced DSA ability, then pushes toward interview-ready senior reasoning: capacity estimation, bottlenecks, failure modes, consistency decisions, backpressure, hot partitions, observability, migration trade-offs, and reusable DSA invariants.

Every normal daily lesson includes all requested System Design sections, including trade-offs, failure scenarios, production usage, interview questions, previous-concept connections, and Think Like an Engineer questions. Lessons should sometimes ask you to decide first, then reveal the reasoning.

Each lesson also includes a separate full System Design mock interview problem of the day, such as BookMyShow, WhatsApp, Google Drive, Dropbox, YouTube, Instagram, Uber, or a payment system. This mock interview section covers requirements, non-functional goals, capacity estimation, data model, APIs, architecture, deep dives, failure scenarios, trade-offs, follow-up questions, and a rehearsable five-minute answer.

Every DSA lesson includes problem statement, examples, constraints, intuition, brute force, optimal approach, Java solution, complexity, variants, exactly what changes across variants, and a transfer-learning section explaining which other problem families the technique unlocks.

The email renderer rotates professional themes and layout families by date plus run/progress seed. It combines blueprint, editorial, terminal, dashboard, and technical magazine themes with field-note, briefing, split-rail, lab-sheet, and case-file layouts. This prevents repeated manual runs on the same day from using the exact same visual treatment.

On Sundays, the workflow switches to mastery/revision mode instead of a normal new lesson.

## Setup

1. Create a GitHub repository under `Harshit-998`. Suggested name: `daily-learning-system`.
2. Push this project to `https://github.com/Harshit-998/daily-learning-system`.
3. In GitHub, open **Settings → Secrets and variables → Actions**.
4. Add these repository secrets:

| Secret | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio Gemini API key |
| `GMAIL_CLIENT_ID` | OAuth client ID for Gmail API |
| `GMAIL_CLIENT_SECRET` | OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Refresh token with Gmail send scope |
| `GMAIL_FROM_EMAIL` | Gmail address that sends the email |
| `RECIPIENT_EMAIL` | Email address that receives the lesson |
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |
| `TELEGRAM_CHAT_ID` | Your chat ID or group ID |

5. Optional repository variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name |
| `DIFFICULTY` | `hard` | `easy`, `medium`, or `hard` |
| `FOCUS_AREAS` | `system-design,dsa` | Comma-separated focus labels |
| `PAUSED` | `false` | Set to `true` to pause delivery |

6. The included workflow runs every day at `02:30 UTC`, which is `08:00 Asia/Kolkata`.

Manual workflow runs include `force_new_lesson`, which defaults to `true`. That means clicking **Run workflow** can generate and send the next fresh study lesson even if today's scheduled lesson already ran. Scheduled 8:00 AM runs still keep same-day duplicate protection.

## Gmail OAuth Notes

Use the Gmail API with the `https://www.googleapis.com/auth/gmail.send` scope. Generate a refresh token once, then store it as `GMAIL_REFRESH_TOKEN`. This project only sends email from your own configured account.

## Telegram Setup

1. Create a bot with BotFather.
2. Send a message to the bot from your Telegram account.
3. Get your chat ID using Telegram's `getUpdates` endpoint.
4. Store `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in GitHub Secrets.

## Local Commands

```bash
npm install
npm run build
npm run validate
npm run dry-run
```

Without real credentials, `npm run dry-run` still produces:

- `outputs/latest-email.html`
- `outputs/latest-telegram.txt`
- `lessons/YYYY/MM/DD.json`

Dry runs do not send messages and do not advance `data/progress.json`.

For local credential testing, copy `.env.example` to `.env` and fill in only the channels you want to test.

## Pause, Time, Difficulty, and Focus

To pause, set the repository variable `PAUSED=true`.

To change delivery time, edit `.github/workflows/daily-learning.yml`:

```yaml
schedule:
  - cron: "30 2 * * *"
```

GitHub cron uses UTC. For 8:00 AM Asia/Kolkata, keep `30 2 * * *`.

To change difficulty, set repository variable `DIFFICULTY` to `easy`, `medium`, or `hard`.

To change focus areas, set `FOCUS_AREAS`, for example:

```text
system-design,dsa,distributed-systems,dynamic-programming
```

## Persistent Files

- `data/progress.json`: current curriculum position, preferences, review queue, and recent history
- `lessons/YYYY/MM/DD.json`: generated lesson metadata and complete structured lesson
- `outputs/latest-email.html`: latest rendered HTML preview
- `outputs/latest-telegram.txt`: latest concise summary preview retained for debugging; Telegram delivery sends the HTML file attachment

## Reliability Behavior

The runner includes:

- Same-day deduplication
- Sunday review mode
- Gemini retry behavior
- Local fallback lesson generation
- Structure validation
- Channel-level delivery skipping when credentials are missing
- GitHub commit of generated lesson history and progress after successful real runs

No paid services are required.
