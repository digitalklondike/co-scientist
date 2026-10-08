import test from "node:test";
import assert from "node:assert/strict";
import { changeNotebook } from "../src/notebook-flows.js";
import {
  notebookDragTarget,
  placeNotebookItem,
} from "../src/notebook-presentation.js";
const books = [
  {
    id: "b",
    findings: ["a", "b", "c"].map((id) => ({
      id,
      question: id,
      result: { summary: id, sources: [] },
      comments: [{ id: "comment-" + id, text: "Keep " + id }],
    })),
  },
];
test("dragging crosses resting row midpoints and can return to the original order", () => {
  const rows = [
    { id: "a", top: 0, bottom: 40 },
    { id: "b", top: 52, bottom: 152 },
    { id: "c", top: 164, bottom: 204 },
  ];
  assert.equal(notebookDragTarget(rows, "a", 101), "a");
  assert.equal(notebookDragTarget(rows, "a", 102), "b");
  assert.equal(notebookDragTarget(rows, "a", 185), "c");
  assert.equal(notebookDragTarget(rows, "a", 20), "a");
  assert.equal(notebookDragTarget(rows, "c", -20), "a");
  assert.equal(notebookDragTarget(rows, "c", 102), "c");
  assert.equal(notebookDragTarget(rows, "missing", 100), "missing");
  const items = books[0].findings;
  const moved = placeNotebookItem(
    items,
    "a",
    notebookDragTarget(rows, "a", 185),
  );
  assert.deepEqual(
    moved.map((item) => item.id),
    ["b", "c", "a"],
  );
  assert.equal(moved[2].comments[0].text, "Keep a");
  assert.deepEqual(
    items.map((item) => item.id),
    ["a", "b", "c"],
  );
});
test("placing a research block retains its complete data and rejects missing targets", () => {
  const moved = changeNotebook(books, "b", {
    type: "block-place",
    findingId: "a",
    targetId: "c",
  });
  assert.deepEqual(
    moved[0].findings.map((f) => f.id),
    ["b", "c", "a"],
  );
  assert.equal(moved[0].findings[2].comments[0].text, "Keep a");
  assert.deepEqual(
    books[0].findings.map((f) => f.id),
    ["a", "b", "c"],
  );
  assert.throws(
    () =>
      changeNotebook(books, "b", {
        type: "block-place",
        findingId: "a",
        targetId: "missing",
      }),
    /target/,
  );
  assert.throws(
    () =>
      changeNotebook([{ ...books[0], accessRole: "viewer" }], "b", {
        type: "block-place",
        findingId: "a",
        targetId: "c",
      }),
    /read-only/,
  );
});
test("Notebook dates and chart counts follow actual saved metadata", async () => {
  const { formatNotebookDate, sourceYearCounts, sortNotebookItems } =
    await import("../src/notebook-presentation.js");
  const date = new Date(2026, 9, 7, 13, 57, 47);
  assert.equal(formatNotebookDate(date.toISOString()), "7.10.2026 · 13:57");
  assert.equal(formatNotebookDate(date.getTime()), "7.10.2026 · 13:57");
  assert.equal(formatNotebookDate(null), "date unavailable");
  assert.deepEqual(
    sourceYearCounts([
      { year: 2010 },
      { year: 2010 },
      { year: 2013 },
      { year: "unknown" },
    ]),
    [
      { year: 2010, count: 2 },
      { year: 2013, count: 1 },
    ],
  );
  assert.deepEqual(
    sortNotebookItems(
      [
        { id: "2", title: "Zoo" },
        { id: "1", title: "Alpha" },
      ],
      "title",
    ).map((b) => b.id),
    ["1", "2"],
  );
});
