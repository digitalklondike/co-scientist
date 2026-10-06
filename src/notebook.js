import { markdown } from "./data.js";

// This demo retrieves passages from the saved answer; it does not call an AI service.
export function notebookReply(finding, question) {
  const words = question.toLowerCase().match(/[a-z0-9]+/g) || [];
  const ignored = new Set([
    "what",
    "which",
    "does",
    "with",
    "from",
    "this",
    "that",
    "have",
    "about",
    "could",
    "would",
    "please",
    "answer",
    "finding",
    "show",
    "tell",
    "saved",
  ]);
  const terms = [
    ...new Set(words.filter((word) => word.length > 3 && !ignored.has(word))),
  ];
  const content = markdown(finding);
  const paragraphs = content
    .split(/\n\s*\n/)
    .filter(
      (part) => part.trim() && !/^#|^\||^- \[|^Reference:/.test(part.trim()),
    );
  if (/summari[sz]e|summary|key takeaways/i.test(question)) {
    return "From this saved answer:\n\n" + paragraphs.slice(0, 2).join("\n\n");
  }
  const ranked = paragraphs
    .map((text, index) => ({
      text,
      index,
      score: terms.filter((word) => text.toLowerCase().includes(word)).length,
    }))
    .filter((part) => part.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  if (!ranked.length)
    return "I couldn’t find a passage about that in this saved answer. This demo searches the selected finding; it doesn’t generate new evidence. Try asking for a summary or use words from the answer.";
  return (
    "Relevant passages from this saved answer:\n\n" +
    ranked
      .slice(0, 2)
      .map((part) => part.text)
      .join("\n\n")
  );
}

export function updateFinding(books, bookId, findingId, patch) {
  return books.map((book) =>
    book.id === bookId
      ? {
          ...book,
          findings: book.findings.map((finding) =>
            finding.id === findingId ? { ...finding, ...patch } : finding,
          ),
        }
      : book,
  );
}

function syncReplySaveState(findings, changed) {
  if (!changed.sourceMessageId && !/notebook/i.test(changed.result?.title || "")) return findings;
  return findings.map((finding) => {
    if (!finding.conversation) return finding;
    let touched = false;
    const conversation = finding.conversation.map((message) => {
      const matches = changed.sourceMessageId
        ? finding.id === changed.sourceFindingId && message.id === changed.sourceMessageId
        : message.question === changed.question && message.answer === changed.result.summary;
      if (!matches) return message;
      const saved = findings.some((item) => item.id !== finding.id && (
        item.sourceMessageId ? item.sourceFindingId === finding.id && item.sourceMessageId === message.id
          : /notebook/i.test(item.result?.title || "") && item.question === message.question && item.result.summary === message.answer
      ));
      if (message.saved === saved) return message;
      touched = true;
      return { ...message, saved };
    });
    return touched ? { ...finding, conversation } : finding;
  });
}

export function removeNotebookFinding(books, bookId, findingId) {
  return books.map((book) => {
    if (book.id !== bookId) return book;
    const removed = book.findings.find((item) => item.id === findingId);
    if (!removed) return book;
    return { ...book, findings: syncReplySaveState(book.findings.filter((item) => item.id !== findingId), removed) };
  });
}

export function restoreNotebookFinding(books, bookId, finding, index) {
  return books.map((book) => {
    if (book.id !== bookId || book.findings.some((item) => item.id === finding.id)) return book;
    const findings = [...book.findings];
    findings.splice(Math.min(index, findings.length), 0, finding);
    return { ...book, findings: syncReplySaveState(findings, finding) };
  });
}
