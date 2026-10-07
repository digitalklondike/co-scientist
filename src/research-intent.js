// The local preview uses these rules to demonstrate intent clarification.
// Production agent orchestration is not connected to this prototype.
export const SCENARIO_TOPICS = [
  { id: "evidence", label: "Scientific evidence" },
  { id: "hypotheses", label: "Hypotheses" },
  { id: "data", label: "Data & visualization" },
  { id: "targets", label: "Targets & mechanisms" },
  { id: "planning", label: "Study planning" },
];

export const SCENARIOS = [
  {
    id: "hypotheses",
    topic: "hypotheses",
    kind: "hypotheses",
    example: 0,
    icon: "ideas",
    title: "Explore new hypotheses",
    outcome: "Get testable ideas with a rationale and an experiment to try.",
    prompt: "Generate hypotheses about [your research topic].",
    hint: "Name the problem you want to investigate and what you hope to explain.",
  },
  {
    id: "literature",
    topic: "evidence",
    kind: "literature",
    example: 1,
    icon: "papers",
    title: "Find scientific evidence",
    outcome: "Get an answer grounded in papers, with sources and limitations.",
    prompt: "Find published evidence about [your research question].",
    hint: "Describe what you want to know. You can include a cell type, mechanism or disease.",
  },
  {
    id: "analysis",
    topic: "data",
    kind: "data",
    example: 0,
    icon: "calculate",
    title: "Calculate from your data",
    outcome: "Get column means and ranges from an attached CSV.",
    prompt: "Calculate the mean and range of [column names] in my CSV.",
    hint: "Attach your CSV and name the columns to explore, or try the sample dataset.",
  },
  {
    id: "comparison",
    topic: "evidence",
    kind: "literature",
    example: 2,
    icon: "compare",
    title: "Compare study findings",
    outcome: "See how experimental models, methods and findings differ.",
    prompt:
      "Compare [experimental models or approaches] using published evidence.",
    hint: "Name what you want to compare and which differences matter to you.",
  },
  {
    id: "visualization",
    topic: "data",
    kind: "data",
    example: 2,
    icon: "chart",
    title: "Visualize your data",
    outcome: "Get a bar chart of column means from your CSV.",
    prompt: "Plot the mean of [column names] in my CSV as a bar chart.",
    hint: "Attach a CSV and name the columns to plot, or try the sample dataset.",
  },
  {
    id: "target",
    topic: "targets",
    kind: "literature",
    example: 3,
    icon: "target",
    title: "Explore a target profile",
    outcome:
      "Get a structured overview of a target and its supporting evidence.",
    prompt: "Create a target profile for [target name].",
    hint: "Name the gene or protein and the research context you want to explore.",
  },
  {
    id: "summary",
    topic: "evidence",
    kind: "literature",
    example: 4,
    icon: "summary",
    title: "Summarize key findings",
    outcome: "Bring the main findings and their limitations together.",
    prompt: "Summarize the key findings about [your research topic].",
    hint: "Name your topic, or choose a previous research answer to summarize.",
  },
  {
    id: "gaps",
    topic: "evidence",
    kind: "literature",
    example: 5,
    icon: "gaps",
    title: "Review evidence gaps",
    outcome:
      "See what remains uncertain and which questions need more evidence.",
    prompt: "Review the evidence gaps in [your research topic].",
    hint: "Name your topic and the uncertainties you want to examine.",
  },
  {
    id: "endpoints",
    topic: "evidence",
    kind: "literature",
    example: 6,
    icon: "endpoints",
    title: "Compare research endpoints",
    outcome:
      "Separate measured outcomes from claims about biological function.",
    prompt: "Compare the measured endpoints in [your research topic].",
    hint: "Name the topic or experimental models whose outcomes you want to compare.",
  },
  {
    id: "methods",
    topic: "evidence",
    kind: "literature",
    example: null,
    icon: "methods",
    title: "Compare research methods",
    outcome:
      "Compare how studies collect, measure and interpret their results.",
    prompt:
      "Compare the research methods used to study [your research topic], including their strengths and limitations.",
    hint: "Name your topic and the methods you want to compare.",
  },
  {
    id: "prioritize",
    topic: "hypotheses",
    kind: "hypotheses",
    example: null,
    icon: "prioritize",
    title: "Prioritize your hypotheses",
    outcome: "Rank ideas by supporting evidence, impact and ease of testing.",
    prompt:
      "Help me prioritize hypotheses about [your research topic] by evidence, potential impact and feasibility.",
    hint: "Add your candidate hypotheses and explain what a useful result would look like.",
  },
  {
    id: "test-hypotheses",
    topic: "hypotheses",
    kind: "hypotheses",
    example: null,
    icon: "test-hypotheses",
    title: "Turn ideas into experiments",
    outcome:
      "Suggest a test, a control and a measurable outcome for each idea.",
    prompt:
      "Suggest experiments to test hypotheses about [your research topic], with controls and measurable outcomes.",
    hint: "Describe your hypothesis, experimental system and available resources.",
  },
  {
    id: "data-quality",
    topic: "data",
    kind: "data",
    example: null,
    icon: "data-quality",
    title: "Check your data quality",
    outcome: "Look for missing values, unusual entries and possible outliers.",
    prompt:
      "Check [column names] in my CSV for missing values, inconsistent entries and possible outliers.",
    hint: "Name the columns and explain which values or units you expect.",
  },
  {
    id: "distributions",
    topic: "data",
    kind: "data",
    example: null,
    icon: "distributions",
    title: "Explore data distributions",
    outcome: "See the spread and shape of values before choosing an analysis.",
    prompt:
      "Visualize the distributions of [column names] in my CSV and describe their spread and shape.",
    hint: "Name the numeric columns and any groups you want to examine separately.",
  },
  {
    id: "correlations",
    topic: "data",
    kind: "data",
    example: null,
    icon: "correlations",
    title: "Explore variable relationships",
    outcome: "Explore associations between columns and possible confounders.",
    prompt:
      "Explore the relationships between [column names] in my CSV, noting possible confounders and avoiding causal claims.",
    hint: "Name the variables and describe how the samples were collected.",
  },
  {
    id: "mechanisms",
    topic: "targets",
    kind: "literature",
    example: null,
    icon: "mechanisms",
    title: "Map biological mechanisms",
    outcome: "Connect reported mechanisms and see where evidence is uncertain.",
    prompt:
      "Map the published biological mechanisms involving [target name], with supporting evidence and uncertainties.",
    hint: "Name your target and include the cell type or disease context.",
  },
  {
    id: "target-evidence",
    topic: "targets",
    kind: "literature",
    example: null,
    icon: "target-evidence",
    title: "Assess target evidence",
    outcome: "Review evidence for a target across models and study types.",
    prompt:
      "Assess the published evidence for [target name] across experimental models, including conflicting findings and gaps.",
    hint: "Name the target, its proposed role and the evidence you want to assess.",
  },
  {
    id: "controls",
    topic: "planning",
    kind: "literature",
    example: null,
    icon: "controls",
    title: "Choose experimental controls",
    outcome:
      "Identify controls that help separate a treatment effect from bias.",
    prompt:
      "Suggest experimental controls for [your research topic], explaining what each control would help rule out.",
    hint: "Describe the intervention, readout and sources of variation you expect.",
  },
  {
    id: "experiment-plan",
    topic: "planning",
    kind: "literature",
    example: null,
    icon: "experiment-plan",
    title: "Outline an experiment",
    outcome: "Build a draft plan with steps, readouts and decision points.",
    prompt:
      "Outline an experiment to investigate [your research question], including key steps, readouts and decision points.",
    hint: "Describe your question, experimental system and practical constraints.",
  },
  {
    id: "replication",
    topic: "planning",
    kind: "literature",
    example: null,
    icon: "replication",
    title: "Plan a replication study",
    outcome: "Identify the conditions and checks needed to repeat a finding.",
    prompt:
      "Help plan a replication study for [your research topic], identifying essential conditions, controls and success criteria.",
    hint: "Describe the finding you want to repeat and link or name the original study.",
  },
];

export function researchIntent(question, hasFile = false) {
  if (hasFile || /\bcsv\b|numeric columns?|column means?/i.test(question))
    return "data";
  // A named profile/dossier is already an explicit request, not an ambiguous mechanism question.
  if (/target (?:profile|dossier)/i.test(question)) return "literature";
  if (
    /\b(?:generate|suggest|propose|develop|create|want|need|new)\b.{0,50}\bhypothes|experimental ideas/i.test(
      question,
    )
  )
    return "hypotheses";
  if (
    /\b(?:published|known|established|existing|reported)\b|based on (?:the )?(?:sources|literature)|what (?:is|are) (?:a |the )?hypothes/i.test(
      question,
    )
  )
    return "literature";
  if (
    /(?:\b(?:what|which|how)\b.{0,55}\b(?:could|might|may)\b|\bpossible mechanisms?\b)/i.test(
      question,
    )
  )
    return "clarify";
  return "literature";
}

export function hasPromptPlaceholder(question) {
  return /\[(?:your research topic|your research question|column names|experimental models or approaches|target name)\]/i.test(
    question,
  );
}

export function supportsPreparedTopic(question) {
  return /cardio|fibroblast|reprogram|\bgata4\b|\bmef2c\b|\btbx5\b/i.test(
    question,
  );
}
