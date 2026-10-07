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
