import type { GeneratedLesson } from "../types.js";

const systemDesignRequired = [
  "simpleConcept",
  "whyItExists",
  "analogy",
  "technicalDepth",
  "diagram",
  "realWorldExample",
  "practicalDesignExample",
  "componentInteraction",
  "productionUsage",
  "previousConceptConnections"
] as const;

const dsaRequired = [
  "problemStatement",
  "bruteForce",
  "whyInsufficient",
  "coreIntuition",
  "optimalApproach",
  "javaCode",
  "complexities"
] as const;

const mockInterviewRequired = [
  "systemName",
  "interviewerPrompt",
  "scope",
  "highLevelArchitecture",
  "architectureDiagram",
  "fiveMinuteAnswer"
] as const;

export function validateLesson(lesson: GeneratedLesson): string[] {
  const notes: string[] = [];
  if (!lesson.title) notes.push("Missing title.");
  if (!lesson.date) notes.push("Missing date.");
  if (lesson.mode !== "daily" && lesson.mode !== "weekly-review") notes.push("Invalid mode.");
  checkArray(notes, lesson.recall, "recall", 3, 3);

  for (const key of systemDesignRequired) {
    if (!lesson.systemDesign?.[key]?.trim()) notes.push(`Missing System Design section: ${key}.`);
  }

  for (const key of dsaRequired) {
    if (!lesson.dsa?.[key]?.trim()) notes.push(`Missing DSA section: ${key}.`);
  }

  for (const key of mockInterviewRequired) {
    if (!lesson.mockInterview?.[key]?.trim()) notes.push(`Missing mock interview section: ${key}.`);
  }

  checkArray(notes, lesson.systemDesign?.tradeOffs, "systemDesign.tradeOffs", 2);
  checkArray(notes, lesson.systemDesign?.whenToUse, "systemDesign.whenToUse", 2);
  checkArray(notes, lesson.systemDesign?.whenNotToUse, "systemDesign.whenNotToUse", 2);
  checkArray(notes, lesson.systemDesign?.commonMistakes, "systemDesign.commonMistakes", 2);
  checkArray(notes, lesson.systemDesign?.scalingConsiderations, "systemDesign.scalingConsiderations", 2);
  checkArray(notes, lesson.systemDesign?.failureScenarios, "systemDesign.failureScenarios", 2);
  checkArray(notes, lesson.systemDesign?.interviewQuestions, "systemDesign.interviewQuestions", 3);
  checkArray(notes, lesson.systemDesign?.thinkLikeEngineerQuestions, "systemDesign.thinkLikeEngineerQuestions", 1, 3);
  if (lesson.systemDesign?.diagram?.includes("flowchart")) notes.push("Diagram should be rendered SVG or HTML, not Mermaid.");
  checkArray(notes, lesson.mockInterview?.functionalRequirements, "mockInterview.functionalRequirements", 3);
  checkArray(notes, lesson.mockInterview?.nonFunctionalRequirements, "mockInterview.nonFunctionalRequirements", 5);
  checkArray(notes, lesson.mockInterview?.capacityEstimation, "mockInterview.capacityEstimation", 4);
  checkArray(notes, lesson.mockInterview?.coreEntitiesAndDataModel, "mockInterview.coreEntitiesAndDataModel", 4);
  checkArray(notes, lesson.mockInterview?.apiDesign, "mockInterview.apiDesign", 3);
  checkArray(notes, lesson.mockInterview?.deepDives, "mockInterview.deepDives", 1);
  checkArray(notes, lesson.mockInterview?.failureScenarios, "mockInterview.failureScenarios", 4);
  checkArray(notes, lesson.mockInterview?.tradeOffs, "mockInterview.tradeOffs", 4);
  checkArray(notes, lesson.mockInterview?.followUpQuestions, "mockInterview.followUpQuestions", 8, 12);
  if (lesson.mockInterview?.architectureDiagram?.includes("flowchart")) notes.push("Mock interview diagram should be rendered SVG or HTML, not Mermaid.");
  checkArray(notes, lesson.dsa?.examples, "dsa.examples", 1);
  checkArray(notes, lesson.dsa?.constraints, "dsa.constraints", 2);
  checkArray(notes, lesson.dsa?.whatToNotice, "dsa.whatToNotice", 2);
  checkArray(notes, lesson.dsa?.stepByStep, "dsa.stepByStep", 3);
  checkArray(notes, lesson.dsa?.mistakes, "dsa.mistakes", 2);
  checkArray(notes, lesson.dsa?.recognitionClues, "dsa.recognitionClues", 2);
  checkArray(notes, lesson.dsa?.variations, "dsa.variations", 2);
  checkArray(notes, lesson.dsa?.relatedProblems, "dsa.relatedProblems", 2);
  checkArray(notes, lesson.dsa?.exactlyWhatChangesAcrossVariants, "dsa.exactlyWhatChangesAcrossVariants", 2);
  checkArray(notes, lesson.selfTest, "selfTest", 3);

  if (!lesson.dsa?.javaCode?.includes("class")) notes.push("Java code should include a class.");
  if (!lesson.dsa?.variantWalkthroughs || lesson.dsa.variantWalkthroughs.length < 1) notes.push("DSA variant walkthroughs should explain real variants.");
  if (!lesson.dsa?.transferLearning?.trim()) notes.push("DSA transfer learning explanation is required.");
  if (!lesson.telegramSummary || lesson.telegramSummary.length > 3500) notes.push("Telegram summary missing or too long.");

  return notes;
}

function checkArray(notes: string[], value: unknown, label: string, min: number, max = Number.POSITIVE_INFINITY): void {
  if (!Array.isArray(value) || value.length < min) {
    notes.push(`${label} must have at least ${min} item(s).`);
    return;
  }
  if (value.length > max) notes.push(`${label} must have at most ${max} item(s).`);
}
