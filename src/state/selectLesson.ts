import { dsaCurriculum } from "../curriculum/dsa.js";
import { systemDesignCurriculum } from "../curriculum/systemDesign.js";
import type { AppConfig, LessonSelection, Progress } from "../types.js";
import { isSundayInKolkata } from "../utils/date.js";

const mockSystems = [
  "WhatsApp",
  "Google Drive",
  "Dropbox",
  "YouTube",
  "Instagram News Feed",
  "Uber Ride Matching",
  "Netflix Video Streaming",
  "BookMyShow",
  "Payment Gateway",
  "URL Shortener",
  "Food Delivery Dispatch",
  "Google Photos",
  "Search Autocomplete",
  "Distributed File Storage",
  "Notification Platform",
  "Collaborative Document Editor",
  "Live Streaming Platform",
  "Calendar Scheduling System",
  "E-commerce Checkout",
  "Metrics and Logging Platform"
];

export function selectLesson(progress: Progress, config: AppConfig, date: string, now = new Date()): LessonSelection {
  const mode = isSundayInKolkata(now) ? "weekly-review" : "daily";
  const systemDesignTopic = systemDesignCurriculum[progress.systemDesign.currentIndex % systemDesignCurriculum.length];
  const dsaPattern = pickDsaPattern(progress, config);
  const mockSystem = pickMockSystem(progress);
  const reviewItems = progress.dsa.reviewQueue.filter((item) => item.dueDate <= date).slice(0, 8);

  return {
    date,
    mode,
    systemDesignTopic,
    mockSystem,
    dsaPattern,
    reviewItems,
    difficulty: config.difficulty || progress.difficulty
  };
}

function pickDsaPattern(progress: Progress, config: AppConfig) {
  const preferredDifficulty = config.difficulty || progress.dsa.currentDifficulty;
  const ordered = dsaCurriculum.slice(progress.dsa.currentPatternIndex).concat(dsaCurriculum.slice(0, progress.dsa.currentPatternIndex));
  return ordered.find((pattern) => pattern.difficulties.includes(preferredDifficulty)) || ordered[0];
}

function pickMockSystem(progress: Progress): string {
  const recentTitles = progress.history.slice(0, 8).map((item) => item.title.toLowerCase());
  const start = (progress.systemDesign.currentIndex + progress.dsa.currentPatternIndex + progress.history.length) % mockSystems.length;
  for (let offset = 0; offset < mockSystems.length; offset += 1) {
    const candidate = mockSystems[(start + offset) % mockSystems.length];
    if (!recentTitles.some((title) => title.includes(candidate.toLowerCase()))) return candidate;
  }
  return mockSystems[start];
}
