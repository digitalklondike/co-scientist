import test from "node:test";
import assert from "node:assert/strict";
import { researchContext, answerWithContext } from "../src/research-context.js";
import { answer, parseCSV, SAMPLE } from "../src/data.js";

test("a continuation uses the selected answer and its sources, including edited content", () => {
  const record = {
    id: "a",
    question: "Study alpha",
    contentMarkdown:
      "# Study alpha\n\nAn edited observation about alpha.\n\nThe limitation is a small sample.",
    result: {
      summary: "Outdated",
      sources: [{ title: "Alpha paper", url: "https://example.org/alpha" }],
    },
  };
  const context = researchContext(record);
  record.contentMarkdown = "Replaced after selecting the answer";
  record.result.sources[0].title = "Replaced source";
  const result = answerWithContext({
    kind: "literature",
    question: "Summarize the findings.",
    context,
  });
  assert.match(result.summary, /edited observation about alpha/);
  assert.match(result.summary, /small sample/);
  assert.doesNotMatch(result.summary, /Outdated|Replaced|cardiac/);
  assert.equal(result.report, undefined);
  assert.equal(result.sources[0].title, "Alpha paper");
});

test("unmatched context questions do not fall back to a prepared scientific answer", () => {
  const context = researchContext({
    id: "b",
    question: "Study beta",
    result: { summary: "Beta cells were counted.", sources: [] },
  });
  const result = answerWithContext({
    kind: "literature",
    question: "Explain zebrafish locomotion",
    context,
  });
  assert.match(result.summary, /couldn’t find a passage/);
  assert.deepEqual(result.sources, []);
  assert.equal(result.report, undefined);
});

test("continuing CSV research calculates from a copy of the selected dataset", () => {
  const record = {
    id: "csv",
    kind: "data",
    question: "Calculate the means",
    file: { name: "sample.csv", stats: parseCSV(SAMPLE) },
  };
  record.result = answer(record);
  const context = researchContext(record);
  record.file.stats.columns[0].mean = 999;
  const result = answerWithContext({
    kind: "data",
    question: "Plot the column means",
    context,
    file: context.file,
  });
  assert.equal(result.stats.columns[0].mean, 12.98);
  assert.equal(result.visualization, true);
  assert.equal(result.filename, "sample.csv");
});

test("new evidence-gap and endpoint examples surface the relevant prepared section", () => {
  const gaps = answer({
    kind: "literature",
    question: "Review the evidence gaps in cardiac reprogramming",
  });
  const endpoints = answer({
    kind: "literature",
    question: "Compare the measured endpoints in cardiac reprogramming",
  });
  assert.match(gaps.summary, /reproducible/);
  assert.match(endpoints.summary, /functional maturation/);
  assert.notEqual(gaps.summary, endpoints.summary);
});
