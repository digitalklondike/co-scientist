import test from "node:test";
import assert from "node:assert/strict";
import {
  changeNotebook,
  snapshot,
  importSnapshot,
  exportNotebook,
} from "../src/notebook-flows.js";
import {
  generatedNotebookSummary,
  summaryNeedsReview,
  citedSummarySources,
} from "../src/notebook-summary.js";
const seed = [
  {
    id: "b",
    title: "Book",
    findings: [
      {
        id: "f",
        question: "Question",
        result: {
          summary: "Evidence",
          sources: [{ title: "Source", url: "https://example.com/paper" }],
        },
        comments: [],
      },
    ],
  },
];
test("summary versions, stale research, explicit citations and restore preserve evidence", () => {
  const saved = changeNotebook(seed, "b", {
    type: "summary-save",
    text: "Result [1](<https://example.com/paper>)",
    now: "2026-10-07T10:00:00Z",
  });
  assert.equal(summaryNeedsReview(saved[0]), false);
  assert.equal(citedSummarySources(saved[0]).length, 1);
  const comments = changeNotebook(saved, "b", {
    type: "comment-add",
    findingId: "f",
    text: "Check",
  });
  assert.equal(summaryNeedsReview(comments[0]), false);
  const changed = changeNotebook(comments, "b", {
    type: "block-edit",
    findingId: "f",
    text: "Updated research",
  });
  assert.equal(summaryNeedsReview(changed[0]), true);
  const next = changeNotebook(changed, "b", {
    type: "summary-save",
    text: "Updated summary",
  });
  assert.equal(summaryNeedsReview(next[0]), false);
  assert.equal(next[0].summary.versions[0].text, saved[0].summary.text);
  const restored = changeNotebook(next, "b", {
    type: "summary-restore",
    versionId: next[0].summary.versions[0].id,
  });
  assert.equal(summaryNeedsReview(restored[0]), true);
  assert.equal(restored[0].findings[0].comments.length, 1);
  assert.equal(citedSummarySources(restored[0]).length, 1);
  assert.deepEqual(
    importSnapshot(snapshot(restored[0], "viewer")).summary,
    restored[0].summary,
  );
  assert.throws(
    () =>
      changeNotebook([{ ...seed[0], accessRole: "viewer" }], "b", {
        type: "summary-save",
        text: "No",
      }),
    /read-only/,
  );
});

test("summary export, bounded history and malformed imports", () => {
  let books = seed;
  for (let i = 0; i < 8; i++) {
    books = changeNotebook(books, "b", {
      type: "summary-save",
      text: `Summary ${i}`,
    });
  }
  assert.equal(books[0].summary.versions.length, 5);
  assert.match(
    exportNotebook(books[0], "md").body,
    /## Summary[\s\S]*Automatically extracted[\s\S]*### Question[\s\S]*Evidence/,
  );
  const invalid = {
    ...books[0],
    summary: { ...books[0].summary, sources: null },
  };
  assert.throws(
    () => importSnapshot(snapshot(invalid, "editor")),
    /Invalid summary/,
  );
});

test("automatic summary covers every record, follows edits and removal without overwriting legacy text", () => {
  const book = structuredClone(seed[0]);
  book.summary = { text: "Preserved manual summary" };
  book.findings.push({
    id: "second",
    question: "Second question",
    contentMarkdown:
      "# Second question\n\nSecond finding. Another sentence. Extra detail.\n\nLimitations remain uncertain.",
    result: { summary: "Old result", sources: [] },
  });
  const generated = generatedNotebookSummary(book);
  assert.match(
    generated,
    /Question[\s\S]*Evidence[\s\S]*Second question[\s\S]*Second finding/,
  );
  assert.match(generated, /Limitations remain uncertain/);
  assert.match(generated, /https:\/\/example.com\/paper/);
  assert.doesNotMatch(
    generated,
    /Old result|Extra detail|Preserved manual summary/,
  );
  assert.equal(book.summary.text, "Preserved manual summary");
  book.findings[1].contentMarkdown = "Updated finding.";
  assert.match(generatedNotebookSummary(book), /Updated finding/);
  book.findings.pop();
  assert.doesNotMatch(generatedNotebookSummary(book), /Second question/);
  assert.equal(generatedNotebookSummary({ findings: [] }), "");
});

test("extractive summary retains decimal values and strips citation syntax before sentence extraction", () => {
  const text = generatedNotebookSummary({
    findings: [
      {
        question: "Data",
        contentMarkdown:
          "[2](<https://example.com/2.0>)# Data\n\nMean is 2.75 and range is 1.25–3.50. Compare 0.05 with 0.15. Third sentence.",
        result: { summary: "Old", sources: [] },
      },
    ],
  });
  assert.match(
    text,
    /Mean is 2.75 and range is 1.25–3.50. Compare 0.05 with 0.15./,
  );
  assert.doesNotMatch(text, /https|2#|Third sentence/);
});
