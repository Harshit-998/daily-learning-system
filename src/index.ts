import { loadConfig } from "./config.js";
import { buildLessonPrompt } from "./generation/prompt.js";
import { generateLessonWithReview } from "./generation/gemini.js";
import { validateLesson } from "./generation/validate.js";
import { renderEmailHtml } from "./render/html.js";
import { renderTelegram } from "./render/telegram.js";
import { sendGmail } from "./delivery/gmail.js";
import { sendTelegramDocument } from "./delivery/telegram.js";
import { applyLessonToProgress, readProgress, writeLesson, writeOutputPreview, writeProgress } from "./state/files.js";
import { selectLesson } from "./state/selectLesson.js";
import { formatDateInKolkata } from "./utils/date.js";
import { loadDotEnv } from "./utils/env.js";

async function main(): Promise<void> {
  loadDotEnv();
  const command = process.argv[2] || "daily";
  const dryRunArg = process.argv.includes("--dry-run");

  if (command === "validate") {
    await validateProject();
    return;
  }

  if (command === "preview") {
    await runDaily(true);
    return;
  }

  if (command === "daily") {
    await runDaily(dryRunArg);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function runDaily(forceDryRun = false): Promise<void> {
  const config = loadConfig();
  const dryRun = forceDryRun || config.dryRun;
  const progress = await readProgress();
  const paused = config.paused || progress.paused;

  if (paused) {
    console.log("Learning automation is paused. No lesson generated.");
    return;
  }

  const date = formatDateInKolkata();
  const forceNewLesson = config.forceNewLesson;

  if (!dryRun && !forceNewLesson &&  progress.lastRunDate === date) {
    console.log(`Lesson already generated for ${date}. Skipping duplicate run.`);
    return;
  }

  const selection = selectLesson({ ...progress, difficulty: config.difficulty, focusAreas: config.focusAreas }, config, date);
  const prompt = buildLessonPrompt(selection, progress);
  const lesson = await generateLessonWithReview(selection, prompt, config);
  lesson.telegramSummary = renderTelegram(lesson);

  const validationNotes = validateLesson(lesson);
  if (validationNotes.length > 0) {
    throw new Error(`Lesson validation failed: ${validationNotes.join(" ")}`);
  }

  const html = renderEmailHtml(lesson);
  await writeOutputPreview(html, lesson.telegramSummary);
  const lessonSuffix = forceNewLesson
    ? `run-${process.env.GITHUB_RUN_NUMBER || Date.now().toString()}`
    : undefined;

const lessonPath = await writeLesson(date, lesson, lessonSuffix);
  
  if (!dryRun) {
    const emailResult = await retry(() => sendGmail(config, lesson.title, html), 2);
    const telegramResult = await retry(
      () => sendTelegramDocument(config, html, `daily-learning-${date}.html`),
      2
    );    
    console.log(emailResult);
    console.log(telegramResult);

    const nextProgress = applyLessonToProgress(progress, lesson, {
      date,
      mode: lesson.mode,
      systemDesignTopicId: lesson.systemDesign.topicId,
      dsaPatternId: lesson.dsa.patternId,
      title: lesson.title
    }, forceNewLesson);
    await writeProgress(nextProgress);
  } else {
    console.log("Dry run complete. Delivery and progress mutation skipped.");
  }

  console.log(`Lesson written to ${lessonPath}`);
  console.log("Email preview written to outputs/latest-email.html");
  console.log("Telegram preview written to outputs/latest-telegram.txt");
}

async function validateProject(): Promise<void> {
  const progress = await readProgress();
  if (progress.version !== 1) throw new Error("Unsupported progress version.");
  if (!Array.isArray(progress.history)) throw new Error("Progress history must be an array.");
  console.log("Project validation passed.");
}

async function retry<T>(operation: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
