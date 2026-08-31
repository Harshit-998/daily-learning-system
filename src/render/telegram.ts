import type { GeneratedLesson } from "../types.js";

export function renderTelegram(lesson: GeneratedLesson): string {
  const sd = lesson.systemDesign;
  const node = lesson.nodejs;
  const js = lesson.javascriptInterview;
  const dsa = lesson.dsa;
  const text = [
    `${lesson.mode === "weekly-review" ? "Sunday Mastery" : "Daily Lesson"}: ${lesson.title}`,
    "",
    `System Design: ${sd.topic}`,
    `Core idea: ${sd.simpleConcept}`,
    `Trade-off: ${sd.tradeOffs[0]}`,
    `Engineer question: ${sd.thinkLikeEngineerQuestions[0]}`,
    "",
    `Mock Interview: Design ${lesson.mockInterview.systemName}`,
    `Focus: ${lesson.mockInterview.followUpQuestions[0]}`,
    "",
    `Node.js: ${node.concept}`,
    `Use it for: ${node.howToUseIt[0]}`,
    `Watch: ${node.productionPitfalls[0]}`,
    "",
    `JS Interview: ${js.theme}`,
    `Question: ${js.questions[0]?.question}`,
    `Answer: ${js.questions[0]?.answer}`,
    "",
    `DSA: ${dsa.pattern}`,
    `Notice: ${dsa.whatToNotice[0]}`,
    `Approach: ${dsa.coreIntuition}`,
    `Complexity: ${dsa.complexities}`,
    "",
    "Today's action: explain the concept aloud, trace the Java solution once, then solve one variant."
  ].join("\n");

  return text.length <= 3500 ? text : `${text.slice(0, 3490)}...`;
}
