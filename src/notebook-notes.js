import { updateFinding } from "./notebook.js";

export function saveNotebookNote(storage, books, bookId, findingId, note, expectedNote) {
  const finding = books.find((book) => book.id === bookId)?.findings.find((item) => item.id === findingId);
  if (!finding) {
    throw new Error("This saved answer is no longer in the notebook.");
  }
  if (expectedNote !== undefined && (finding.note || "") !== expectedNote) throw new Error("The note has changed.");
  const next = updateFinding(books, bookId, findingId, { note });
  // Persist before acknowledging success or replacing the in-memory saved value.
  storage.setItem("cosci-books-v2", JSON.stringify(next));
  return next;
}

const draftKey = (bookId, findingId) => `cosci-note-draft:${bookId}:${findingId}`;

export function readNoteDraft(storage, bookId, findingId) {
  try {
    const draft = JSON.parse(storage.getItem(draftKey(bookId, findingId)));
    return typeof draft?.text === "string" && typeof draft?.base === "string" ? draft : null;
  } catch { return null; }
}

export function writeNoteDraft(storage, bookId, findingId, text, base) {
  storage.setItem(draftKey(bookId, findingId), JSON.stringify({ text, base }));
}

export function clearNoteDraft(storage, bookId, findingId) {
  storage.removeItem(draftKey(bookId, findingId));
}
