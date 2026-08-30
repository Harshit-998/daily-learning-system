export type Difficulty = "easy" | "medium" | "hard";

export interface Progress {
  version: 1;
  paused: boolean;
  difficulty: Difficulty;
  focusAreas: string[];
  timezone: "Asia/Kolkata";
  lastRunDate: string | null;
  systemDesign: {
    completedTopicIds: string[];
    currentIndex: number;
  };
  dsa: {
    completedPatternIds: string[];
    currentPatternIndex: number;
    currentDifficulty: Difficulty;
    reviewQueue: ReviewItem[];
  };
  history: LessonHistoryItem[];
}

export interface ReviewItem {
  id: string;
  type: "system-design" | "dsa";
  dueDate: string;
  strength: number;
}

export interface LessonHistoryItem {
  date: string;
  mode: LessonMode;
  systemDesignTopicId?: string;
  dsaPatternId?: string;
  title: string;
}

export type LessonMode = "daily" | "weekly-review";

export interface SystemDesignTopic {
  id: string;
  stage: string;
  title: string;
  summary: string;
  exampleSystems: string[];
  prerequisites: string[];
}

export interface DsaPattern {
  id: string;
  stage: string;
  title: string;
  difficulties: Difficulty[];
  sampleProblems: string[];
  reviewAfterDays: number[];
}

export interface LessonSelection {
  date: string;
  mode: LessonMode;
  systemDesignTopic: SystemDesignTopic;
  dsaPattern: DsaPattern;
  reviewItems: ReviewItem[];
  difficulty: Difficulty;
}

export interface GeneratedLesson {
  title: string;
  date: string;
  mode: LessonMode;
  designSeed?: number;
  recall: string[];
  systemDesign: {
    topicId: string;
    topic: string;
    simpleConcept: string;
    whyItExists: string;
    analogy: string;
    technicalDepth: string;
    diagram: string;
    diagramCaption?: string;
    realWorldExample: string;
    practicalDesignExample: string;
    componentInteraction: string;
    tradeOffs: string[];
    whenToUse: string[];
    whenNotToUse: string[];
    commonMistakes: string[];
    scalingConsiderations: string[];
    failureScenarios: string[];
    productionUsage: string;
    interviewQuestions: string[];
    previousConceptConnections: string;
    thinkLikeEngineerQuestions: string[];
    mnemonic?: {
      label: string;
      text: string;
    };
  };
  mockInterview: {
    systemName: string;
    interviewerPrompt: string;
    scope: string;
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    capacityEstimation: string[];
    coreEntitiesAndDataModel: string[];
    apiDesign: string[];
    highLevelArchitecture: string;
    architectureDiagram: string;
    deepDives: Array<{
      title: string;
      discussion: string;
      challenges: string[];
    }>;
    failureScenarios: string[];
    tradeOffs: string[];
    followUpQuestions: string[];
    fiveMinuteAnswer: string;
  };
  dsa: {
    patternId: string;
    pattern: string;
    problemStatement: string;
    examples: string[];
    constraints: string[];
    whatToNotice: string[];
    bruteForce: string;
    whyInsufficient: string;
    coreIntuition: string;
    optimalApproach: string;
    stepByStep: string[];
    javaCode: string;
    complexities: string;
    mistakes: string[];
    recognitionClues: string[];
    variations: string[];
    relatedProblems: string[];
    exactlyWhatChangesAcrossVariants: string[];
    invariant?: string;
    trace?: {
      title: string;
      steps: string[];
      cells: Array<{ index: number; value: string; highlight?: boolean }>;
    };
    mnemonic?: {
      label: string;
      text: string;
    };
    variantWalkthroughs?: Array<{
      name: string;
      whatChanges: string;
      code: string;
      complexity: string;
    }>;
    transferLearning?: string;
  };
  selfTest: Array<{
    question: string;
    answer: string;
  }>;
  qualityReview: {
    passed: boolean;
    notes: string[];
  };
  telegramSummary: string;
}

export interface AppConfig {
  geminiApiKey?: string;
  geminiModel: string;
  gmailClientId?: string;
  gmailClientSecret?: string;
  gmailRefreshToken?: string;
  gmailFromEmail?: string;
  recipientEmail?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  difficulty: Difficulty;
  focusAreas: string[];
  paused: boolean;
  dryRun: boolean;
  forceNewLesson: boolean;
}
