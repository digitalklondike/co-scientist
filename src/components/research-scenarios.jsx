import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  ChartColumn,
  ChartScatter,
  ClipboardList,
  CopyCheck,
  Dna,
  Fingerprint,
  FlaskConical,
  GitCompareArrows,
  Lightbulb,
  ListOrdered,
  MessageSquare,
  Microscope,
  Network,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
  ScanSearch,
  Waypoints,
  X,
} from "lucide-react";
import { SCENARIOS, SCENARIO_TOPICS } from "../research-intent.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const artwork = {
  ideas: Lightbulb,
  papers: BookOpen,
  calculate: Calculator,
  compare: GitCompareArrows,
  chart: ChartColumn,
  target: Dna,
  summary: FileText,
  gaps: ScanSearch,
  endpoints: Ruler,
  methods: Microscope,
  prioritize: ListOrdered,
  "test-hypotheses": FlaskConical,
  "data-quality": ShieldCheck,
  distributions: ChartScatter,
  correlations: Network,
  mechanisms: Waypoints,
  "target-evidence": Fingerprint,
  controls: SlidersHorizontal,
  "experiment-plan": ClipboardList,
  replication: CopyCheck,
};

const topicTones = {
  evidence: { icon: "bg-sky-100 text-primary", marker: "bg-primary/70" },
  hypotheses: {
    icon: "bg-violet-100 text-violet-700",
    marker: "bg-violet-700/70",
  },
  data: {
    icon: "bg-emerald-100 text-emerald-700",
    marker: "bg-emerald-700/70",
  },
  targets: { icon: "bg-rose-100 text-rose-700", marker: "bg-rose-700/70" },
  planning: { icon: "bg-amber-100 text-amber-700", marker: "bg-amber-700/70" },
};

function ScenarioCard({ scenario, onChoose, preview = false }) {
  const Icon = artwork[scenario.icon];
  const tone = topicTones[scenario.topic].icon;
  const content = (
    <>
      <span className="flex w-full items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tone,
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {scenario.title}
        </span>
      </span>
      <span className="scenario-card-outcome text-base leading-relaxed text-muted-foreground">
        {scenario.outcome}
      </span>
      <span className="mt-auto flex w-full items-center justify-between text-xs font-medium leading-4 text-primary">
        Try this
        <ArrowRight aria-hidden="true" className="size-4" />
      </span>
    </>
  );
  const className = cn(
    "scenario-card group flex h-(--scenario-card-height) w-full flex-col items-start justify-start gap-(--scenario-card-gap) whitespace-normal rounded-xl border border-transparent bg-secondary/60 p-(--scenario-card-padding) text-left font-normal shadow-none",
  );
  if (preview)
    return (
      <div
        aria-hidden="true"
        inert
        data-scenario-card={scenario.id}
        className={className}
      >
        {content}
      </div>
    );
  return (
    <Button
      variant="outline"
      aria-label={`${scenario.title}. ${scenario.outcome}`}
      data-scenario-card={scenario.id}
      className={cn(
        className,
        "transition-colors duration-150 hover:bg-accent active:bg-primary/20 motion-reduce:transition-none",
      )}
      onClick={() => onChoose(scenario)}
    >
      {content}
    </Button>
  );
}

export function ScenarioCards({ onChoose, onBrowse }) {
  return (
    <section
      aria-label="Research scenarios preview"
      className="mt-8 flex flex-col gap-3 lg:[@media(max-height:899px)]:mt-5 lg:[@media(max-height:899px)]:gap-2"
    >
      <div className="space-y-1 text-center">
        <h2 className="text-base font-semibold">What would you like to do?</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Choose a starting point, then make it about your research.
        </p>
      </div>
      <div className="relative">
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:[@media(max-height:899px)]:gap-2"
          data-scenario-preview=""
        >
          {SCENARIOS.slice(0, 6).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onChoose={onChoose}
            />
          ))}
          <div
            className="relative grid grid-cols-1 gap-3 overflow-hidden sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3 lg:[@media(max-height:899px)]:gap-2"
            data-scenario-fade=""
          >
            {SCENARIOS.slice(6, 9).map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} preview />
            ))}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/5 via-background/65 to-background to-85%"
            />
          </div>
        </div>
        <div className="relative -mt-4 flex shrink-0 justify-center">
          <Button variant="secondary" onClick={onBrowse}>
            Browse all scenarios
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ScenarioCatalog({
  onChoose,
  recentResearch,
  onContinue,
  onOpen,
}) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const matching = SCENARIOS.filter(
    (scenario) =>
      (topic === "all" || scenario.topic === topic) &&
      `${scenario.title} ${scenario.outcome}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <section
      aria-label="Scenario catalog"
      className="mx-auto w-full max-w-4xl space-y-7 pt-4 pb-6 sm:pt-6"
    >
      <div className="space-y-3">
        <h1 className="text-[32px] leading-10 font-semibold tracking-tight">
          Research scenarios
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Find a starting point for your next question. Choose a scenario, add
          your topic, then press Ask when you’re ready.
        </p>
      </div>
      <ContinueResearch
        record={recentResearch}
        onContinue={onContinue}
        onOpen={onOpen}
      />
      <div className="flex items-center gap-3">
        <SearchInput
          aria-label="Search scenarios"
          placeholder="Search scenarios"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
          clearLabel="Clear scenario search"
          className="flex-1"
        />
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger
            aria-label="Scenario topic"
            className="w-36 shrink-0 text-base data-[size=default]:h-11 sm:w-64"
          >
            <SelectValue className="min-w-0 truncate" />
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            <SelectItem value="all" className="text-base">
              All topics
            </SelectItem>
            {SCENARIO_TOPICS.map((item) => (
              <SelectItem key={item.id} value={item.id} className="text-base">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    topicTones[item.id].marker,
                  )}
                />
                <span className="min-w-0 truncate">{item.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <p role="status" className="text-xs text-muted-foreground">
          {matching.length} {matching.length === 1 ? "scenario" : "scenarios"}
        </p>
        {matching.length ? (
          <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:[@media(max-height:899px)]:gap-2">
            {matching.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onChoose={onChoose}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 rounded-xl bg-secondary/60 px-6 py-10 text-center">
            <h2 className="text-2xl font-semibold">No matching scenarios</h2>
            <p className="text-base text-muted-foreground">
              Try a different search or show all scenarios.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setTopic("all");
              }}
            >
              Show all scenarios
            </Button>
          </div>
        )}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {SCENARIOS.length} example prompts. Prepared demo answers are available
        for selected scenarios; CSV means, ranges and bar charts use real local
        calculations. Scenarios fill your question; the request determines the
        workflow.
      </p>
    </section>
  );
}

export function ContinueResearch({ record, onContinue, onOpen }) {
  if (!record) return null;
  const isData = record.kind === "data";
  return (
    <Accordion type="single" collapsible className="rounded-xl bg-secondary/60">
      <AccordionItem value="previous-answer">
        <AccordionTrigger className="items-center px-4 py-3 hover:no-underline">
          <span className="flex min-w-0 items-center gap-3">
            <BookOpen
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            <span className="min-w-0 space-y-1">
              <span className="block text-base font-semibold">
                Use a previous answer
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {record.question}
              </span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 px-4 pb-4">
          <p className="text-base leading-relaxed text-muted-foreground">
            {isData
              ? "Start a new question with this answer’s CSV attached. Review its column means and ranges."
              : "Start a new question with this answer attached. Summarize its findings or find passages about its limitations."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="bg-background"
              onClick={() =>
                onContinue(
                  record,
                  isData
                    ? "Summarise the numeric columns in my CSV with means and ranges."
                    : "Summarize the findings in this research.",
                )
              }
            >
              <FileText />
              {isData ? "Review this CSV" : "Summarize this answer"}
            </Button>
            {!isData && (
              <Button
                variant="secondary"
                className="bg-background"
                onClick={() =>
                  onContinue(
                    record,
                    "Find passages about limitations and evidence gaps in this research.",
                  )
                }
              >
                <ScanSearch />
                Review its limitations
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Uses saved content only. You can remove the attached answer.
            </p>
            <Button variant="ghost" onClick={() => onOpen(record)}>
              Open answer <ArrowUpRight />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function ResearchContextChip({ context, onRemove, onOpen }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-background px-3 py-2">
      <BookOpen
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-primary"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs text-muted-foreground">Using previous research</p>
        <p className="text-xs leading-relaxed">{context.question}</p>
      </div>
      {onOpen && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Open context research"
          onClick={onOpen}
        >
          <ArrowUpRight />
        </Button>
      )}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Remove research context"
          onClick={onRemove}
        >
          <X />
        </Button>
      )}
    </div>
  );
}

export function ScenarioDraftHint({ scenario, onExample, onDismiss }) {
  return (
    <div
      id="scenario-draft-hint"
      className="space-y-2 rounded-xl bg-secondary/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary">{scenario.title}</p>
          <p className="text-base leading-relaxed">{scenario.hint}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss starting point hint"
          onClick={onDismiss}
        >
          <X />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {Number.isInteger(scenario.example) && (
          <Button
            type="button"
            variant="secondary"
            className="bg-background"
            size="sm"
            onClick={onExample}
          >
            Use demo example
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          {Number.isInteger(scenario.example)
            ? "Fills the question. You decide when to send."
            : "Prompt template only. This scenario has no prepared answer in this demo."}
        </p>
      </div>
    </div>
  );
}

export function IntentClarification({ onChoose }) {
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <section
      aria-label="Clarify your research intent"
      className="space-y-4 rounded-2xl bg-secondary/60 p-5"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Avatar className="size-7">
          <AvatarImage src="/assets/co-scientist.png" alt="" />
          <AvatarFallback>CS</AvatarFallback>
        </Avatar>
        Co-Scientist
      </div>
      <div className="space-y-2">
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-semibold leading-tight tracking-tight outline-none"
        >
          Which direction do you have in mind?
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Look for explanations in published research, or explore new hypotheses
          to test?
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="bg-background"
          onClick={() => onChoose("literature")}
        >
          <BookOpen />
          Find published evidence
        </Button>
        <Button
          variant="secondary"
          className="bg-background"
          onClick={() => onChoose("hypotheses")}
        >
          <MessageSquare />
          Explore new hypotheses
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        This local preview uses prepared cardiac reprogramming content.
      </p>
    </section>
  );
}
