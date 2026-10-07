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
    [
      "Compare the experimental models in the included cardiac reprogramming studies.",
      "Compare the three prepared study summaries.",
    ],
    [
      "Create a target profile for GATA4 using the included cardiac reprogramming papers.",
      "Explore a limited, prepared target profile.",
    ],
    ["Summarize the key findings in the included cardiac reprogramming studies.", "Review the main findings and limitations."],
    ["Review the evidence gaps in the included cardiac reprogramming studies.", "Explore uncertainties in these three studies."],
    ["Compare the measured endpoints in the included cardiac reprogramming studies.", "Distinguish cell identity from functional maturation."],
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
    [
      "Visualize mean SUN1 and LMNA expression in the sample CSV as a bar chart.",
      "Calculate and plot the sample data locally.",
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
export const CARDIAC_REPORT = {
  overview: "The central comparison is between experimental systems, not just factor names. This example separates human-cell evidence, mouse-cell experiments and mouse injury models, then identifies what would be needed to compare their outcomes. It covers three original studies; it is not a current or exhaustive literature review.",
  studies: [
    { study: 0, system: "Mouse fibroblasts · In vitro", factors: "Gata4, Mef2c, Tbx5 (GMT)", finding: "Conversion into cardiomyocyte-like cells", limit: "Cell-culture findings do not establish repair in humans." },
    { study: 1, system: "Mouse cells and injured heart · In vitro / In vivo", factors: "Gata4, Hand2, Mef2c, Tbx5 (GHMT)", finding: "Cardiac-like cells and improved function in a mouse injury model", limit: "An animal outcome is not evidence of clinical efficacy." },
    { study: 2, system: "Human fibroblasts · In vitro", factors: "GATA4, HAND2, TBX5, myocardin; miR-1 and miR-133", finding: "Cardiac gene expression and developing cardiac-like properties", limit: "Most cells remained partially reprogrammed." },
  ],
  sections: [
    { title: "Human evidence", paragraphs: ["Nam and colleagues studied neonatal and adult human fibroblasts using four transcription factors and two muscle-specific microRNAs. The combination activated cardiac markers and reduced fibroblast gene expression. This is a different experimental recipe from the mouse GMT combination.", "With extended culture, some cells developed sarcomeric organization and calcium transients; spontaneous contraction was observed in a small subset. Most cells remained partially reprogrammed. The study therefore supports a transition toward a cardiac fate, rather than uniform production of mature cardiomyocytes."], source: 2 },
    { title: "Animal and in vivo evidence", paragraphs: ["Song and colleagues used GHMT to generate beating cardiac-like cells from adult mouse fibroblasts in culture. They also delivered these factors to dividing non-cardiomyocytes in mice after myocardial infarction, reporting improved cardiac function and reduced adverse ventricular remodelling.", "This adds an organ-level outcome to cellular observations. However, species, injury context, delivery and the surrounding heart tissue all differ from a human fibroblast culture. The mouse findings cannot be read as a direct estimate of how a human-cell protocol will perform."], source: 1 },
    { title: "In vitro evidence", paragraphs: ["Ieda and colleagues identified GMT as a combination capable of directly converting postnatal mouse cardiac and dermal fibroblasts into cardiomyocyte-like cells. The reported changes included cardiac gene expression and functional properties, without an intervening pluripotent state.", "This provides a starting point for comparing factor combinations. It does not make GMT a universal recipe: a comparison with the human study must account for cell origin, culture conditions, factor delivery and the endpoints used to define conversion."], source: 0 },
    { title: "What counts as a convincing result?", paragraphs: ["Treat cell identity and functional maturation as separate questions. Cardiac markers indicate activation of a gene program; organized sarcomeres, calcium handling, electrical activity and contraction address different aspects of function. An improvement in an injured animal heart is a further, distinct outcome.", "For a useful comparison, extract the starting cell population, factor combination, delivery method, observation period and measured endpoints from each original paper. Keep denominators and assay definitions alongside any reported efficiency. These selected studies do not form a matched head-to-head dataset."], items: ["Identity: cardiac markers alongside loss of fibroblast characteristics.", "Structure: sarcomeric organization and cell morphology.", "Function: calcium dynamics, action potentials and contractile activity.", "Model outcome: changes in cardiac function in the tested animal context."] },
    { title: "Evidence gaps and next questions", paragraphs: ["The practical gap is not simply finding more factors. It is determining whether a protocol produces reproducible, sufficiently mature cells in the relevant starting population. The three studies use different systems, so their outcomes should stay separate until methods and endpoints can be aligned."], items: ["Which endpoints were measured in both mouse and human experiments?", "How much of the observed population reached a functional cardiac-like state?", "What changes when the same factors are tested in a different fibroblast population?", "Which findings have been replicated in more recent, independent studies?"] },
    { title: "Conclusion", paragraphs: ["GMT is a foundational mouse-cell example; GHMT adds mouse in vivo evidence; the included human study uses additional factors and microRNAs and reports incomplete maturation in most cells. The useful result is a map of these differences, not a single interchangeable protocol.", "Use the original papers to inspect the experimental details, then keep this comparison and its citations in Notebook with your own observations. A broader research report would need additional literature and, for computational claims, actual datasets and analysis results."] },
  ],
};
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
      title: /visualiz|bar chart|plot/i.test(task.question)
        ? "Mean expression across your dataset"
        : "A quick look at your dataset",
      visualization: /visualiz|bar chart|plot/i.test(task.question),
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
  if (/(?:target (?:profile|dossier)|(?:profile|dossier) (?:of|for)).*gata4/i.test(task.question))
    return {
      title: "GATA4 · Prepared target profile",
      scenario: "target",
      summary:
        "This example groups the included cardiac reprogramming evidence around GATA4. It is a limited research profile, not a comprehensive target or safety assessment.",
      sources: PAPERS,
    };
  if (/compare the experimental models/i.test(task.question))
    return {
      title: "Comparison of the included studies",
      scenario: "comparison",
      summary:
        "The included papers cover mouse cells in vitro, a mouse in vivo model, and human cells in vitro. Compare these experimental settings before treating findings as interchangeable.",
      sources: PAPERS,
    };
  const sectionTitle = /evidence gaps/i.test(task.question) ? "Evidence gaps and next questions"
    : /measured endpoints/i.test(task.question) ? "What counts as a convincing result?"
      : /summari[sz]e the key findings/i.test(task.question) ? "Conclusion" : null;
  if (sectionTitle) {
    const section = CARDIAC_REPORT.sections.find((item) => item.title === sectionTitle);
    return {
      title: sectionTitle,
      summary: section.paragraphs.join(" "),
      report: CARDIAC_REPORT,
      sources: PAPERS,
    };
  }
  return {
    title: "Key factors for cardiac reprogramming",
    summary: SUMMARY,
    report: CARDIAC_REPORT,
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
  if (r.contentMarkdown !== undefined) return r.contentMarkdown;
  return (
    `# ${r.question}\n\n${r.result.summary}\n\n` +
    (r.result.report ? `## Overview\n\n${r.result.report.overview}\n\n` +
      "## Experimental systems\n\n| System | Factors | Finding | Limitation | Study |\n| --- | --- | --- | --- | --- |\n" +
      r.result.report.studies.map((row) => `| ${row.system} | ${row.factors} | ${row.finding} | ${row.limit} | ${PAPERS[row.study].author}, ${PAPERS[row.study].year} |`).join("\n") + "\n\n" +
      r.result.report.sections.map((section) => `## ${section.title}\n\n${section.paragraphs.join("\n\n")}\n\n${section.items ? section.items.map((item) => `- ${item}`).join("\n") + "\n\n" : ""}${section.source !== undefined ? `Reference: ${PAPERS[section.source].author}, ${PAPERS[section.source].year}\n\n` : ""}`).join("") : "") +
    (r.result.sources.length
      ? r.result.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")
      : `Source: ${r.result.filename || "No dataset"}`)
  );
}
