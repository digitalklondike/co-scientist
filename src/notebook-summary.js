import { markdown } from "./data.js";
export function researchRevision(book) {
  return JSON.stringify(
    book.findings.map((f) => ({
      id: f.id,
      text: markdown(f),
      sources: f.result.sources,
    })),
  );
}
export function summaryNeedsReview(book) {
  return (
    !!book.summary && book.summary.researchRevision !== researchRevision(book)
  );
}
export function notebookSources(book) {
  return [
    ...new Map(
      [
        ...(book.summary?.sources || []),
        ...book.findings.flatMap((f) => f.result.sources),
      ].map((s) => [s.url, s]),
    ).values(),
  ];
}
export function citedSummarySources(book) {
  const text = book.summary?.text || "";
  return notebookSources(book).filter(
    (s) => text.includes(`](${s.url})`) || text.includes(`](<${s.url}>)`),
  );
}

// Deterministic extractive demo: use saved prose, never invent conclusions.
export function generatedNotebookSummary(book) {
  const candidates = new Map();
  const sentences = (text) => text.split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u);
  book.findings.forEach((finding, record) => {
    const text = finding.contentMarkdown ?? finding.result.summary;
    const plain = text
      .replace(/^\s*[-*+]\s+\[[^\]]+\]\(<?https?:[^)]*\)\s*$/gm, "")
      .replace(/^#{1,6}\s+(?:sources|references|bibliography)\b[\s\S]*$/im, "")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, (_, label) =>
        /^\d+$/.test(label) ? "" : label,
      )
      .replace(/^#{1,6}\s+.*$/gm, "")
      .replace(/<https?:[^>]+>/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, "")
      .replace(/[*_`]/g, "");
    const paragraphs = plain
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(
        (p) =>
          p &&
          !/^\|/.test(p) &&
          !/I (?:couldn[’']t|could not) find a passage|This (?:local )?(?:demo|preview) (?:searches|retrieves)/i.test(
            p,
          ) &&
          !/^Relevant passages from this saved answer:$/i.test(p),
      );
    const excerpt = paragraphs[0];
    if (!excerpt) return;
    const limitation = paragraphs.find(
      (p) =>
        p !== excerpt &&
        /\b(limitations?|uncertain|cannot|does not|not establish|caution|gap)\b/i.test(
          p,
        ),
    );
    const passages = [
      ...sentences(excerpt).slice(0, 2),
      ...(limitation ? sentences(limitation).slice(0, 1) : []),
    ];
    passages.forEach((passage, position) => {
      const sentence = passage.replace(/\s+/g, " ").trim();
      const key = sentence.toLowerCase().replace(/[.!?]+$/, "");
      if (!key) return;
      const candidate = candidates.get(key);
      if (candidate) candidate.records.add(record);
      else
        candidates.set(key, {
          sentence,
          records: new Set([record]),
          position,
          order: candidates.size,
          caution:
            /\b(limitations?|uncertain|cannot|does not|not establish|caution|gap)\b/i.test(
              sentence,
            ),
        });
    });
  });

  // Prefer recurring findings, then complementary records. Keep the overview
  // to three extracted sentences and 100 words, without per-record sections.
  const remaining = [...candidates.values()];
  const covered = new Set();
  const selected = [];
  while (remaining.length && selected.length < 3) {
    const score = (candidate) =>
      [...candidate.records].filter((record) => !covered.has(record)).length *
        4 +
      candidate.records.size -
      candidate.position / 4 +
      (selected.length && candidate.caution ? 1 : 0);
    remaining.sort((a, b) => score(b) - score(a));
    const next = remaining.shift();
    selected.push(next);
    next.records.forEach((record) => covered.add(record));
  }
  const words = selected
    .sort((a, b) => a.order - b.order)
    .map(({ sentence }) =>
      /[.!?…]$/.test(sentence) ? sentence : `${sentence}.`,
    )
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);
  return words.length > 100
    ? `${words
        .slice(0, 100)
        .join(" ")
        .replace(/[.,;:]$/, "")}…`
    : words.join(" ");
}
