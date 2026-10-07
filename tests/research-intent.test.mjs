import test from "node:test";
import assert from "node:assert/strict";
import {
  researchIntent,
  hasPromptPlaceholder,
  supportsPreparedTopic,
  SCENARIOS,
} from "../src/research-intent.js";
import { EXAMPLES, answer } from "../src/data.js";

test("an example and a manually typed paraphrase select the same workflow", () => {
  assert.equal(researchIntent(EXAMPLES.hypotheses[0][0]), "hypotheses");
  assert.equal(
    researchIntent("Propose new hypotheses about cardiac maturation"),
    "hypotheses",
  );
  assert.equal(
    researchIntent("Create a target dossier for GATA4"),
    "literature",
  );
  assert.equal(researchIntent("Find evidence about GATA4"), "literature");
  const profile = answer({
    question: "Create a target profile for GATA4",
    kind: "literature",
  });
  const dossier = answer({
    question: "Create a target dossier for GATA4",
    kind: "literature",
  });
  assert.equal(profile.scenario, dossier.scenario);
  assert.equal(dossier.scenario, "target");
});

test("ambiguous mechanism questions ask for intent, explicit evidence requests do not", () => {
  assert.equal(
    researchIntent("What might improve cardiac reprogramming?"),
    "clarify",
  );
  assert.equal(
    researchIntent("What may be the mechanisms of action to inhibit X?"),
    "clarify",
  );
  assert.equal(
    researchIntent(
      "What might improve cardiac reprogramming based on published sources?",
    ),
    "literature",
  );
  assert.equal(
    researchIntent("What are the hypotheses reported in the literature?"),
    "literature",
  );
  assert.equal(researchIntent("What is a hypothesis?"), "literature");
});

test("real data requests bypass scientific intent clarification", () => {
  assert.equal(
    researchIntent("What might explain these values?", true),
    "data",
  );
  assert.equal(researchIntent("Plot the mean of SUN1 in my CSV"), "data");
});

test("unfinished templates and unsupported demo topics are identifiable without sending", () => {
  for (const scenario of SCENARIOS) {
    assert.equal(hasPromptPlaceholder(scenario.prompt), true);
    if (Number.isInteger(scenario.example)) {
      assert.equal(
        hasPromptPlaceholder(EXAMPLES[scenario.kind][scenario.example][0]),
        false,
      );
    }
  }
  assert.equal(
    supportsPreparedTopic("Generate hypotheses about pancreatic cancer"),
    false,
  );
  assert.equal(
    supportsPreparedTopic("Generate hypotheses about cardiac reprogramming"),
    true,
  );
  assert.equal(
    hasPromptPlaceholder("What does [Ca2+] mean in cardiac cells?"),
    false,
  );
});
