import type { GeneratedLesson } from "../types.js";
import { addDays } from "../utils/date.js";

type ThemeName = "blueprint" | "editorial" | "terminal" | "dashboard" | "magazine";

export function renderEmailHtml(lesson: GeneratedLesson): string {
  const sd = lesson.systemDesign;
  const dsa = lesson.dsa;
  const theme = pickTheme(lesson.date);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(lesson.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>${themeCss(theme)}</style>
</head>
<body>
  <main class="wrap">
    <header class="masthead">
      <div class="blueprint-border"></div>
      <span class="eyebrow">${lesson.mode === "weekly-review" ? "Sunday Mastery" : "Daily Lesson"} / Java track / ${themeLabel(theme)}</span>
      <h1>${escapeHtml(lesson.title)}</h1>
      <div class="meta">${escapeHtml(lesson.date)} / SDE-2+ prep / production reasoning</div>
      <section class="recall">
        <span class="pin">Pin this</span>
        <h2>60-second recall</h2>
        ${list(lesson.recall)}
      </section>
    </header>

    <section class="topic">
      <span class="topic-tab">01 / System Design</span>
      <h2>${escapeHtml(sd.topic)}</h2>
      <p class="lede">${escapeHtml(sd.simpleConcept)}</p>
      ${challengeBox("Think first", sd.thinkLikeEngineerQuestions)}
      ${paragraph("Why it exists", sd.whyItExists)}
      ${paragraph("Analogy", sd.analogy)}
      ${paragraph("Technical depth", sd.technicalDepth)}
      ${mnemonic(sd.mnemonic?.label, sd.mnemonic?.text)}
      <h3>Rendered architecture diagram</h3>
      <div class="diagram-frame">${renderDiagram(sd.diagram)}</div>
      ${sd.diagramCaption ? `<p class="caption">${escapeHtml(sd.diagramCaption)}</p>` : ""}
      ${paragraph("Concrete real-world example", sd.realWorldExample)}
      ${paragraph("Practical design example", sd.practicalDesignExample)}
      ${paragraph("How components interact", sd.componentInteraction)}
      <div class="grid">
        ${card("Trade-offs", list(sd.tradeOffs))}
        ${card("When to use it", list(sd.whenToUse))}
        ${card("When not to use it", list(sd.whenNotToUse))}
        ${card("Common mistakes", list(sd.commonMistakes))}
        ${card("Scaling considerations", list(sd.scalingConsiderations))}
        ${card("Failure scenarios", list(sd.failureScenarios))}
      </div>
      ${paragraph("Production usage", sd.productionUsage)}
      ${card("Interview questions", list(sd.interviewQuestions))}
      ${paragraph("Connections to previous concepts", sd.previousConceptConnections)}
    </section>

    <section class="topic">
      <span class="topic-tab alt">02 / DSA Pattern</span>
      <h2>${escapeHtml(dsa.pattern)}</h2>
      <p class="lede">${escapeHtml(dsa.problemStatement)}</p>
      ${dsa.invariant ? challengeBox("Invariant", [dsa.invariant]) : ""}
      ${card("Examples", list(dsa.examples))}
      <div class="grid">
        ${card("Constraints", list(dsa.constraints))}
        ${card("What to notice", list(dsa.whatToNotice))}
      </div>
      ${paragraph("Brute force", dsa.bruteForce)}
      ${paragraph("Why it is insufficient", dsa.whyInsufficient)}
      ${paragraph("Core intuition", dsa.coreIntuition)}
      ${paragraph("Optimal approach", dsa.optimalApproach)}
      ${card("Step-by-step", orderedList(dsa.stepByStep))}
      ${renderTrace(dsa.trace)}
      <h3>Java solution</h3>
      <pre><code>${escapeHtml(dsa.javaCode)}</code></pre>
      ${paragraph("Complexities", dsa.complexities)}
      <div class="grid">
        ${card("Mistakes", list(dsa.mistakes))}
        ${card("Recognition clues", list(dsa.recognitionClues))}
      </div>
      ${mnemonic(dsa.mnemonic?.label, dsa.mnemonic?.text)}
      ${renderVariants(dsa.variantWalkthroughs)}
      ${card("Exactly what changes across variants", list(dsa.exactlyWhatChangesAcrossVariants))}
      ${dsa.transferLearning ? paragraph("Transfer learning", dsa.transferLearning) : ""}
    </section>

    <section class="topic quiz">
      <span class="topic-tab">03 / Self-test</span>
      <h2>Close-the-tab test</h2>
      <p class="lede">Answer first, then expand. The goal is active recall, not rereading.</p>
      ${lesson.selfTest.map((item, index) => `<details><summary>${index + 1}. ${escapeHtml(item.question)}</summary><div class="answer">${escapeHtml(item.answer)}</div></details>`).join("")}
    </section>

    ${reviewSchedule(lesson.date)}
  </main>
</body>
</html>`;
}

function pickTheme(date: string): ThemeName {
  const day = Number(date.slice(-2));
  const themes: ThemeName[] = ["editorial", "terminal", "dashboard", "magazine", "blueprint"];
  return themes[day % themes.length];
}

function themeLabel(theme: ThemeName): string {
  return {
    blueprint: "architecture blueprint",
    editorial: "minimal editorial",
    terminal: "developer terminal",
    dashboard: "engineering dashboard",
    magazine: "technical magazine"
  }[theme];
}

function themeCss(theme: ThemeName): string {
  const palettes: Record<ThemeName, { body: string; ink: string; soft: string; card: string; border: string; accent: string; dark: string; code: string }> = {
    blueprint: { body: "#f4f2e8", ink: "#1b2430", soft: "#4a5568", card: "#fffdf7", border: "#cfc8b0", accent: "#d98c2b", dark: "#16324f", code: "#12202f" },
    editorial: { body: "#fbfaf7", ink: "#171717", soft: "#5f6368", card: "#ffffff", border: "#d8d6ce", accent: "#b45309", dark: "#202124", code: "#1f2937" },
    terminal: { body: "#08110d", ink: "#e8f5e9", soft: "#9fc4aa", card: "#101b16", border: "#315443", accent: "#69db7c", dark: "#050807", code: "#020403" },
    dashboard: { body: "#eef2f7", ink: "#172033", soft: "#56657c", card: "#ffffff", border: "#cdd6e3", accent: "#0f766e", dark: "#111827", code: "#0b1220" },
    magazine: { body: "#f7efe2", ink: "#251c14", soft: "#695f52", card: "#fffaf1", border: "#d6b98d", accent: "#7c2d12", dark: "#283044", code: "#1b2430" }
  };
  const p = palettes[theme];

  return `
    * { box-sizing:border-box; }
    html { -webkit-text-size-adjust:100%; }
    body {
      margin:0;
      background:
        radial-gradient(circle at 14px 14px, rgba(0,0,0,.035) 1px, transparent 1px),
        linear-gradient(${p.body}, ${p.body});
      background-size:28px 28px, auto;
      color:${p.ink};
      font-family:'IBM Plex Sans', Inter, Segoe UI, Arial, sans-serif;
      line-height:1.62;
    }
    ${theme === "blueprint" ? `body { background-image:linear-gradient(rgba(244,242,232,.9), rgba(244,242,232,.9)), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(110,98,63,.28) 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(110,98,63,.28) 28px); background-size:auto,28px 28px,28px 28px; }` : ""}
    .wrap { max-width:900px; margin:0 auto; padding:22px 18px 64px; }
    .masthead {
      background:${p.dark};
      color:${theme === "terminal" ? "#e8f5e9" : "#f8fafc"};
      border-radius:6px;
      padding:30px 30px 24px;
      border:1px solid ${theme === "blueprint" ? "rgba(127,214,198,.35)" : p.border};
      position:relative;
      overflow:hidden;
      box-shadow:0 20px 54px rgba(17,24,39,.16);
      background-image:
        linear-gradient(135deg, rgba(255,255,255,.08), transparent 36%),
        repeating-linear-gradient(0deg, rgba(127,214,198,.08) 0 1px, transparent 1px 22px),
        repeating-linear-gradient(90deg, rgba(127,214,198,.08) 0 1px, transparent 1px 22px);
    }
    .blueprint-border { position:absolute; inset:9px; border:1px solid rgba(127,214,198,.32); border-radius:3px; pointer-events:none; }
    .eyebrow, code, pre, .meta, .topic-tab, .sr-cell .d, .pin { font-family:'IBM Plex Mono', SFMono-Regular, Consolas, monospace; }
    .eyebrow { display:inline-flex; align-items:center; color:${theme === "terminal" ? p.accent : "#7fd6c6"}; border:1px solid rgba(127,214,198,.48); padding:4px 10px; border-radius:999px; font-size:11px; letter-spacing:.1em; text-transform:uppercase; }
    h1 { font-family:'Space Grotesk', Inter, sans-serif; font-size:30px; line-height:1.13; margin:14px 0 7px; letter-spacing:0; }
    h2 { font-family:'Space Grotesk', Inter, sans-serif; font-size:23px; line-height:1.22; margin:8px 0 12px; letter-spacing:0; border-bottom:2px solid ${p.ink}; padding-bottom:9px; }
    h3 { font-family:'Space Grotesk', Inter, sans-serif; font-size:15.5px; margin:22px 0 8px; letter-spacing:0; color:${theme === "terminal" ? p.accent : p.dark}; }
    p, li, td { font-size:15px; }
    ul, ol { margin:0; padding-left:20px; }
    .meta { color:${theme === "terminal" ? p.soft : "#cbd5e1"}; font-size:12px; }
    .recall, .card, details, .mnemonic, .challenge {
      background:${p.card};
      color:${p.ink};
      border:1px solid ${p.border};
      border-radius:3px;
      padding:15px 17px;
    }
    .recall { margin-top:18px; border-style:dashed; border-color:${p.accent}; position:relative; box-shadow:inset 0 0 0 1px rgba(255,255,255,.35); }
    .pin { position:absolute; top:-10px; left:14px; background:${p.accent}; color:${theme === "terminal" ? "#06120a" : "#ffffff"}; padding:2px 8px; border-radius:2px; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
    .recall h2 { border:0; padding:0; margin:2px 0 8px; font-size:16px; }
    .topic { margin-top:34px; }
    .topic-tab { display:inline-block; background:${p.accent}; color:${theme === "terminal" ? "#06120a" : "#ffffff"}; padding:4px 10px; border-radius:2px 2px 0 0; font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; }
    .topic-tab.alt { background:${p.dark}; color:#ffffff; }
    .lede { color:${p.soft}; font-size:16px; }
    .card { box-shadow:0 8px 22px rgba(17,24,39,.055); }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:14px 0; }
    .challenge { border-left:4px solid ${p.accent}; margin:14px 0; background:${theme === "terminal" ? p.card : "linear-gradient(90deg, rgba(47,143,131,.12), rgba(255,255,255,.72))"}; }
    .mnemonic { display:flex; gap:10px; margin:16px 0; border-color:${p.accent}; }
    .badge { background:${p.accent}; color:${theme === "terminal" ? "#06120a" : "#ffffff"}; min-width:40px; height:28px; padding:4px 8px; border-radius:2px; display:inline-flex; align-items:center; justify-content:center; font-weight:700; }
    .diagram-frame { background:${p.dark}; border-radius:3px; padding:12px; overflow-x:auto; box-shadow:0 14px 34px rgba(17,24,39,.2); }
    .diagram-frame svg { display:block; min-width:640px; max-width:100%; height:auto; }
    .caption { color:${p.soft}; font-size:13px; }
    pre { background:${p.code}; color:#e5e7eb; padding:14px 16px; border-radius:4px; overflow-x:auto; font-size:12.8px; line-height:1.55; }
    .array-row { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; }
    .cell { min-width:44px; padding:8px 4px; text-align:center; border:1.5px solid ${p.dark}; border-radius:3px; background:${p.card}; font-family: IBM Plex Mono, monospace; }
    .cell .idx { display:block; color:${p.soft}; font-size:10px; }
    .cell.hit { background:${theme === "terminal" ? "#12351d" : "#eafff4"}; border-color:${p.accent}; }
    details { margin:8px 0; }
    summary { cursor:pointer; font-weight:700; }
    .answer { color:${p.soft}; border-top:1px dashed ${p.border}; margin-top:8px; padding-top:8px; }
    .sr { margin-top:36px; border:1px solid ${p.dark}; border-radius:6px; overflow:hidden; }
    .sr-head { background:${p.dark}; color:#ffffff; padding:10px 16px; font-weight:700; }
    .sr-body { display:flex; flex-wrap:wrap; }
    .sr-cell { flex:1 1 140px; padding:12px 16px; border-right:1px solid ${p.border}; background:${p.card}; }
    .sr-cell .d { font-size:11px; color:${p.soft}; text-transform:uppercase; letter-spacing:.06em; }
    .sr-cell .date { font-weight:700; font-size:14px; }
    @media (max-width:680px) {
      .wrap { padding:14px 10px 42px; }
      .masthead { padding:20px; }
      h1 { font-size:23px; }
      .grid { grid-template-columns:1fr; }
      .sr-cell { flex:1 1 45%; }
    }
  `;
}

function paragraph(title: string, text: string): string {
  return `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>`;
}

function card(title: string, body: string): string {
  return `<div class="card"><h3>${escapeHtml(title)}</h3>${body}</div>`;
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
  if (trimmed.startsWith("<svg") && trimmed.endsWith("</svg>")) return trimmed;
  return `<pre><code>${escapeHtml(diagram)}</code></pre>`;
}

function renderTrace(trace: GeneratedLesson["dsa"]["trace"]): string {
  if (!trace) return "";
  return `
    <h3>${escapeHtml(trace.title)}</h3>
    <div class="array-row">
      ${trace.cells.map((cell) => `<div class="cell${cell.highlight ? " hit" : ""}"><span class="idx">i=${cell.index}</span>${escapeHtml(cell.value)}</div>`).join("")}
    </div>
    ${orderedList(trace.steps)}
  `;
}

function renderVariants(variants: GeneratedLesson["dsa"]["variantWalkthroughs"]): string {
  if (!variants?.length) return "";
  return `
    <h3>Variant walkthroughs</h3>
    ${variants.map((variant) => `
      <div class="card">
        <h3>${escapeHtml(variant.name)}</h3>
        <p>${escapeHtml(variant.whatChanges)}</p>
        <pre><code>${escapeHtml(variant.code)}</code></pre>
        <p><strong>Complexity:</strong> ${escapeHtml(variant.complexity)}</p>
      </div>
    `).join("")}
  `;
}

function reviewSchedule(date: string): string {
  const intervals = [1, 3, 7, 16];
  return `
    <section class="sr">
      <div class="sr-head">Review schedule</div>
      <div class="sr-body">
        ${intervals.map((days) => `<div class="sr-cell"><div class="d">+${days} day${days === 1 ? "" : "s"}</div><div class="date">${formatReviewDate(addDays(date, days))}</div></div>`).join("")}
      </div>
    </section>
  `;
}

function formatReviewDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
