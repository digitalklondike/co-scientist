import test from "node:test";
import assert from "node:assert/strict";
import {
  notebookSections,
  versionDifference,
  templateFindings,
  blockHash,
  parseBlockHash,
} from "../src/notebook-knowledge.js";
import {
  changeNotebook,
  snapshot,
  importSnapshot,
} from "../src/notebook-flows.js";
const seed = [
  {
    id: "book",
    title: "A",
    findings: [
      {
        id: "f",
        question: "Question",
        result: { summary: "Original", sources: [] },
        comments: [
          { id: "c", text: "Check the method", author: "You", replies: [] },
        ],
      },
    ],
  },
  { id: "other", title: "B", findings: [] },
];
test("navigation anchors distinguish repeated headings and ignore headings inside code", () => {
  const sections = notebookSections(
    "## Overview\ntext\n```md\n## Fake\n```\n## Overview",
    "f",
  );
  assert.equal(sections.length, 2);
  assert.notEqual(sections[0].id, sections[1].id);
  assert.deepEqual(
    sections.map((s) => s.line),
    [1, 6],
  );
  assert.deepEqual(parseBlockHash(blockHash("book", "f", sections[1].id)), {
    bookId: "book",
    findingId: "f",
    sectionId: sections[1].id,
  });
  assert.equal(parseBlockHash("#invalid"), null);
  assert.equal(parseBlockHash("#notebook=%"), null);
});
test("snapshot import rejects malformed historical sources and context fields", () => {
  const book = structuredClone(seed[0]);
  book.findings[0].versions = [{ id: "v", text: "Previous", sources: {} }];
  assert.throws(() => importSnapshot(snapshot(book, "editor")), /history/);
  book.findings[0].versions[0].sources = [null];
  assert.throws(() => importSnapshot(snapshot(book, "editor")), /history/);
  book.findings[0].versions[0].sources = [];
  book.nextSteps = [{ id: "t", text: "Next", done: false, findingId: {} }];
  assert.throws(() => importSnapshot(snapshot(book, "editor")), /next steps/);
});
test("version comparison reconstructs both documents and preserves unchanged lines", () => {
  const diff = versionDifference(
    "Title\nOld paragraph\nEnd",
    "Title\nNew paragraph\nEnd",
  );
  assert.equal(
    diff
      .filter((d) => d.type !== "add")
      .map((d) => d.text)
      .join("\n"),
    "Title\nOld paragraph\nEnd",
  );
  assert.equal(
    diff
      .filter((d) => d.type !== "remove")
      .map((d) => d.text)
      .join("\n"),
    "Title\nNew paragraph\nEnd",
  );
  assert.ok(diff.some((d) => d.type === "equal"));
});
test("templates contain editable structure without invented sources and have distinct IDs", () => {
  const findings = templateFindings("literature");
  assert.ok(findings.length >= 3);
  assert.equal(new Set(findings.map((f) => f.id)).size, findings.length);
  assert.ok(
    findings.every((f) => f.origin === "personal" && !f.result.sources.length),
  );
  assert.deepEqual(templateFindings("blank"), []);
});
test("context tasks validate targets and preserve context alongside legacy links", () => {
  const next = changeNotebook(seed, "book", {
    type: "task-add",
    text: "Inspect method",
    findingId: "f",
    commentId: "c",
    id: "t",
  });
  assert.equal(next[0].nextSteps[0].findingId, "f");
  assert.equal(next[0].nextSteps[0].commentId, "c");
  assert.throws(
    () =>
      changeNotebook(seed, "book", {
        type: "task-add",
        text: "x",
        findingId: "missing",
      }),
    /context/,
  );
  const legacy = { ...next[0], linkedNotebookIds: ["other"] };
  const imported = importSnapshot(snapshot(legacy, "editor"), "import");
  assert.equal(imported.nextSteps[0].commentId, "c");
  assert.deepEqual(imported.linkedNotebookIds, ["other"]);
});
