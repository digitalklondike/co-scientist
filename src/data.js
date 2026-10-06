export const SAMPLE =
  "sample,SUN1,LMNA\nHeart 1,12.4,8.1\nHeart 2,14.1,9.3\nHeart 3,11.8,8.8\nHeart 4,13.7,9.1\nHeart 5,12.9,8.6";
export const EXAMPLES = {
  literature: [
    [
      "Which transcription factors reprogram fibroblasts into cardiomyocytes?",
      "Compare the evidence across experimental models.",
    ],
    [
      "How does cardiac reprogramming differ between mouse and human cells?",
      "Explore limitations before your next experiment.",
    ],
  ],
  data: [
    [
      "Calculate the mean expression of SUN1 and LMNA in the sample CSV.",
      "Try a small dataset, then attach your own.",
    ],
    [
      "Summarise the numeric columns in my CSV with means and ranges.",
      "A descriptive summary, without an unnecessary full analysis.",
    ],
  ],
  hypotheses: [
    [
      "Generate hypotheses for improving cardiac reprogramming.",
      "Review the scope, then explore three testable ideas.",
    ],
    [
      "Suggest experimental ideas to address gaps in cardiac reprogramming.",
      "Turn the evidence into a next step.",
    ],
  ],
};
export const PAPERS = [
  {
    title:
      "Direct reprogramming of fibroblasts into functional cardiomyocytes by defined factors",
    author: "Ieda et al.",
    journal: "Cell",
    year: "2010",
    model: "Mouse · In vitro",
    url: "https://pubmed.ncbi.nlm.nih.gov/20691899/",
  },
  {
    title:
      "Heart repair by reprogramming non-myocytes with cardiac transcription factors",
    author: "Song et al.",
    journal: "Nature",
    year: "2012",
    model: "Mouse · In vivo",
    url: "https://pubmed.ncbi.nlm.nih.gov/22660318/",
  },
  {
    title: "Reprogramming of human fibroblasts toward a cardiac fate",
    author: "Nam et al.",
    journal: "PNAS",
    year: "2013",
    model: "Human · In vitro",
    url: "https://pubmed.ncbi.nlm.nih.gov/23487791/",
  },
];
export const SUMMARY =
  "GATA4, MEF2C and TBX5 (GMT) form a foundational combination for direct cardiac reprogramming in mouse fibroblasts. Human-cell studies use additional factors or microRNAs; the same recipe should not be assumed to work across models.";
export const IDEAS = [
  [
    "Separate cell identity from functional maturation",
    "Cardiac marker expression and a mature functional phenotype are different endpoints.",
    "Compare marker expression with calcium handling and contractile function over time.",
  ],
  [
    "Compare starting fibroblast populations",
    "Cell origin is a potential source of differences between protocols.",
    "Compare cardiac and dermal fibroblast populations under the same protocol.",
  ],
  [
    "Test the sequence of factor delivery",
    "Timing may influence the transition to a cardiac-like state.",
    "Compare concurrent and staged delivery with predefined functional endpoints.",
  ],
];
export const fmt = (n) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(n);
export function parseCSV(text) {
  const rows = [];
  let row = [],
    value = "",
    quoted = false;
  const input = text.replace(/^\uFEFF/, "").trim();
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += c;
  }
  if (quoted)
    throw Error("A quoted value is not closed. Please check the CSV.");
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2)
    throw Error("Include a header row and at least one data row.");
  const headers = rows.shift();
  if (rows.some((r) => r.length !== headers.length))
    throw Error(
      "The rows have different numbers of columns. Please check the CSV.",
    );
  const columns = headers
    .map((name, i) => {
      const cells = rows.map((r) => r[i]).filter((v) => v !== "");
      if (!cells.length || cells.some((v) => !Number.isFinite(Number(v))))
        return null;
      const nums = cells.map(Number);
      return {
        name: name
          ? headers.filter((h) => h === name).length > 1
            ? `${name} (${i + 1})`
            : name
          : `Column ${i + 1}`,
        count: nums.length,
        mean: nums.reduce((a, b) => a + b, 0) / nums.length,
        min: nums.reduce((a, b) => Math.min(a, b), Infinity),
        max: nums.reduce((a, b) => Math.max(a, b), -Infinity),
        missing: rows.length - nums.length,
      };
    })
    .filter(Boolean);
  if (!columns.length)
    throw Error("No numeric columns found. Use comma-separated numeric data.");
  return { rows: rows.length, columns };
}
export function answer(task) {
  if (task.kind === "data") {
    if (!task.file)
      return {
        title: "Add a dataset to get started",
        summary:
          "Attach a CSV or use the sample dataset to calculate means and ranges.",
        needsFile: true,
        sources: [],
      };
    return {
      title: "A quick look at your dataset",
      summary: `${task.file.stats.rows} rows analysed. ${task.file.stats.columns.map((c) => `${c.name}: mean ${fmt(c.mean)}`).join("; ")}.`,
      stats: task.file.stats,
      filename: task.file.name,
      sources: [],
    };
  }
  if (task.kind === "hypotheses")
    return {
      title: "Three ideas to investigate",
      summary:
        "Start with a small set of hypotheses: distinguish functional maturation from marker expression, compare starting cells, and test factor-delivery timing.",
      sources: PAPERS,
    };
  return {
    title: "Key factors for cardiac reprogramming",
    summary: SUMMARY,
    sources: PAPERS,
    unrelated: !/cardio|fibroblast|reprogram|gata|mef2|tbx5|cardiac/i.test(
      task.question,
    ),
  };
}
export function download(name, body) {
  const url = URL.createObjectURL(
    new Blob([body], { type: "text/markdown;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function markdown(r) {
  return (
    `# ${r.question}\n\n${r.result.summary}\n\n` +
    (r.result.sources.length
      ? r.result.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")
      : `Source: ${r.result.filename || "No dataset"}`)
  );
}
