import test from "node:test";
import assert from "node:assert/strict";
import {
  changeNotebook,
  snapshot,
  importSnapshot,
} from "../src/notebook-flows.js";
import { createNotebookExcerpt } from "../src/notebook-excerpts.js";
test("task reorder preserves completion/context, validates targets and survives snapshot", () => {
  const seed = [
    {
      id: "b",
      findings: [],
      nextSteps: [
        { id: "a", text: "A", done: true, findingId: "origin", commentId: "c" },
        { id: "b", text: "B", done: false },
        { id: "c", text: "C", done: false },
      ],
    },
  ];
  const moved = changeNotebook(seed, "b", {
    type: "task-move",
    taskId: "a",
    direction: 1,
  });
  assert.deepEqual(
    moved[0].nextSteps.map((t) => t.id),
    ["b", "a", "c"],
  );
  const placed = changeNotebook(moved, "b", {
    type: "task-place",
    taskId: "c",
    targetId: "b",
  });
  assert.deepEqual(
    placed[0].nextSteps.map((t) => t.id),
    ["c", "b", "a"],
  );
  assert.deepEqual(placed[0].nextSteps[2], seed[0].nextSteps[0]);
  assert.deepEqual(
    importSnapshot(snapshot({ ...placed[0], title: "Book" }, "editor"))
      .nextSteps,
    placed[0].nextSteps,
  );
  assert.throws(
    () =>
      changeNotebook(seed, "b", {
        type: "task-place",
        taskId: "a",
        targetId: "missing",
      }),
    /no longer/,
  );
  assert.throws(
    () =>
      changeNotebook([{ ...seed[0], accessRole: "viewer" }], "b", {
        type: "task-move",
        taskId: "a",
        direction: 1,
      }),
    /read-only/,
  );
  assert.deepEqual(
    seed[0].nextSteps.map((t) => t.id),
    ["a", "b", "c"],
  );
});
test("selected excerpt saves exactly the selection with independent identity and source provenance", () => {
  const record = {
    id: "research",
    question: "Question",
    result: {
      summary: "Whole answer with extra text",
      sources: [{ title: "Paper", url: "https://example.com/paper" }],
    },
  };
  const excerpt = createNotebookExcerpt(
    record,
    "  Selected passage.  ",
    "excerpt-id",
    "2026-10-07T12:00:00Z",
  );
  assert.equal(excerpt.contentMarkdown, "Selected passage.");
  assert.equal(excerpt.result.summary, "Selected passage.");
  assert.equal(excerpt.originResearchId, "research");
  assert.equal(excerpt.id, "excerpt-id");
  assert.notEqual(excerpt.result.sources, record.result.sources);
  assert.deepEqual(
    importSnapshot(
      snapshot({ id: "b", title: "Book", findings: [excerpt] }, "editor"),
    ).findings[0],
    excerpt,
  );
  assert.throws(
    () => createNotebookExcerpt(record, " ", "empty", "now"),
    /Select/,
  );
});
