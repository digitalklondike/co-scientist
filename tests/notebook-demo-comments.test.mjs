import test from "node:test";
import assert from "node:assert/strict";
import { addDemoParticipants } from "../src/notebook-demo-comments.js";
test("demo participants preserve user comments, are scoped and only seed once", () => {
  const original = {
    id: "530b19c4-ae39-4f6d-8ca6-0d8e2097d94e",
    note: "Existing observation",
  };
  const unrelated = {
    id: "other",
    findings: [{ id: "other-block", comments: [] }],
  };
  const books = [{ id: "sample", findings: [original] }, unrelated];
  const next = addDemoParticipants(books, "2026-10-07T15:00:00Z");
  assert.equal(next[0].findings[0].comments[0].text, "Existing observation");
  assert.equal(next[0].findings[0].comments.length, 3);
  assert.equal(next[0].findings[0].comments[1].replies.length, 1);
  assert.equal(next[1], unrelated);
  assert.equal(original.comments, undefined);
  const deleted = [
    { ...next[0], findings: [{ ...next[0].findings[0], comments: [] }] },
  ];
  assert.deepEqual(addDemoParticipants(deleted), deleted);
  const viewer = [{ ...books[0], accessRole: "viewer" }];
  assert.deepEqual(addDemoParticipants(viewer), viewer);
});
