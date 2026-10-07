import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A real disk-backed Storage adapter lets us verify reloads and failed writes.
function diskStorage(t) {
  const dir = mkdtempSync(join(tmpdir(), "notebook-notes-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = (key) => join(dir, encodeURIComponent(key));
  return {
    getItem: (key) => existsSync(path(key)) ? readFileSync(path(key), "utf8") : null,
    setItem: (key, value) => writeFileSync(path(key), value),
    removeItem: (key) => { if (existsSync(path(key))) unlinkSync(path(key)); },
  };
}

const books = [
  { id: "one", findings: [{ id: "same", note: "Original", result: { sources: [] } }, { id: "other", note: "Keep" }] },
  { id: "two", findings: [{ id: "same", note: "Different notebook" }] },
];

test("undo refuses to overwrite a later saved note", async (t) => {
  const { saveNotebookNote } = await import("../src/notebook-notes.js");
  const storage = diskStorage(t);
  const deleted = saveNotebookNote(storage, books, "one", "same", "");
  const later = saveNotebookNote(storage, deleted, "one", "same", "New observation");
  assert.throws(() => saveNotebookNote(storage, later, "one", "same", "Original", ""), /changed/);
  assert.equal(JSON.parse(storage.getItem("cosci-books-v2"))[0].findings[0].note, "New observation");
});

test("saving a note persists only the selected notebook copy across reload", async (t) => {
  const { saveNotebookNote } = await import("../src/notebook-notes.js").catch(() => ({}));
  assert.equal(typeof saveNotebookNote, "function", "explicit persistent note saving is missing");
  const storage = diskStorage(t);
  const updated = saveNotebookNote(storage, books, "one", "same", "Human cells need separate evidence.");
  const reloaded = JSON.parse(storage.getItem("cosci-books-v2"));
  assert.equal(reloaded[0].findings[0].note, "Human cells need separate evidence.");
  assert.equal(reloaded[0].findings[1].note, "Keep");
  assert.equal(reloaded[1].findings[0].note, "Different notebook");
  assert.equal(books[0].findings[0].note, "Original");
  assert.deepEqual(updated, reloaded);
});

test("failed saving preserves the saved note and allows retry", async (t) => {
  const { saveNotebookNote } = await import("../src/notebook-notes.js").catch(() => ({}));
  assert.equal(typeof saveNotebookNote, "function");
  const storage = diskStorage(t);
  storage.setItem("cosci-books-v2", JSON.stringify(books));
  const unavailable = { ...storage, setItem() { throw new Error("Storage full"); } };
  assert.throws(() => saveNotebookNote(unavailable, books, "one", "same", "Draft"), /Storage full/);
  assert.equal(JSON.parse(storage.getItem("cosci-books-v2"))[0].findings[0].note, "Original");
  assert.equal(saveNotebookNote(storage, books, "one", "same", "Draft")[0].findings[0].note, "Draft");
});

test("draft restoration stays scoped to the notebook and rejects corrupt data", async (t) => {
  const { writeNoteDraft, readNoteDraft, clearNoteDraft } = await import("../src/notebook-notes.js").catch(() => ({}));
  assert.equal(typeof writeNoteDraft, "function");
  const storage = diskStorage(t);
  writeNoteDraft(storage, "one", "same", "Unsaved draft", "Original");
  assert.deepEqual(readNoteDraft(storage, "one", "same"), { text: "Unsaved draft", base: "Original" });
  assert.equal(readNoteDraft(storage, "two", "same"), null);
  clearNoteDraft(storage, "one", "same");
  assert.equal(readNoteDraft(storage, "one", "same"), null);
  storage.setItem("cosci-note-draft:one:same", "not json");
  assert.equal(readNoteDraft(storage, "one", "same"), null);
});

test("missing notebook or finding cannot acknowledge a successful save", async (t) => {
  const { saveNotebookNote } = await import("../src/notebook-notes.js").catch(() => ({}));
  assert.equal(typeof saveNotebookNote, "function");
  const storage = diskStorage(t);
  assert.throws(() => saveNotebookNote(storage, books, "missing", "same", "Note"));
  assert.throws(() => saveNotebookNote(storage, books, "one", "missing", "Note"));
  assert.equal(storage.getItem("cosci-books-v2"), null);
});
