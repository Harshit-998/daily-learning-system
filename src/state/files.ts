import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { GeneratedLesson, LessonHistoryItem, Progress, ReviewItem } from "../types.js";
import { addDays } from "../utils/date.js";

const progressPath = "data/progress.json";

export async function readProgress(): Promise<Progress> {
  const raw = await readFile(progressPath, "utf8");
  return JSON.parse(raw) as Progress;
}

export async function writeProgress(progress: Progress): Promise<void> {
  await writeJson(progressPath, progress);
}

export async function writeLesson(date: string, lesson: GeneratedLesson): Promise<string> {
  const [year, month, day] = date.split("-");
  const filePath = join("lessons", year, month, `${day}.json`);
  await writeJson(filePath, lesson);
  return filePath;
}

export async function writeOutputPreview(html: string, telegram: string): Promise<void> {
  await mkdir("outputs", { recursive: true });
  await writeFile("outputs/latest-email.html", html, "utf8");
  await writeFile("outputs/latest-telegram.txt", telegram, "utf8");
}

export function applyLessonToProgress(progress: Progress, lesson: GeneratedLesson, historyItem: LessonHistoryItem): Progress {
  const next: Progress = structuredClone(progress);
  next.lastRunDate = historyItem.date;
  next.history = [historyItem, ...next.history].slice(0, 180);

  if (lesson.mode === "daily") {
    if (!next.systemDesign.completedTopicIds.includes(lesson.systemDesign.topicId)) {
      next.systemDesign.completedTopicIds.push(lesson.systemDesign.topicId);
    }
    if (!next.dsa.completedPatternIds.includes(lesson.dsa.patternId)) {
      next.dsa.completedPatternIds.push(lesson.dsa.patternId);
    }
    next.systemDesign.currentIndex += 1;
    next.dsa.currentPatternIndex += 1;
  }

  next.dsa.reviewQueue = scheduleReviews(next.dsa.reviewQueue, historyItem.date, [
    { id: lesson.systemDesign.topicId, type: "system-design" },
    { id: lesson.dsa.patternId, type: "dsa" }
  ]);

  return next;
}

function scheduleReviews(existing: ReviewItem[], date: string, items: Array<{ id: string; type: ReviewItem["type"] }>): ReviewItem[] {
  const intervals = [1, 3, 7, 16];
  const future = existing.filter((item) => item.dueDate >= date);
  for (const item of items) {
    for (const days of intervals) {
      future.push({
        id: item.id,
        type: item.type,
        dueDate: addDays(date, days),
        strength: 0
      });
    }
  }
  return dedupeReviews(future).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function dedupeReviews(items: ReviewItem[]): ReviewItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}:${item.id}:${item.dueDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
