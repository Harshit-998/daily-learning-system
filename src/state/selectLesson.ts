import { dsaCurriculum } from "../curriculum/dsa.js";
import { systemDesignCurriculum } from "../curriculum/systemDesign.js";
import type { AppConfig, LessonSelection, Progress } from "../types.js";
import { isSundayInKolkata } from "../utils/date.js";

export function selectLesson(progress: Progress, config: AppConfig, date: string, now = new Date()): LessonSelection {
  const mode = isSundayInKolkata(now) ? "weekly-review" : "daily";
  const systemDesignTopic = systemDesignCurriculum[progress.systemDesign.currentIndex % systemDesignCurriculum.length];
  const dsaPattern = pickDsaPattern(progress, config);
  const reviewItems = progress.dsa.reviewQueue.filter((item) => item.dueDate <= date).slice(0, 8);

  return {
    date,
    mode,
    systemDesignTopic,
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
