import type { LessonSelection, Progress } from "../types.js";

export function buildLessonPrompt(selection: LessonSelection, progress: Progress): string {
  const priorTopics = progress.systemDesign.completedTopicIds.slice(-5).join(", ") || "none yet";
  const priorPatterns = progress.dsa.completedPatternIds.slice(-5).join(", ") || "none yet";
  const reviewList = selection.reviewItems.map((item) => `${item.type}:${item.id}`).join(", ") || "none";

  return `
You are creating a premium daily learning lesson for a software engineer preparing for System Design and DSA interviews.

Return ONLY valid JSON matching the requested schema. Do not include markdown fences.

Calibration:
- The learner is not a beginner.
- System Design level: intermediate and mock-interview ready, working toward strong senior-level performance.
- DSA level: intermediate/advanced, already covered most topics, now optimizing for pattern recognition and difficult problem solving.
- Do not teach basic APIs, databases, caches, load balancers, arrays, strings, basic HashMap usage, basic BFS/DFS, basic recursion, or simple binary search from scratch unless that foundation is directly needed for a deeper point.
- Push difficulty upward with production-level trade-offs, capacity estimation, bottleneck identification, consistency decisions, hot partitions, backpressure, ordering guarantees, idempotency, failure modes, observability, migration strategy, and multi-region implications.
- For DSA, optimize for learning density over raw difficulty. Prefer medium-hard/hard problems with a non-obvious invariant, transformation, amortized reasoning, advanced data structure choice, or pattern combination.
- Occasionally ask the learner to decide first, then reveal reasoning in the answer.

Mode: ${selection.mode}
Date: ${selection.date}
Difficulty: ${selection.difficulty}
System Design topic: ${selection.systemDesignTopic.title}
System Design summary: ${selection.systemDesignTopic.summary}
Use one or more example systems: ${selection.systemDesignTopic.exampleSystems.join(", ")}
DSA pattern: ${selection.dsaPattern.title}
Candidate DSA problems: ${selection.dsaPattern.sampleProblems.join(", ")}
Due review items: ${reviewList}
Recently completed System Design topics: ${priorTopics}
Recently completed DSA patterns: ${priorPatterns}

The final HTML must contain three main learning blocks:
1. The focused System Design topic lesson.
2. A separate full System Design mock interview problem of the day.
3. The DSA pattern/problem lesson.

The mock interview does not need to connect to the focused topic. Choose one realistic system such as BookMyShow, WhatsApp, Google Drive, Dropbox, YouTube, Instagram, Uber, food delivery, Netflix, Google Photos, notification system, payment system, URL shortener, ride sharing, distributed file storage, live streaming, search autocomplete, chat system, news feed, calendar, or collaborative document editor.

If mode is weekly-review, make the lesson a Sunday mastery/revision session. Review prior ideas, connect them, include mistakes to revisit, and avoid introducing a normal new topic unless needed for synthesis.

Required JSON shape:
{
  "title": "string",
  "date": "${selection.date}",
  "mode": "${selection.mode}",
  "designSeed": 0,
  "recall": ["exactly 3 bullets for 60-second recall"],
  "systemDesign": {
    "topicId": "${selection.systemDesignTopic.id}",
    "topic": "string",
    "simpleConcept": "string",
    "whyItExists": "string",
    "analogy": "string",
    "technicalDepth": "string",
    "diagram": "Inline SVG string when useful. Do not return Mermaid.",
    "diagramCaption": "string",
    "realWorldExample": "string",
    "practicalDesignExample": "string",
    "componentInteraction": "string",
    "tradeOffs": ["string"],
    "whenToUse": ["string"],
    "whenNotToUse": ["string"],
    "commonMistakes": ["string"],
    "scalingConsiderations": ["string"],
    "failureScenarios": ["string"],
    "productionUsage": "string",
    "interviewQuestions": ["string"],
    "previousConceptConnections": "string",
    "thinkLikeEngineerQuestions": ["1 to 3 strings"],
    "mnemonic": { "label": "short memory hook", "text": "string" }
  },
  "mockInterview": {
    "systemName": "string",
    "interviewerPrompt": "Example: Design BookMyShow",
    "scope": "Clarify exactly what is in scope and out of scope",
    "functionalRequirements": ["string"],
    "nonFunctionalRequirements": ["scale, latency, availability, consistency, durability, throughput, security, cost, observability, disaster recovery"],
    "capacityEstimation": ["DAU/MAU assumptions, QPS, storage, bandwidth, peak multiplier, hotspot analysis"],
    "coreEntitiesAndDataModel": ["tables/collections, fields, indexes, partition keys, relationships, strong vs eventual consistency"],
    "apiDesign": ["key APIs with request/response examples, idempotency, pagination/filtering where relevant"],
    "highLevelArchitecture": "components, request flow, storage, cache, queues/events, search/indexing, CDN/media if relevant",
    "architectureDiagram": "Inline SVG string. Do not return Mermaid.",
    "deepDives": [
      { "title": "hard part", "discussion": "deep technical discussion", "challenges": ["string"] }
    ],
    "failureScenarios": ["string"],
    "tradeOffs": ["string"],
    "followUpQuestions": ["8 to 12 realistic interviewer follow-ups"],
    "fiveMinuteAnswer": "A crisp spoken answer the learner can rehearse in an interview"
  },
  "dsa": {
    "patternId": "${selection.dsaPattern.id}",
    "pattern": "string",
    "problemStatement": "string",
    "examples": ["string"],
    "constraints": ["string"],
    "whatToNotice": ["string"],
    "bruteForce": "string",
    "whyInsufficient": "string",
    "coreIntuition": "string",
    "optimalApproach": "string",
    "stepByStep": ["string"],
    "javaCode": "complete Java solution",
    "complexities": "string",
    "mistakes": ["string"],
    "recognitionClues": ["string"],
    "variations": ["string"],
    "relatedProblems": ["string"],
    "exactlyWhatChangesAcrossVariants": ["string"],
    "invariant": "string",
    "trace": {
      "title": "string",
      "steps": ["string"],
      "cells": [{ "index": 0, "value": "string", "highlight": true }]
    },
    "mnemonic": { "label": "short memory hook", "text": "string" },
    "variantWalkthroughs": [
      { "name": "string", "whatChanges": "string", "code": "Java code", "complexity": "string" }
    ],
    "transferLearning": "If you understand this problem, you should now recognize these other problem patterns, with what remains the same, what changes, why the intuition still works, and when it stops working."
  },
  "selfTest": [
    { "question": "string", "answer": "string" }
  ],
  "qualityReview": {
    "passed": true,
    "notes": ["string"]
  },
  "telegramSummary": "Concise phone-friendly summary under 3500 characters"
}

Quality bar:
- Avoid filler such as "X is a way to make systems behave predictably".
- Avoid beginner-level explanations unless they are used as a stepping stone to an interview-level insight.
- Use concrete definitions, formulas, estimates, traces, production failure modes, and real variant differences.
- Diagrams must render as inline SVG in email-friendly HTML. Do not use Mermaid code blocks.
- DSA variants must explain what changes, not only list names.
- The email renderer rotates visual themes, so focus on structured content and do not hard-code CSS.
- The mock interview section must be complete enough to rehearse like a real mid-level/senior interview, from requirements to a five-minute spoken answer.
`.trim();
}
