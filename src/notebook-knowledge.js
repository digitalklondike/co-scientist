export const NOTEBOOK_TEMPLATES = [
  {
    id: "blank",
    title: "Blank notebook",
    description: "Start with your own research.",
  },
  {
    id: "literature",
    title: "Literature review",
    description: "Question, findings, limitations and synthesis.",
  },
  {
    id: "compare",
    title: "Compare studies",
    description: "Compare methods, outcomes and evidence gaps.",
  },
  {
    id: "experiment",
    title: "Experiment plan",
    description: "Objective, method, controls and next steps.",
  },
];
const structures = {
  literature: [
    ["Research question", "Define the question and scope of this review."],
    [
      "Findings",
      "Add saved research and cite the sources supporting each finding.",
    ],
    [
      "Limitations",
      "Record uncertainties, conflicting evidence and missing information.",
    ],
    ["Synthesis", "Write your conclusion after reviewing the evidence."],
  ],
  compare: [
    ["Comparison question", "Define what should be compared and why."],
    [
      "Study comparison",
      "| Study | System | Method | Outcome | Limitations |\n| --- | --- | --- | --- | --- |\n| Add a study | | | | |",
    ],
    [
      "Evidence gaps",
      "Describe where the studies cannot be directly compared.",
    ],
  ],
  experiment: [
    ["Objective", "Describe the hypothesis and measurable objective."],
    [
      "Method and controls",
      "Specify the procedure, controls and measurements.",
    ],
    [
      "Decision criteria",
      "Define how you will interpret results and what to do next.",
    ],
  ],
};
export function templateFindings(type, now = new Date().toISOString()) {
  return (structures[type] || []).map(([title, text]) => ({
    id: crypto.randomUUID(),
    question: title,
    kind: "note",
    origin: "personal",
    savedAt: now,
    contentMarkdown: `# ${title}\n\n${text}`,
    result: { title: "Your own block", summary: text, sources: [] },
    comments: [],
  }));
}
export function notebookSections(text, findingId) {
  let fence = false,
    index = 0;
  const result = [];
  for (const [lineIndex, line] of text.split("\n").entries()) {
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^(#{2,6})\s+(.+?)\s*#*$/);
    if (m)
      result.push({
        id: `section-${findingId}-${index++}`,
        line: lineIndex + 1,
        title: m[2].replace(/[*_`]/g, ""),
        level: m[1].length,
      });
  }
  return result;
}
export function blockHash(bookId, findingId, sectionId = "") {
  const p = new URLSearchParams({ notebook: bookId, block: findingId });
  if (sectionId) p.set("section", sectionId);
  return "#" + p.toString();
}
export function parseBlockHash(hash) {
  try {
    if (/%(?![\da-f]{2})/i.test(hash)) return null;
    const p = new URLSearchParams(hash.replace(/^#/, ""));
    if (!p.get("notebook") || !p.get("block")) return null;
    return {
      bookId: p.get("notebook"),
      findingId: p.get("block"),
      sectionId: p.get("section") || "",
    };
  } catch {
    return null;
  }
}
export function versionDifference(before, after) {
  const a = before.split("\n"),
    b = after.split("\n");
  if (a.length * b.length > 250000)
    return [
      ...a.map((text) => ({ type: "remove", text })),
      ...b.map((text) => ({ type: "add", text })),
    ];
  const matrix = Array.from(
    { length: a.length + 1 },
    () => new Uint32Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      matrix[i][j] =
        a[i] === b[j]
          ? matrix[i + 1][j + 1] + 1
          : Math.max(matrix[i + 1][j], matrix[i][j + 1]);
  const result = [];
  let i = 0,
    j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j])
      (result.push({ type: "equal", text: a[i++] }), j++);
    else if (
      j < b.length &&
      (i === a.length || matrix[i][j + 1] > matrix[i + 1][j])
    )
      result.push({ type: "add", text: b[j++] });
    else result.push({ type: "remove", text: a[i++] });
  }
  return result;
}
