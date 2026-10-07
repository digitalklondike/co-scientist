import { markdown } from "./data.js";
import { commentsFor } from "./notebook-flows.js";
export function notebookMatches(book, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return book.findings.flatMap((f) => {
    const fields = [
      { type: "Block title", text: f.question },
      { type: "Content", text: markdown(f) },
      ...f.result.sources.map((s) => ({
        type: "Source",
        text: [s.title, s.author, s.year, s.url].join(" "),
      })),
      ...commentsFor(f).flatMap((c) => [
        { type: "Comment", text: c.text, commentId: c.id },
        ...(c.replies || []).map((r) => ({
          type: "Reply",
          text: r.text,
          commentId: c.id,
        })),
      ]),
    ];
    const match = fields.find((field) => field.text.toLowerCase().includes(q));
    if (!match) return [];
    const i = match.text.toLowerCase().indexOf(q),
      start = Math.max(0, i - 65),
      end = Math.min(match.text.length, i + q.length + 110);
    return [
      {
        finding: f,
        ...match,
        snippet:
          (start ? "…" : "") +
          match.text.slice(start, end) +
          (end < match.text.length ? "…" : ""),
      },
    ];
  });
}
