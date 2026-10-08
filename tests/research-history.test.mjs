import test from "node:test";
import assert from "node:assert/strict";
import { researchHistory, archiveResearchIds, restoreResearchIds, withResearchPresets } from "../src/research-history.js";

const record = (id, question, title = "Prepared answer") => ({ id, question, result: { title, sources: [{ title: "Original source" }] } });

test("two presets reuse real prepared answers, preserve user records and never duplicate or resurrect", () => {
  const existing = [record("own", "My own research")];
  const seeded = withResearchPresets(existing);
  assert.equal(seeded.length, 3);
  assert.equal(seeded[0], existing[0]);
  assert.equal(existing.length, 1);
  const presets = seeded.filter((r) => r.isPreset);
  assert.deepEqual(presets.map((r) => r.kind), ["literature", "hypotheses"]);
  for (const preset of presets) {
    assert.ok(preset.result.summary.length > 0);
    assert.equal(preset.result.sources.length, 3);
  }
  assert.equal(withResearchPresets(seeded), seeded);
  const archivedIds = presets.map((r) => r.id);
  assert.deepEqual(researchHistory(withResearchPresets(seeded), archivedIds).all.map((r) => r.id), ["own"]);
});

test("history expansion retains the five distinct recent rows and every remaining record", () => {
  const records = [record("a1", "A?"), record("a2", "A?"), ...["B", "C", "D", "E", "F"].map((q) => record(q, q))];
  const history = researchHistory(records, [], "", "a2");
  assert.deepEqual(history.recent.map((r) => r.id), ["a2", "B", "C", "D", "E"]);
  assert.deepEqual(history.more.map((r) => r.id), ["a1", "F"]);
  assert.equal(new Set([...history.recent, ...history.more].map((r) => r.id)).size, records.length);
});

test("archiving hides records from navigation and search without changing original research", () => {
  const records = [record("demo", "Sample question"), record("new", "My question"), record("follow-up", "Notebook question", "Notebook follow-up")];
  const snapshot = structuredClone(records);
  const archive = archiveResearchIds(["older"], ["demo", "demo"]);
  assert.deepEqual(archive, ["older", "demo"]);
  assert.deepEqual(researchHistory(records, archive).all.map((r) => r.id), ["new"]);
  assert.equal(researchHistory(records, archive, "sample").matching.length, 0);
  assert.deepEqual(records, snapshot);
});

test("Undo restores only its own batch, retaining later archives and new research", () => {
  let archive = archiveResearchIds([], ["demo"]);
  archive = archiveResearchIds(archive, ["later"]);
  archive = restoreResearchIds(archive, ["demo"]);
  assert.deepEqual(archive, ["later"]);
  const records = [record("fresh", "A new question"), record("later", "Later question"), record("demo", "Original question")];
  assert.deepEqual(researchHistory(records, archive).all.map((r) => r.id), ["fresh", "demo"]);
});
