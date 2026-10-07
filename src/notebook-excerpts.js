export function createNotebookExcerpt(record, text, id, now) {
  const excerpt = text.trim();
  if (!excerpt) throw Error("Select some answer text first.");
  return {
    id,
    kind: "note",
    origin: "excerpt",
    question: `Excerpt: ${record.question}`,
    originResearchId: record.id,
    originQuestion: record.question,
    savedAt: now,
    contentMarkdown: excerpt,
    note: "",
    comments: [],
    result: {
      title: "Selected answer text",
      summary: excerpt,
      sources: structuredClone(record.result.sources),
    },
  };
}
