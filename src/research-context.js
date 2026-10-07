import { answer, markdown } from "./data.js";
import { notebookReply } from "./notebook.js";

// Keep the exact content selected by the user, even if its original is later edited.
export function researchContext(record) {
  return {
    id: record.id,
    question: record.question,
    contentMarkdown: markdown(record),
    sources: (record.result.sources || []).map((source) => ({ ...source })),
    file:
      record.kind === "data" && record.file
        ? structuredClone(record.file)
        : null,
  };
}

export function answerWithContext(task) {
  if (!task.context || task.kind === "data") return answer(task);
  const finding = {
    question: task.context.question,
    contentMarkdown: task.context.contentMarkdown,
    result: { summary: "", sources: task.context.sources },
  };
  return {
    title: "From your previous research",
    scenario: "context",
    summary: notebookReply(finding, task.question),
    sources: task.context.sources,
  };
}
