import test from "node:test";
import assert from "node:assert/strict";
import { changeNotebook } from "../src/notebook-flows.js";
const seed = [
  {
    id: "b",
    title: "Book",
    findings: [
      {
        id: "f",
        question: "Evidence",
        contentMarkdown: "# Evidence\n\nOriginal",
        result: { summary: "Original", sources: [] },
        comments: [{ id: "c", text: "Question", author: "You", replies: [] }],
      },
    ],
  },
];
test("version restoration preserves citations and discussions and can itself be undone", () => {
  let b = changeNotebook(seed, "b", {
    type: "block-edit",
    findingId: "f",
    text: "# Evidence\n\nEdited",
  });
  assert.equal(
    b[0].findings[0].versions[0].text,
    seed[0].findings[0].contentMarkdown,
  );
  b = changeNotebook(b, "b", {
    type: "block-restore",
    findingId: "f",
    versionId: b[0].findings[0].versions[0].id,
  });
  assert.equal(
    b[0].findings[0].contentMarkdown,
    seed[0].findings[0].contentMarkdown,
  );
  assert.equal(b[0].findings[0].comments[0].id, "c");
  assert.match(b[0].findings[0].versions.at(-1).text, /Edited/);
});
test("research picker rejects duplicates and saves a separate timestamped copy", () => {
  const record = {
    id: "r",
    question: "Research",
    result: { summary: "Finding", sources: [] },
  };
  const b = changeNotebook(seed, "b", {
    type: "research-add",
    record,
    now: "2026-10-07T10:00:00Z",
  });
  assert.equal(b[0].findings[1].savedAt, "2026-10-07T10:00:00Z");
  assert.equal(record.savedAt, undefined);
  assert.throws(
    () => changeNotebook(b, "b", { type: "research-add", record }),
    /already/,
  );
});
test("structured sources validate URLs; tasks and conclusion respect read-only roles", () => {
  assert.throws(
    () =>
      changeNotebook(seed, "b", {
        type: "source-add",
        findingId: "f",
        title: "Study",
        url: "javascript:alert(1)",
      }),
    /URL/,
  );
  let b = changeNotebook(seed, "b", {
    type: "source-add",
    findingId: "f",
    title: "Study",
    url: "https://example.com/paper",
    id: "s",
  });
  assert.equal(b[0].findings[0].result.sources[0].manual, true);
  assert.throws(
    () =>
      changeNotebook(b, "b", {
        type: "source-add",
        findingId: "f",
        title: "Duplicate",
        url: "https://example.com/paper",
      }),
    /already/,
  );
  b = changeNotebook(b, "b", {
    type: "task-add",
    text: "Validate endpoint",
    id: "t",
  });
  b = changeNotebook(b, "b", { type: "task-toggle", taskId: "t" });
  assert.equal(b[0].nextSteps[0].done, true);
  b = changeNotebook(b, "b", { type: "conclusion", findingId: "f" });
  assert.equal(b[0].conclusionFindingId, "f");
  assert.throws(
    () =>
      changeNotebook([{ ...b[0], accessRole: "viewer" }], "b", {
        type: "task-add",
        text: "No",
      }),
    /read-only/,
  );
});
test("search locates sources and replies and identifies the exact discussion", async () => {
  const { notebookMatches } = await import("../src/notebook-search.js");
  const book = {
    ...seed[0],
    findings: [
      {
        ...seed[0].findings[0],
        comments: [
          {
            id: "thread",
            text: "Check",
            replies: [{ text: "Validate endpoint" }],
          },
        ],
      },
    ],
  };
  const hits = notebookMatches(book, "endpoint");
  assert.equal(hits[0].type, "Reply");
  assert.equal(hits[0].commentId, "thread");
  assert.match(hits[0].snippet, /endpoint/);
});
test("history is bounded and snapshots retain next steps and chosen evidence", async () => {
  const { snapshot, importSnapshot, exportNotebook } =
    await import("../src/notebook-flows.js");
  let b = seed;
  for (let i = 0; i < 8; i++)
    b = changeNotebook(b, "b", {
      type: "block-edit",
      findingId: "f",
      text: `# Evidence\n\nRevision ${i}`,
    });
  assert.equal(b[0].findings[0].versions.length, 5);
  b = changeNotebook(b, "b", {
    type: "source-add",
    findingId: "f",
    title: "Reference",
    url: "https://example.com/paper",
  });
  b = changeNotebook(b, "b", {
    type: "key-source",
    url: "https://example.com/paper",
  });
  b = changeNotebook(b, "b", {
    type: "task-add",
    text: "Follow up",
    id: "step",
  });
  const imported = importSnapshot(snapshot(b[0], "editor"), "copy");
  assert.deepEqual(imported.nextSteps, b[0].nextSteps);
  assert.deepEqual(imported.keySourceUrls, b[0].keySourceUrls);
  assert.match(exportNotebook(b[0], "md").body, /Follow up/);
  assert.match(exportNotebook(b[0], "csv").body, /Reference/);
  const corrupt = JSON.parse(snapshot(b[0], "editor"));
  corrupt.book.nextSteps = { text: "Invalid" };
  assert.throws(
    () => importSnapshot(JSON.stringify(corrupt)),
    /Invalid next steps/,
  );
});
