import type { GeneratedLesson } from "../types.js";
import { addDays } from "../utils/date.js";

type DesignName = "blueprint" | "executive" | "terminal" | "magazine" | "dashboard" | "casefile" | "lab" | "whitepaper" | "warroom" | "cards";

interface Palette {
  bg: string;
  ink: string;
  muted: string;
  panel: string;
  line: string;
  accent: string;
  inverse: string;
  code: string;
}

const designs: DesignName[] = ["blueprint", "executive", "terminal", "magazine", "dashboard", "casefile", "lab", "whitepaper", "warroom", "cards"];

export function renderEmailHtml(lesson: GeneratedLesson): string {
  const design = pickDesign(lesson.date, lesson.designSeed);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(lesson.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>${cssFor(design)}</style>
</head>
<body class="${design}">
  ${renderShell(design, lesson)}
</body>
</html>`;
}

function pickDesign(date: string, seed = 0): DesignName {
  const day = Number(date.slice(-2));
  const runNumber = Number(process.env.GITHUB_RUN_NUMBER || "0");
  return designs[(day + seed + runNumber) % designs.length];
}

function renderShell(design: DesignName, lesson: GeneratedLesson): string {
  if (design === "executive") return renderExecutive(lesson, design);
  if (design === "terminal") return renderTerminal(lesson, design);
  if (design === "magazine") return renderMagazine(lesson, design);
  if (design === "dashboard") return renderDashboard(lesson, design);
  if (design === "casefile") return renderCaseFile(lesson, design);
  if (design === "lab") return renderLab(lesson, design);
  if (design === "whitepaper") return renderWhitepaper(lesson, design);
  if (design === "warroom") return renderWarRoom(lesson, design);
  if (design === "cards") return renderCards(lesson, design);
  return renderBlueprint(lesson, design);
}

function renderBlueprint(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Field Notebook", "Daily architecture and algorithms practice")}
    ${recallBlock(lesson, "Pinned Recall")}
    ${systemDesignBlock(lesson, "blueprint-sheet")}
    ${mockInterviewBlock(lesson, "blueprint-sheet")}
    ${nodejsBlock(lesson, "blueprint-sheet")}
    ${javascriptInterviewBlock(lesson, "blueprint-sheet")}
    ${dsaBlock(lesson, "blueprint-sheet")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderExecutive(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Engineering Brief", "Decision memo for production interviews")}
    ${recallBlock(lesson, "Board Summary")}
    ${systemDesignBlock(lesson, "memo")}
    ${mockInterviewBlock(lesson, "memo")}
    ${nodejsBlock(lesson, "memo")}
    ${javascriptInterviewBlock(lesson, "memo")}
    ${dsaBlock(lesson, "memo")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderTerminal(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Runbook Session", "Production reasoning log")}
    <section class="console">
      <div class="console-bar"><span></span><span></span><span></span></div>
      <pre><code>$ load daily-lesson --mode=${escapeHtml(lesson.mode)}
$ focus system-design dsa mock-interview
$ difficulty hard

${escapeHtml(lesson.title)}</code></pre>
    </section>
    ${recallBlock(lesson, "Fast Recall")}
    ${systemDesignBlock(lesson, "console-section")}
    ${mockInterviewBlock(lesson, "console-section")}
    ${nodejsBlock(lesson, "console-section")}
    ${javascriptInterviewBlock(lesson, "console-section")}
    ${dsaBlock(lesson, "console-section")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderMagazine(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Systems Review", "Long-form interview craft")}
    <section class="mag-lead">
      <p>${escapeHtml(lesson.systemDesign.simpleConcept)}</p>
      ${recallBlock(lesson, "What should stick")}
    </section>
    ${systemDesignBlock(lesson, "article")}
    ${mockInterviewBlock(lesson, "article")}
    ${nodejsBlock(lesson, "article")}
    ${javascriptInterviewBlock(lesson, "article")}
    ${dsaBlock(lesson, "article")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderDashboard(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Learning Dashboard", "Topic, interview, implementation")}
    <section class="metric-row">
      ${metric("01", lesson.systemDesign.topic)}
      ${metric("02", `Design ${lesson.mockInterview.systemName}`)}
      ${metric("03", lesson.dsa.pattern)}
    </section>
    ${recallBlock(lesson, "Control Panel Recall")}
    ${systemDesignBlock(lesson, "dash-panel")}
    ${mockInterviewBlock(lesson, "dash-panel")}
    ${nodejsBlock(lesson, "dash-panel")}
    ${javascriptInterviewBlock(lesson, "dash-panel")}
    ${dsaBlock(lesson, "dash-panel")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderCaseFile(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Interview Case File", "Evidence, constraints, trade-offs")}
    <section class="case-strip">
      <div><b>Topic</b><span>${escapeHtml(lesson.systemDesign.topic)}</span></div>
      <div><b>System</b><span>${escapeHtml(lesson.mockInterview.systemName)}</span></div>
      <div><b>Pattern</b><span>${escapeHtml(lesson.dsa.pattern)}</span></div>
    </section>
    ${recallBlock(lesson, "Evidence to Remember")}
    ${systemDesignBlock(lesson, "case-card")}
    ${mockInterviewBlock(lesson, "case-card")}
    ${nodejsBlock(lesson, "case-card")}
    ${javascriptInterviewBlock(lesson, "case-card")}
    ${dsaBlock(lesson, "case-card")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderLab(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Engineering Lab", "Hypothesis, experiment, proof")}
    ${recallBlock(lesson, "Pre-lab Recall")}
    ${systemDesignBlock(lesson, "lab-block")}
    ${mockInterviewBlock(lesson, "lab-block")}
    ${nodejsBlock(lesson, "lab-block")}
    ${javascriptInterviewBlock(lesson, "lab-block")}
    ${dsaBlock(lesson, "lab-block")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderWhitepaper(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Technical Whitepaper", "A structured study brief")}
    ${systemDesignBlock(lesson, "paper-section")}
    ${mockInterviewBlock(lesson, "paper-section")}
    ${nodejsBlock(lesson, "paper-section")}
    ${javascriptInterviewBlock(lesson, "paper-section")}
    ${dsaBlock(lesson, "paper-section")}
    ${recallBlock(lesson, "Abstract Recall")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderWarRoom(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Architecture War Room", "Requirements, risks, fallback paths")}
    ${recallBlock(lesson, "Standup Recall")}
    ${systemDesignBlock(lesson, "war-panel")}
    ${mockInterviewBlock(lesson, "war-panel")}
    ${nodejsBlock(lesson, "war-panel")}
    ${javascriptInterviewBlock(lesson, "war-panel")}
    ${dsaBlock(lesson, "war-panel")}
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function renderCards(lesson: GeneratedLesson, design: DesignName): string {
  return `<main>
    ${hero(lesson, design, "Study Card Deck", "Flip through the core decisions")}
    ${recallBlock(lesson, "Card 00")}
    <section class="card-stack">
      ${systemDesignBlock(lesson, "study-card")}
      ${mockInterviewBlock(lesson, "study-card")}
      ${nodejsBlock(lesson, "study-card")}
      ${javascriptInterviewBlock(lesson, "study-card")}
      ${dsaBlock(lesson, "study-card")}
    </section>
    ${selfTestBlock(lesson)}
    ${reviewSchedule(lesson.date)}
  </main>`;
}

function hero(lesson: GeneratedLesson, design: DesignName, label: string, subtitle: string): string {
  return `<header class="hero">
    <div class="kicker">${escapeHtml(label)} / ${escapeHtml(design)} / ${escapeHtml(lesson.date)}</div>
    <h1>${escapeHtml(lesson.title)}</h1>
    <p>${escapeHtml(subtitle)}</p>
  </header>`;
}

function systemDesignBlock(lesson: GeneratedLesson, className: string): string {
  const sd = lesson.systemDesign;
  return `<section class="block ${className}">
    <div class="label">01 / System Design Topic</div>
    <h2>${escapeHtml(sd.topic)}</h2>
    <p class="lede">${escapeHtml(sd.simpleConcept)}</p>
    ${challengeBox("Think Like an Engineer", sd.thinkLikeEngineerQuestions)}
    ${paragraph("Why it exists", sd.whyItExists)}
    ${paragraph("Analogy", sd.analogy)}
    ${paragraph("Technical depth", sd.technicalDepth)}
    ${mnemonic(sd.mnemonic?.label, sd.mnemonic?.text)}
    <h3>Architecture diagram</h3>
    <div class="diagram-frame">${renderDiagram(sd.diagram)}</div>
    ${sd.diagramCaption ? `<p class="caption">${escapeHtml(sd.diagramCaption)}</p>` : ""}
    <div class="two-col">
      ${panel("Real-world example", `<p>${escapeHtml(sd.realWorldExample)}</p>`)}
      ${panel("Practical design example", `<p>${escapeHtml(sd.practicalDesignExample)}</p>`)}
    </div>
    ${paragraph("How components interact", sd.componentInteraction)}
    <div class="grid">
      ${panel("Trade-offs", list(sd.tradeOffs))}
      ${panel("When to use it", list(sd.whenToUse))}
      ${panel("When not to use it", list(sd.whenNotToUse))}
      ${panel("Common mistakes", list(sd.commonMistakes))}
      ${panel("Scaling considerations", list(sd.scalingConsiderations))}
      ${panel("Failure scenarios", list(sd.failureScenarios))}
    </div>
    ${paragraph("Production usage", sd.productionUsage)}
    ${panel("Interview questions", list(sd.interviewQuestions))}
    ${paragraph("Previous-concept connections", sd.previousConceptConnections)}
  </section>`;
}

function mockInterviewBlock(lesson: GeneratedLesson, className: string): string {
  const mock = lesson.mockInterview;
  return `<section class="block ${className}">
    <div class="label">02 / Real Mock Interview</div>
    <h2>Design ${escapeHtml(mock.systemName)}</h2>
    <p class="lede">${escapeHtml(mock.interviewerPrompt)}</p>
    ${paragraph("Scope clarification", mock.scope)}
    <div class="two-col">
      ${panel("Functional requirements", list(mock.functionalRequirements))}
      ${panel("Non-functional requirements", list(mock.nonFunctionalRequirements))}
    </div>
    <div class="grid">
      ${panel("Capacity estimation", list(mock.capacityEstimation))}
      ${panel("Core entities and data model", list(mock.coreEntitiesAndDataModel))}
      ${panel("API design", list(mock.apiDesign))}
    </div>
    ${paragraph("High-level architecture", mock.highLevelArchitecture)}
    <h3>Mock architecture diagram</h3>
    <div class="diagram-frame">${renderDiagram(mock.architectureDiagram)}</div>
    ${renderDeepDives(mock.deepDives)}
    <div class="two-col">
      ${panel("Failure scenarios", list(mock.failureScenarios))}
      ${panel("Trade-offs", list(mock.tradeOffs))}
    </div>
    ${panel("Follow-up questions", list(mock.followUpQuestions))}
    ${panel("Five-minute answer", `<p>${escapeHtml(mock.fiveMinuteAnswer)}</p>`)}
  </section>`;
}

function nodejsBlock(lesson: GeneratedLesson, className: string): string {
  const node = lesson.nodejs;
  return `<section class="block ${className}">
    <div class="label">03 / Node.js Runtime Concept</div>
    <h2>${escapeHtml(node.concept)}</h2>
    ${paragraph("Why it matters", node.whyItMatters)}
    ${paragraph("Mental model", node.mentalModel)}
    ${paragraph("Technical deep dive", node.technicalDeepDive)}
    ${paragraph("Real-life backend example", node.realLifeExample)}
    <div class="grid">
      ${panel("How to use it", list(node.howToUseIt))}
      ${panel("Production pitfalls", list(node.productionPitfalls))}
      ${panel("Performance and scaling", list(node.performanceAndScaling))}
      ${panel("Debugging signals", list(node.debuggingSignals))}
    </div>
    <h3>Code example</h3>
    <pre><code>${escapeHtml(node.codeExample)}</code></pre>
    ${panel("Node.js interview questions", list(node.interviewQuestions))}
  </section>`;
}

function javascriptInterviewBlock(lesson: GeneratedLesson, className: string): string {
  const js = lesson.javascriptInterview;
  return `<section class="block ${className}">
    <div class="label">04 / JavaScript Interview Drill</div>
    <h2>${escapeHtml(js.theme)}</h2>
    ${js.questions.map((item, index) => `<div class="panel">
      <h3>Q${index + 1}. ${escapeHtml(item.question)}</h3>
      <p>${escapeHtml(item.answer)}</p>
      ${item.code ? `<pre><code>${escapeHtml(item.code)}</code></pre>` : ""}
      ${item.followUp ? `<p><strong>Follow-up:</strong> ${escapeHtml(item.followUp)}</p>` : ""}
    </div>`).join("")}
  </section>`;
}

function dsaBlock(lesson: GeneratedLesson, className: string): string {
  const dsa = lesson.dsa;
  return `<section class="block ${className}">
    <div class="label">05 / DSA Pattern in Java</div>
    <h2>${escapeHtml(dsa.pattern)}</h2>
    <p class="lede">${escapeHtml(dsa.problemStatement)}</p>
    ${dsa.invariant ? challengeBox("Invariant", [dsa.invariant]) : ""}
    ${panel("Examples", list(dsa.examples))}
    <div class="two-col">
      ${panel("Constraints", list(dsa.constraints))}
      ${panel("What to notice", list(dsa.whatToNotice))}
    </div>
    ${paragraph("Brute force", dsa.bruteForce)}
    ${paragraph("Why it is insufficient", dsa.whyInsufficient)}
    ${paragraph("Core intuition", dsa.coreIntuition)}
    ${paragraph("Optimal approach", dsa.optimalApproach)}
    ${panel("Step-by-step", orderedList(dsa.stepByStep))}
    ${renderTrace(dsa.trace)}
    <h3>Java solution</h3>
    <pre><code>${escapeHtml(dsa.javaCode)}</code></pre>
    ${paragraph("Complexities", dsa.complexities)}
    <div class="two-col">
      ${panel("Mistakes", list(dsa.mistakes))}
      ${panel("Recognition clues", list(dsa.recognitionClues))}
    </div>
    ${mnemonic(dsa.mnemonic?.label, dsa.mnemonic?.text)}
    ${renderVariants(dsa.variantWalkthroughs)}
    ${panel("Exactly what changes across variants", list(dsa.exactlyWhatChangesAcrossVariants))}
    ${dsa.transferLearning ? paragraph("Transfer learning", dsa.transferLearning) : ""}
  </section>`;
}

function recallBlock(lesson: GeneratedLesson, title: string): string {
  return `<section class="recall">
    <div class="label">${escapeHtml(title)}</div>
    <h2>60-second recall</h2>
    ${list(lesson.recall)}
  </section>`;
}

function selfTestBlock(lesson: GeneratedLesson): string {
  return `<section class="block self-test">
    <div class="label">06 / Self Test</div>
    <h2>Close-the-tab test</h2>
    <p class="lede">Answer first, then expand. This is for active recall, not rereading.</p>
    ${lesson.selfTest.map((item, index) => `<details><summary>${index + 1}. ${escapeHtml(item.question)}</summary><div class="answer">${escapeHtml(item.answer)}</div></details>`).join("")}
  </section>`;
}

function cssFor(design: DesignName): string {
  const p = palette(design);
  return `
    * { box-sizing:border-box; }
    html { -webkit-text-size-adjust:100%; }
    body {
      margin:0;
      background:${p.bg};
      color:${p.ink};
      font-family:'IBM Plex Sans', Arial, sans-serif;
      line-height:1.62;
    }
    main { max-width:960px; margin:0 auto; padding:24px 16px 64px; }
    h1, h2, h3 { letter-spacing:0; }
    h1 { margin:10px 0; font:700 34px/1.08 'Space Grotesk', Arial, sans-serif; }
    h2 { margin:8px 0 12px; font:700 24px/1.2 'Space Grotesk', Arial, sans-serif; }
    h3 { margin:22px 0 8px; font:700 15px/1.25 'Space Grotesk', Arial, sans-serif; color:${p.accent}; }
    p, li { font-size:15px; }
    ul, ol { margin:0; padding-left:20px; }
    code, pre, .label, .kicker, .metric strong, .caption { font-family:'IBM Plex Mono', Consolas, monospace; }
    .hero, .block, .recall, .panel, details, .review { background:${p.panel}; border:1px solid ${p.line}; }
    .hero { padding:30px; margin-bottom:22px; color:${p.ink}; }
    .hero p, .lede, .caption, .answer { color:${p.muted}; }
    .kicker, .label { color:${p.accent}; text-transform:uppercase; font-size:11px; font-weight:700; letter-spacing:.08em; }
    .block, .recall { margin:22px 0; padding:24px; }
    .panel { padding:15px; margin:12px 0; }
    .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:14px 0; }
    .two-col, .exec-grid, .war-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:14px 0; }
    .challenge, .mnemonic { border:1px solid ${p.accent}; background:${soft(p.accent)}; padding:14px 16px; margin:14px 0; }
    .mnemonic { display:flex; gap:10px; align-items:flex-start; }
    .badge { display:inline-flex; min-width:42px; justify-content:center; padding:4px 8px; background:${p.accent}; color:${p.inverse}; font-weight:700; }
    .diagram-frame { background:${p.code}; border:1px solid ${p.line}; padding:14px; margin:10px 0; overflow-x:auto; }
    .diagram-frame svg { display:block; min-width:640px; max-width:100%; height:auto; }
    .html-diagram { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; min-width:560px; }
    .diagram-node { background:${p.panel}; color:${p.ink}; border:1px solid ${p.line}; padding:12px; min-height:74px; }
    .diagram-node span { display:block; color:${p.accent}; font-family:'IBM Plex Mono', Consolas, monospace; font-size:11px; font-weight:700; margin-bottom:6px; }
    .diagram-node b { display:block; font-size:13px; line-height:1.35; }
    pre { background:${p.code}; color:#f8fafc; padding:15px; overflow-x:auto; font-size:12.8px; line-height:1.55; }
    details { padding:13px 15px; margin:9px 0; }
    summary { cursor:pointer; font-weight:700; }
    .answer { margin-top:8px; padding-top:8px; border-top:1px dashed ${p.line}; }
    .array-row { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; }
    .cell { min-width:44px; padding:8px 4px; text-align:center; border:1px solid ${p.line}; background:${p.panel}; font-family:'IBM Plex Mono', monospace; }
    .cell .idx { display:block; color:${p.muted}; font-size:10px; }
    .cell.hit { border-color:${p.accent}; background:${soft(p.accent)}; }
    .review { margin-top:28px; overflow:hidden; }
    .review-head { padding:12px 16px; background:${p.ink}; color:${p.inverse}; font-weight:700; }
    .review-body { display:grid; grid-template-columns:repeat(4,1fr); }
    .review-cell { padding:14px 16px; border-right:1px solid ${p.line}; }
    .review-cell span { display:block; color:${p.muted}; font-family:'IBM Plex Mono', monospace; font-size:11px; text-transform:uppercase; }
    .metric-row { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:18px 0; }
    .metric { background:${p.panel}; border:1px solid ${p.line}; padding:16px; }
    .metric strong { display:block; color:${p.accent}; font-size:12px; }
    .metric span { font-weight:700; }
    ${designCss(design, p)}
    @media (max-width:720px) {
      main { padding:12px 10px 42px; }
      h1 { font-size:25px; }
      .grid, .two-col, .exec-grid, .war-grid, .metric-row, .review-body { grid-template-columns:1fr; }
      .hero, .block, .recall { padding:18px; }
    }
  `;
}

function designCss(design: DesignName, p: Palette): string {
  const styles: Record<DesignName, string> = {
    blueprint: `
      body { background-image:linear-gradient(rgba(244,242,232,.94),rgba(244,242,232,.94)),repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(18,50,79,.16) 28px),repeating-linear-gradient(90deg,transparent,transparent 27px,rgba(18,50,79,.16) 28px); }
      .hero { background:${p.code}; color:#ecfeff; border-radius:4px; box-shadow:inset 0 0 0 8px rgba(255,255,255,.04); }
      .block { border-radius:3px; border-left:5px solid ${p.accent}; }
      .panel { border-radius:3px; }
    `,
    executive: `
      main { max-width:900px; }
      .hero { border-radius:0; border-left:10px solid ${p.accent}; box-shadow:0 20px 50px rgba(15,23,42,.09); }
      .block { border-radius:0; box-shadow:0 12px 30px rgba(15,23,42,.07); }
      .label { border-bottom:1px solid ${p.line}; display:block; padding-bottom:8px; margin-bottom:8px; }
      .panel { border-left:4px solid ${p.accent}; }
    `,
    terminal: `
      body { background:#07110c; color:#dafbe1; }
      main { max-width:980px; }
      .hero, .block, .recall, .panel, details { background:#0d1f15; color:#dafbe1; border-color:#315443; border-radius:6px; }
      .console { background:#020403; border:1px solid #315443; border-radius:8px; margin:20px 0; overflow:hidden; }
      .console-bar { padding:8px 10px; border-bottom:1px solid #315443; }
      .console-bar span { display:inline-block; width:10px; height:10px; margin-right:6px; border-radius:50%; background:${p.accent}; opacity:.85; }
      .console pre { margin:0; border:0; }
      h2 { color:#f8fafc; }
    `,
    magazine: `
      main { max-width:860px; }
      body { font-family:'Libre Baskerville', Georgia, serif; }
      h1, h2 { font-family:'Libre Baskerville', Georgia, serif; }
      .hero { border:0; border-top:8px solid ${p.ink}; border-bottom:2px solid ${p.ink}; background:transparent; padding-left:0; padding-right:0; }
      .mag-lead { display:grid; grid-template-columns:1.05fr .95fr; gap:22px; align-items:start; }
      .mag-lead > p { font-size:22px; line-height:1.45; margin:0; }
      .block { border:0; border-top:2px solid ${p.ink}; background:transparent; padding-left:0; padding-right:0; }
      .panel { background:${p.panel}; border-radius:0; }
      @media (max-width:720px) { .mag-lead { grid-template-columns:1fr; } }
    `,
    dashboard: `
      body { background:linear-gradient(180deg,#e9eef5,#f8fafc); }
      main { max-width:1040px; }
      .hero { border-radius:8px; background:${p.ink}; color:${p.inverse}; }
      .block, .recall, .panel, details, .metric { border-radius:8px; box-shadow:0 10px 26px rgba(15,23,42,.08); }
      .block { border-top:6px solid ${p.accent}; }
      .grid { grid-template-columns:repeat(2,1fr); }
    `,
    casefile: `
      body { background:repeating-linear-gradient(0deg,${p.bg},${p.bg} 31px,#e2d8c4 32px); }
      .hero { transform:rotate(-.2deg); border-radius:2px; box-shadow:8px 8px 0 rgba(60,45,30,.12); }
      .case-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:18px 0; }
      .case-strip div { background:${p.panel}; border:1px solid ${p.line}; padding:12px; box-shadow:4px 4px 0 rgba(60,45,30,.09); }
      .case-strip b, .case-strip span { display:block; }
      .block, .recall, .panel, details { border-radius:2px; box-shadow:5px 5px 0 rgba(60,45,30,.08); }
      .label { background:${p.accent}; color:${p.inverse}; padding:3px 8px; display:inline-block; }
      @media (max-width:720px) { .case-strip { grid-template-columns:1fr; } }
    `,
    lab: `
      body { background-image:linear-gradient(${p.bg},${p.bg}),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(0,0,0,.08) 80px); }
      .hero { border-radius:14px 14px 3px 3px; }
      .block { border-radius:12px; position:relative; }
      .block::before { content:""; position:absolute; left:20px; right:20px; top:-1px; border-top:5px solid ${p.accent}; }
      .panel, details, .recall { border-radius:10px; }
      h2 { background:${soft(p.accent)}; padding:8px 10px; }
    `,
    whitepaper: `
      body { background:#eef0f4; }
      main { max-width:820px; }
      .hero, .block, .recall, .self-test, .review { background:#ffffff; border:0; box-shadow:0 12px 40px rgba(15,23,42,.11); }
      .hero { padding:44px 48px; }
      .block { padding:38px 48px; }
      h1 { font-family:'Libre Baskerville', Georgia, serif; font-size:32px; }
      h2 { border-bottom:1px solid ${p.line}; padding-bottom:10px; }
      .panel { background:#f8fafc; }
    `,
    warroom: `
      body { background:#15110d; color:#fff7ed; }
      .hero, .block, .recall, .panel, details { background:#211a14; color:#fff7ed; border-color:#7c4a23; }
      .hero { border-radius:0; border-top:8px solid ${p.accent}; }
      .war-grid { align-items:stretch; }
      .block { border-left:6px solid ${p.accent}; }
      .label, h3 { color:#fbbf24; }
      .diagram-frame, pre { border-color:#7c4a23; }
    `,
    cards: `
      main { max-width:880px; }
      .hero { border-radius:18px; text-align:center; }
      .card-stack { display:grid; gap:18px; }
      .study-card, .recall, .self-test { border-radius:18px; box-shadow:0 18px 40px rgba(15,23,42,.12); }
      .study-card:nth-child(1) { transform:rotate(-.25deg); }
      .study-card:nth-child(2) { transform:rotate(.25deg); }
      .study-card:nth-child(3) { transform:rotate(-.15deg); }
      .panel, details { border-radius:12px; }
    `
  };
  return styles[design];
}

function palette(design: DesignName): Palette {
  const palettes: Record<DesignName, Palette> = {
    blueprint: { bg: "#f4f2e8", ink: "#182436", muted: "#52606d", panel: "#fffdf7", line: "#c9bea1", accent: "#c56a1a", inverse: "#ffffff", code: "#10253b" },
    executive: { bg: "#f8f9fb", ink: "#111827", muted: "#5b6472", panel: "#ffffff", line: "#d9dee7", accent: "#9f1239", inverse: "#ffffff", code: "#111827" },
    terminal: { bg: "#07110c", ink: "#dafbe1", muted: "#9fc4aa", panel: "#0d1f15", line: "#315443", accent: "#69db7c", inverse: "#06120a", code: "#020403" },
    magazine: { bg: "#f6efe4", ink: "#2b1f16", muted: "#6f6256", panel: "#fffaf1", line: "#d5b98b", accent: "#8a2c0d", inverse: "#ffffff", code: "#1e293b" },
    dashboard: { bg: "#eef2f7", ink: "#162033", muted: "#5d6b80", panel: "#ffffff", line: "#ccd6e3", accent: "#0f766e", inverse: "#ffffff", code: "#0b1220" },
    casefile: { bg: "#efe5d2", ink: "#251c14", muted: "#6c5c49", panel: "#fff9ed", line: "#c9aa77", accent: "#92400e", inverse: "#ffffff", code: "#1f2937" },
    lab: { bg: "#f7fbff", ink: "#102033", muted: "#5f6f82", panel: "#ffffff", line: "#bfd0e5", accent: "#1d4ed8", inverse: "#ffffff", code: "#0f172a" },
    whitepaper: { bg: "#eef0f4", ink: "#171717", muted: "#666666", panel: "#ffffff", line: "#d5d7de", accent: "#4f46e5", inverse: "#ffffff", code: "#111827" },
    warroom: { bg: "#15110d", ink: "#fff7ed", muted: "#e1c7a7", panel: "#211a14", line: "#7c4a23", accent: "#ea580c", inverse: "#ffffff", code: "#0c0a09" },
    cards: { bg: "#f2f5f1", ink: "#172018", muted: "#65715f", panel: "#ffffff", line: "#cbd8c4", accent: "#166534", inverse: "#ffffff", code: "#102018" }
  };
  return palettes[design];
}

function metric(number: string, text: string): string {
  return `<div class="metric"><strong>${escapeHtml(number)}</strong><span>${escapeHtml(text)}</span></div>`;
}

function paragraph(title: string, text: string): string {
  return `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>`;
}

function panel(title: string, body: string): string {
  return `<div class="panel"><h3>${escapeHtml(title)}</h3>${body}</div>`;
}

function list(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function orderedList(items: string[]): string {
  return `<ol>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
}

function challengeBox(title: string, items: string[]): string {
  return `<div class="challenge"><h3>${escapeHtml(title)}</h3>${list(items)}</div>`;
}

function mnemonic(label?: string, text?: string): string {
  if (!label || !text) return "";
  return `<div class="mnemonic"><span class="badge">${escapeHtml(label)}</span><div>${escapeHtml(text)}</div></div>`;
}

function renderDiagram(diagram: string): string {
  const trimmed = diagram.trim();
  if (trimmed.startsWith("<svg")) return renderEmailSafeDiagram(extractSvgText(trimmed));
  return `<pre><code>${escapeHtml(diagram)}</code></pre>`;
}

function renderEmailSafeDiagram(labels: string[]): string {
  const cleanLabels = labels.filter(Boolean).slice(0, 9);
  if (cleanLabels.length === 0) return "";
  return `<div class="html-diagram">
    ${cleanLabels.map((label, index) => `<div class="diagram-node">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <b>${escapeHtml(label)}</b>
    </div>`).join("")}
  </div>`;
}

function extractSvgText(svg: string): string[] {
  const matches = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)];
  return matches
    .map((match) => stripTags(match[1])
      .replace(/\s+/g, " ")
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .trim())
    .filter((text) => text.length > 0 && text.length < 90);
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function renderTrace(trace: GeneratedLesson["dsa"]["trace"]): string {
  if (!trace) return "";
  return `<h3>${escapeHtml(trace.title)}</h3>
    <div class="array-row">
      ${trace.cells.map((cell) => `<div class="cell${cell.highlight ? " hit" : ""}"><span class="idx">i=${cell.index}</span>${escapeHtml(cell.value)}</div>`).join("")}
    </div>
    ${orderedList(trace.steps)}`;
}

function renderVariants(variants: GeneratedLesson["dsa"]["variantWalkthroughs"]): string {
  if (!variants?.length) return "";
  return `<h3>Variant walkthroughs</h3>
    ${variants.map((variant) => `<div class="panel">
      <h3>${escapeHtml(variant.name)}</h3>
      <p>${escapeHtml(variant.whatChanges)}</p>
      <pre><code>${escapeHtml(variant.code)}</code></pre>
      <p><strong>Complexity:</strong> ${escapeHtml(variant.complexity)}</p>
    </div>`).join("")}`;
}

function renderDeepDives(deepDives: GeneratedLesson["mockInterview"]["deepDives"]): string {
  return `<h3>Deep dives</h3>
    ${deepDives.map((deepDive) => `<div class="panel">
      <h3>${escapeHtml(deepDive.title)}</h3>
      <p>${escapeHtml(deepDive.discussion)}</p>
      ${list(deepDive.challenges)}
    </div>`).join("")}`;
}

function reviewSchedule(date: string): string {
  const intervals = [1, 3, 7, 16];
  return `<section class="review">
    <div class="review-head">Review schedule</div>
    <div class="review-body">
      ${intervals.map((days) => `<div class="review-cell"><span>+${days} day${days === 1 ? "" : "s"}</span><b>${formatReviewDate(addDays(date, days))}</b></div>`).join("")}
    </div>
  </section>`;
}

function formatReviewDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function soft(color: string): string {
  return `${color}18`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
