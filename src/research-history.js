import { EXAMPLES } from "./data.js";
import { answerWithContext } from "./research-context.js";

const PRESETS = [
  { id: "preset-cardiac-comparison-v1", question: EXAMPLES.literature[1][0], kind: "literature" },
  { id: "preset-cardiac-hypotheses-v1", question: EXAMPLES.hypotheses[0][0], kind: "hypotheses" },
];

export function withResearchPresets(records) {
  const existingIds = new Set(records.map((record) => record.id));
  const missing = PRESETS.filter((preset) => !existingIds.has(preset.id));
  if (!missing.length) return records;
  return [...records, ...missing.map((preset) => ({
    ...preset,
    isPreset: true,
    file: null,
    context: null,
    result: answerWithContext(preset),
  }))];
}

export function researchHistory(records, archivedIds = [], search = "", activeId) {
  const archived = new Set(archivedIds);
  const all = records.filter(
    (record) => record.result.title !== "Notebook follow-up" && !archived.has(record.id),
  );
  const query = search.trim().toLowerCase();
  const matching = all.filter((record) => record.question.toLowerCase().includes(query));
  const topics = new Map();
  for (const record of matching) {
    const topic = record.question.trim().toLowerCase().replace(/[?.]$/, "");
    if (!topics.has(topic) || record.id === activeId) topics.set(topic, record);
  }
  const recent = [...topics.values()].slice(0, 5);
  const recentIds = new Set(recent.map((record) => record.id));
  return { all, matching, recent, more: matching.filter((record) => !recentIds.has(record.id)) };
}

export function archiveResearchIds(archivedIds, ids) {
  return [...new Set([...archivedIds, ...ids])];
}

export function restoreResearchIds(archivedIds, ids) {
  const restored = new Set(ids);
  return archivedIds.filter((id) => !restored.has(id));
}
