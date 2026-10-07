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
  return book.findings
    .map((finding) => {
      const text = finding.contentMarkdown ?? finding.result.summary;
      const plain = text
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, (_, label) =>
          /^\d+$/.test(label) ? "" : label,
        )
        .replace(/^#{1,6}\s+.*$/gm, "")
        .replace(/<https?:[^>]+>/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[*_`]/g, "");
      const paragraphs = plain
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(
          (p) =>
            p &&
            !/^\|/.test(p) &&
            !/^Relevant passages from this saved answer:$/i.test(p),
        );
      const excerpt = paragraphs[0] || "No prose in this record.";
      const lead = excerpt
        .split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
        .slice(0, 2)
        .join(" ")
        .trim();
      const limitation = paragraphs.find(
        (p) =>
          p !== excerpt &&
          /\b(limitations?|uncertain|cannot|does not|not establish|caution|gap)\b/i.test(
            p,
          ),
      );
      const sources = finding.result.sources
        .map(
          (s) =>
            `[${s.author || s.title}${s.year ? `, ${s.year}` : ""}](<${s.url}>)`,
        )
        .join(" · ");
      return `### ${finding.question}\n\n${lead}${limitation ? `\n\n${limitation}` : ""}${sources ? `\n\n${sources}` : ""}`;
    })
    .join("\n\n");
}
