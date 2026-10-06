import test from "node:test";
import assert from "node:assert/strict";
import { notebookReply, updateFinding, removeNotebookFinding, restoreNotebookFinding } from "../src/notebook.js";
import { markdown } from "../src/data.js";

const finding = {
  id: "f1",
  question: "Cardiac evidence",
  note: "Keep this note",
  result: {
    summary: "Mouse fibroblasts use GMT.",
    sources: [{ title: "Study", url: "https://example.org/study" }],
  },
};

test("editing updates only the notebook copy, retaining citations and notes", () => {
  const original = [
    { id: "b1", findings: [finding] },
    { id: "b2", findings: [finding] },
  ];
  const changed = updateFinding(original, "b1", "f1", {
    contentMarkdown: "## My version\n\nHuman cells need different factors.",
  });
  assert.equal(
    markdown(changed[0].findings[0]),
    "## My version\n\nHuman cells need different factors.",
  );
  assert.equal(changed[0].findings[0].note, finding.note);
  assert.deepEqual(
    changed[0].findings[0].result.sources,
    finding.result.sources,
  );
  assert.equal(original[0].findings[0].contentMarkdown, undefined);
  assert.equal(changed[1], original[1]);
});

test("conversation retrieves edited content rather than removed original sections", () => {
  const edited = {
    ...finding,
    contentMarkdown:
      "# Edited answer\n\nHuman fibroblasts need additional factors.",
  };
  assert.match(
    notebookReply(edited, "Which human factors?"),
    /Human fibroblasts/,
  );
  assert.doesNotMatch(notebookReply(edited, "Summarize this answer"), /GMT/);
});

test("unrelated questions do not fabricate a research answer", () => {
  assert.match(
    notebookReply(finding, "Tell me about quantum gravity"),
    /couldn’t find a passage/,
  );
});

test("removal and undo retain content, thread and later edits without touching other notebooks", () => {
  const reply = { ...finding, id: "reply", question: "Which factors?", sourceFindingId: "f1", sourceMessageId: "m1", note: "My next step", result: { ...finding.result, title: "Notebook follow-up", summary: "GMT." } };
  const parent = { ...finding, conversation: [{ id: "m1", question: reply.question, answer: "GMT.", saved: true }] };
  const original = [{ id: "b1", findings: [parent, reply] }, { id: "b2", findings: [reply] }];
  const removed = removeNotebookFinding(original, "b1", "reply");
  assert.equal(removed[0].findings.length, 1);
  assert.equal(removed[0].findings[0].conversation[0].saved, false);
  assert.equal(removed[1], original[1]);
  assert.equal(original[0].findings[0].conversation[0].saved, true);
  const later = updateFinding(removed, "b1", "f1", { note: "Edited after removal" });
  const restored = restoreNotebookFinding(later, "b1", reply, 1);
  assert.equal(restored[0].findings[0].note, "Edited after removal");
  assert.equal(restored[0].findings[0].conversation[0].saved, true);
  assert.deepEqual(restored[0].findings[1], reply);
  assert.deepEqual(restoreNotebookFinding(restored, "b1", reply, 1), restored);
});

test("last-answer removal leaves an empty notebook and legacy saved replies can be restored", () => {
  const reply = { ...finding, id: "reply", question: "Which factors?", result: { ...finding.result, title: "Notebook follow-up", summary: "GMT." } };
  const parent = { ...finding, conversation: [{ id: "m1", question: reply.question, answer: "GMT.", saved: true }] };
  const original = [{ id: "b1", findings: [parent, reply] }];
  const removed = removeNotebookFinding(original, "b1", "reply");
  assert.equal(removed[0].findings[0].conversation[0].saved, false);
  assert.equal(restoreNotebookFinding(removed, "b1", reply, 1)[0].findings[0].conversation[0].saved, true);
  assert.deepEqual(removeNotebookFinding([{ id: "b1", findings: [finding] }], "b1", "f1"), [{ id: "b1", findings: [] }]);
});
