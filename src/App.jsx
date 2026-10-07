import { AnswerSelection } from "./components/answer-selection";
import { createNotebookExcerpt } from "./notebook-excerpts";
import { NotebookTemplateSelect } from "./components/notebook-knowledge";
import { templateFindings, parseBlockHash } from "./notebook-knowledge";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  NotebookPen,
  MessageSquare,
  Plus,
  Paperclip,
  X,
  ChevronDown,
  CheckCircle2,
  Circle,
  Database,
  FileText,
  ChartColumn,
  Info,
  CircleHelp,
  Download,
  Pencil,
  Copy,
  CircleStop,
} from "lucide-react";
import "@fontsource-variable/inter";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { WorkspaceTabs } from "@/components/workspace-tabs";
import { NotebookMarkdown, NotebookConversation } from "@/components/notebook-content";
import { NotebookWorkspace, NotebookLibrary } from "@/components/notebook-workspace";
import { NotebookNote, NotebookNotesProvider } from "@/components/notebook-notes";
import { useNoteNavigation } from "@/components/note-navigation-context";
import { changeNotebook, persistNotebooks, exportNotebook, downloadNotebook, commentsFor } from "./notebook-flows.js";
import { updateFinding, removeNotebookFinding, restoreNotebookFinding } from "./notebook.js";
import { Toaster, NotificationToast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { toast as sonnerToast } from "sonner";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScenarioCards, ScenarioCatalog, ResearchContextChip, ScenarioDraftHint, IntentClarification } from "@/components/research-scenarios";
import { researchIntent, hasPromptPlaceholder, supportsPreparedTopic } from "./research-intent.js";
import { researchContext, answerWithContext } from "./research-context.js";
import {
  EXAMPLES,
  SAMPLE,
  PAPERS,
  CARDIAC_REPORT,
  IDEAS,
  parseCSV,
  fmt,
  download,
  markdown,
} from "./data";

function useSaved(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cosci-" + key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (key === "books-v2") return; // Notebook writes are transactional, never replay an older render.
    try {
      localStorage.setItem("cosci-" + key, JSON.stringify(value));
    } catch {}
  }, [value, key]);
  return [value, setValue];
}
function Modal({ title, subtitle, onClose, children }) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-32px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-left pr-6">
          <DialogTitle className="text-2xl leading-snug">{title}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {subtitle}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
function Identity({ label }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
      <Avatar className="size-7">
        <AvatarImage src="/assets/co-scientist.png" alt="" />
        <AvatarFallback>Co</AvatarFallback>
      </Avatar>
      <span>Co-Scientist</span>
      {label && <Badge variant="secondary">{label}</Badge>}
    </div>
  );
}
function QuestionBubble({ children }) {
  return (
    <div className="ml-auto max-w-[90%] space-y-2 rounded-xl bg-muted px-5 py-4 sm:max-w-[85%]">
      <p className="text-xs text-muted-foreground">Your question</p>
      <p className="break-words text-base leading-relaxed">{children}</p>
    </div>
  );
}
function Source({ Icon, title, detail, status }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-1 size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium">{title}</p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {detail}
        </p>
        {status && <Badge variant="outline">{status}</Badge>}
      </div>
    </div>
  );
}
function Notice({ children }) {
  return (
    <Alert role="note">
      <Info />
      <AlertDescription className="text-base leading-relaxed">
        {children}
      </AlertDescription>
    </Alert>
  );
}

function MeanChart({ columns }) {
  const low = Math.min(0, ...columns.map((c) => c.mean));
  const high = Math.max(0, ...columns.map((c) => c.mean));
  const span = high - low || 1;
  const zero = (-low / span) * 100;
  return (
    <figure
      className="my-5 space-y-3"
      aria-label="Bar chart of mean numeric column values"
    >
      <figcaption className="text-base font-medium">
        Mean expression · local calculation
      </figcaption>
      <div className="space-y-3">
        {columns.map((c) => {
          const end = ((c.mean - low) / span) * 100;
          return (
            <div
              key={c.name}
              className="grid grid-cols-[4rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-xs"
            >
              <span className="truncate" title={c.name}>
                {c.name}
              </span>
              <div
                className="relative h-6 rounded bg-secondary"
                aria-hidden="true"
              >
                <span
                  className="absolute inset-y-0 w-px bg-muted-foreground/50"
                  style={{ left: `${zero}%` }}
                />
                <span
                  className="absolute inset-y-1 rounded-sm bg-primary"
                  style={{
                    left: `${Math.min(zero, end)}%`,
                    width: `${Math.abs(end - zero)}%`,
                  }}
                />
              </div>
              <span className="text-right tabular-nums">{fmt(c.mean)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Calculated from non-empty numeric values. Sample expression values are
        illustrative.
      </p>
    </figure>
  );
}

function ResearchGuide({
  children,
  open,
  step,
  saved,
  isData,
  sourcesOpen,
  completed = false,
  pending = false,
  onFinish,
}) {
  const id = `research-guide-${step}`;
  if (!open) return children;
  const done = saved || completed;
  const surfaceClass = done ? "bg-emerald-700/5" : "bg-primary/5";
  const headerClass = done ? "bg-emerald-700/10" : "bg-primary/10";
  const instruction = saved
    ? "Saved. Open Notebook to return to this finding."
    : step === 1
      ? isData
        ? "Choose what to calculate, then send your question."
        : "Write your question, then press Ask."
      : step === 2
        ? isData
          ? "Open the file details to see how this was calculated."
          : sourcesOpen
            ? "Explore the papers behind this answer. You can open each original study."
            : "See which papers this answer is based on. Open Sources used below."
        : "Save the answer and sources to revisit and add notes. ";
  const hint = (
    <div
      className="flex flex-wrap items-start gap-x-3 gap-y-2"
      aria-live="polite"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            done
              ? "bg-emerald-700 text-white"
              : "bg-primary text-primary-foreground",
          )}
        >
          {done ? <CheckCircle2 className="size-4" /> : step}
        </span>
        <div className="min-w-0 space-y-1">
          <p className={cn("text-xs font-medium", done ? "text-emerald-700" : "text-primary")}>
            {saved
              ? "3 of 3 · Save to Notebook · Complete"
              : step === 2
                ? `2 of 3 · Explore sources${completed ? " · Complete" : ""}`
                : step === 3
                  ? "3 of 3 · Save to Notebook"
                  : "First research · 1 of 3"}
          </p>
          <p
            id={`${id}-description`}
            className="text-base leading-relaxed text-muted-foreground"
          >
            {completed ? "Sources explored. Open a paper to review the original study." : instruction}
          </p>
        </div>
      </div>
      {!completed && !pending && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-my-1 shrink-0 text-muted-foreground"
          aria-label={saved ? "Finish onboarding" : "Skip onboarding"}
          onClick={onFinish}
        >
          {saved ? "Finish" : "Skip"}
        </Button>
      )}
    </div>
  );
  const target = React.cloneElement(children, {
    className: cn(
      children.props.className,
      step === 1
        ? cn("border-0 shadow-none", surfaceClass)
        : step === 2
          ? cn("rounded-2xl border-0 px-4 sm:px-5 shadow-none", surfaceClass)
          : "",
    ),
    ...(step === 1 || step === 2
      ? {
          children: (
            <>
              <div
                className={cn(
                  "p-4 sm:p-5",
                  headerClass,
                  step === 1 ? "-mx-4 -mt-4" : "-mx-4 sm:-mx-5 rounded-t-2xl",
                )}
              >
                {hint}
              </div>
              {children.props.children}
            </>
          ),
        }
      : {}),
  });
  return (
    <div
      id={id}
      role="region"
      aria-label="Research onboarding"
      aria-describedby={`${id}-description`}
      className="w-full basis-full scroll-mt-24"
    >
      {step === 3 ? (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border-0",
            "border-0 shadow-none", surfaceClass,
          )}
        >
          <div className={cn("p-4 sm:p-5", headerClass)}>
            {hint}
          </div>
          <div className="p-4 sm:p-5">{children}</div>
        </div>
      ) : (
        target
      )}
    </div>
  );
}

function OnboardingHint({
  title,
  children,
  onSkip,
  id,
  step,
  action,
  actionLabel,
  skipLabel = "Skip guide",
  welcome = false,
  complete = false,
}) {
  return (
    <section id={id} aria-label="First research guidance" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="font-normal">
          {complete ? <CheckCircle2 className="size-3" /> : null}
          {complete ? "Finding saved" : "Guided research"}
        </Badge>
        {step && !complete && (
          <span className="text-xs text-muted-foreground">
            {step}/3 ·{" "}
            {step === 1 ? "Question" : step === 2 ? "Evidence" : "Notebook"}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto -mr-2 text-muted-foreground"
          onClick={onSkip}
        >
          {skipLabel}
        </Button>
      </div>
      <h2
        className={
          welcome
            ? "text-2xl font-semibold tracking-tight"
            : "text-base font-semibold"
        }
      >
        {title}
      </h2>
      <p className="max-w-[68ch] text-base leading-relaxed text-muted-foreground">
        {children}
      </p>
      {action && (
        <Button onClick={action}>
          {actionLabel}
          <ArrowRight />
        </Button>
      )}
    </section>
  );
}

export function App() {
  return <NotebookNotesProvider><ResearchWorkspace /></NotebookNotesProvider>;
}

function ResearchWorkspace() {
  const requestNoteNavigation = useNoteNavigation();
  const [desktopNotebook, setDesktopNotebook] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktopNotebook(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [view, setView] = useState("home"),
    [records, setRecords] = useSaved("records", []),
    [books, setBooks] = useSaved("books-v2", []),
    [guide, setGuide] = useState(true);
  const booksRef = useRef(books);
  booksRef.current = books;
  useEffect(() => {
    const sync = event => {
      if (event.key !== "cosci-books-v2" || !event.newValue) return;
      try { const next = JSON.parse(localStorage.getItem("cosci-books-v2")); if (!Array.isArray(next)) return; booksRef.current = next; setBooks(next); } catch {}
    };
    window.addEventListener("storage",sync);
    return () => window.removeEventListener("storage",sync);
  }, []);
  const [guidedId, setGuidedId] = useState(null),
    [reviewedId, setReviewedId] = useState(null),
    [noteHint, setNoteHint] = useState(false),
    [showAllHistory, setShowAllHistory] = useState(false);
  const [chatFindingId, setChatFindingId] = useState(null);
  const [excerptFinding, setExcerptFinding] = useState(null);
  const [newBookFolderId, setNewBookFolderId] = useState(null);
  const [notebookDetail, setNotebookDetail] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [draftContext, setDraftContext] = useState(null);
  const [clarifyIntent, setClarifyIntent] = useState(false);
  const [draftNotice, setDraftNotice] = useState("");
  const [question, setQuestion] = useState(""),
    [category, setCategory] = useState("literature"),
    [file, setFile] = useState(null),
    [active, setActive] = useState(null),
    [bookId, setBookId] = useState(null),
    [search, setSearch] = useState(""),
    [bookSearch, setBookSearch] = useState(""),
    [task, setTask] = useState(null),
    [readyId, setReadyId] = useState(null),
    [stage, setStage] = useState(0),
    [researchProgress, setResearchProgress] = useState(0),
    [plan, setPlan] = useState(null),
    [modal, setModal] = useState(null),
    [name, setName] = useState(""),
    [target, setTarget] = useState("new"),
    [side, setSide] = useState(false),
    [opened, setOpened] = useState({});
  const input = useRef(),
    workspaceScroll = useRef(),
    upload = useRef(),
    viewRef = useRef(view);
  viewRef.current = view;
  const current = records.find((r) => r.id === active),
    book = books.find((b) => b.id === bookId) || books[0],
    saved =
      current && books.some((b) => b.findings.some((f) => f.id === current.id));
  const workspaceTab = view === "notebook" ? "notebook" : view === "scenarios" ? "scenarios" : "chat";
  const recentResearch = records.find((record) => !record.context && !record.result.needsFile && !record.result.unrelated && record.result.title !== "Notebook follow-up");
  const chatFinding = book?.findings.find((finding) => finding.id === chatFindingId) || book?.findings.at(-1);
  useEffect(() => { setDiscussionOpen(false); }, [view, notebookDetail, book?.id]);
  const matchingHistory = records.filter((r) =>
    r.result.title !== "Notebook follow-up" && r.question.toLowerCase().includes(search.toLowerCase()),
  );
  const recentTopics = new Map();
  for (const record of matchingHistory) {
    const topic = record.question.trim().toLowerCase().replace(/[?.]$/, "");
    if (!recentTopics.has(topic) || record.id === active) recentTopics.set(topic, record);
  }
  const visibleHistory = showAllHistory || search
    ? matchingHistory
    : [...recentTopics.values()].slice(0, 5);
  const firstQuestion =
    guide &&
    (!guidedId || (current?.id === guidedId && current.result.needsFile));
  const showScenarioPreview = !firstQuestion && !selectedScenario && !draftContext && !file && !clarifyIntent && !draftNotice;
  const fitHome = view === "home" && showScenarioPreview;
  const guidedAnswer =
    guide && current?.id === guidedId && !current?.result.needsFile;
  const guideStep = reviewedId === current?.id || saved ? 3 : 2;
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const resetKey = "cosci-notebook-empty-demo-v2";
    try {
      if (localStorage.getItem(resetKey)) return;
      localStorage.setItem(resetKey, "1");
      // An empty demo starts empty; never erase a previously saved collection.
    } catch { /* Keep loaded notebooks when device storage is unavailable. */ }
  }, []);
  useEffect(() => {
    workspaceScroll.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);
  function restartGuidance() {
    setGuide(true);
    setGuidedId(null);
    setNoteHint(false);
    setReviewedId(null);
    setModal(null);
    fresh();
  }
  function finishGuidance() {
    setGuide(false);
    setNoteHint(false);
  }
  const notify = (text, action, type = "success", description) => {
    const notificationKey = crypto.randomUUID();
    sonnerToast.custom((id) => <NotificationToast key={notificationKey} text={text} description={description} type={type} action={action} duration={action ? null : 5500} onDismiss={() => sonnerToast.dismiss(id)} />, {
      id: "research-notification",
      duration: Infinity,
    });
  };
  const applyNav = (v) => {
    if (v === "notebook") setNotebookDetail(false);
    viewRef.current = v;
    setView(v);
    setModal((previous) => ["save", "saved"].includes(previous) ? null : previous);
    setSide(false);
    setOpened({});
    workspaceScroll.current?.scrollTo({ top: 0, behavior: "instant" });
  };
  const nav = (v) => requestNoteNavigation(() => applyNav(v));
  const fresh = () => requestNoteNavigation(() => {
    applyNav("home");
    setActive(null);
    if (guide) setGuidedId(null);
    setQuestion("");
    setFile(null);
    setSelectedScenario(null);
    setDraftContext(null);
    setClarifyIntent(false);
    setDraftNotice("");
    setTimeout(() => input.current?.focus(), 50);
  });
  useEffect(() => {
    if (!task) return;
    setStage(0);
    setResearchProgress(0);
    const startedAt = performance.now();
    const progressTimer = setInterval(() => {
      setResearchProgress(
        Math.min(95, ((performance.now() - startedAt) / 4100) * 100),
      );
    }, 80);
    const timers = [
      setTimeout(() => setStage(1), 1100),
      setTimeout(() => setStage(2), 2600),
      setTimeout(() => {
        setResearchProgress(100);
        const r = { ...task, result: answerWithContext(task) };
        setRecords((p) => [r, ...p.filter((x) => x.id !== r.id)]);
        setActive(r.id);
        setTask(null);
        if (viewRef.current === "loading") {
          setReadyId(null);
          nav("answer");
        } else {
          setReadyId(r.id);
          notify("Your research is ready.", {
            label: "View answer",
            run: () => {
              setActive(r.id);
              setReadyId(null);
              nav("answer");
            },
          });
        }
      }, 4100),
    ];
    return () => {
      clearInterval(progressTimer);
      timers.forEach(clearTimeout);
    };
  }, [task]);
  useEffect(() => {
    const f = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        fresh();
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  const sample = () => {
    setFile({ name: "gene-expression.csv", stats: parseCSV(SAMPLE) });
  };
  async function attach(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) {
      notify("Choose a CSV file.", undefined, "error", "Local data analysis needs a file with the .csv extension.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      notify("CSV file is too large.", undefined, "error", "Choose a CSV smaller than 2 MB.");
      return;
    }
    try {
      const stats = parseCSV(await f.text());
      setFile({ name: f.name, stats });
      setCategory("data");
      notify(`${f.name} is ready.`, undefined, "success", `${stats.rows} rows available for local analysis.`);
    } catch (err) {
      notify("Couldn’t read this CSV.", undefined, "error", err.message);
    }
  }
  function useExample(example, i, kind = category) {
    setSelectedScenario(null);
    setDraftContext(null);
    setClarifyIntent(false);
    setDraftNotice("");
    setCategory(kind);
    setQuestion(example[0]);
    if (kind === "data" && (i === 0 || i === 2)) sample();
    else setFile(null);
    input.current?.focus();
  }
  function chooseScenario(scenario, demo = false) {
    nav("home");
    setActive(null);
    setDraftContext(null);
    if (demo && Number.isInteger(scenario.example)) useExample(EXAMPLES[scenario.kind][scenario.example], scenario.example, scenario.kind);
    else {
      setQuestion(scenario.prompt);
      if (scenario.kind !== "data") setFile(null);
    }
    setSelectedScenario(scenario);
    setClarifyIntent(false);
    setDraftNotice("");
    requestAnimationFrame(() => {
      const field = input.current;
      if (!field) return;
      field.focus();
      const start = field.value.indexOf("[");
      const end = field.value.indexOf("]", start);
      if (start >= 0 && end > start) field.setSelectionRange(start, end + 1);
      field.scrollIntoView({ block: "center", behavior: reducedMotion ? "instant" : "smooth" });
    });
  }
  function continueResearch(record, prompt) {
    const context = researchContext(record);
    nav("home");
    setActive(null);
    setDraftContext(context);
    setQuestion(prompt);
    setFile(context.file);
    setSelectedScenario(null);
    setClarifyIntent(false);
    setDraftNotice("");
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.scrollIntoView({ block: "center", behavior: reducedMotion ? "instant" : "smooth" });
    });
  }
  function useDemoExample() {
    const intent = researchIntent(question);
    const kind = intent === "clarify" ? "literature" : intent;
    const index = kind === "literature" ? 1 : 0;
    useExample(EXAMPLES[kind][index], index, kind);
  }
  function launch(t) {
    if (guide) setGuidedId(t.id);
    setReadyId(null);
    setTask(t);
    setActive(t.id);
    nav("loading");
  }
  function submit(e, intentChoice) {
    e?.preventDefault();
    if (!question.trim()) {
      input.current?.focus();
      return;
    }
    if (task) {
      notify(
        "A task is already running. Open it or cancel before starting another.",
      );
      return;
    }
    if (hasPromptPlaceholder(question)) {
      setDraftNotice(selectedScenario?.example === null
        ? "Replace the text in brackets with your topic. Your question stays editable."
        : "Replace the text in brackets with your topic, or use a demo example below.");
      input.current?.focus();
      return;
    }
    if (selectedScenario?.example === null) {
      setDraftNotice("Your question is kept. This scenario is a prompt template for demonstration and has no prepared answer in this local preview.");
      return;
    }
    const kind = intentChoice || researchIntent(question, Boolean(file));
    if (kind === "clarify") {
      setClarifyIntent(true);
      setDraftNotice("");
      return;
    }
    if (draftContext && kind === "hypotheses") {
      setDraftNotice("This local preview can retrieve passages from your previous answer. New hypotheses from that context need a connected AI service.");
      return;
    }
    if (kind !== "data" && !draftContext && !supportsPreparedTopic(question)) {
      setDraftNotice("Your question is kept. This local preview can only show prepared cardiac reprogramming content. Use a demo example to try the full flow.");
      return;
    }
    setClarifyIntent(false);
    setDraftNotice("");
    const t = {
      id: crypto.randomUUID(),
      question: question.trim(),
      kind,
      file,
      context: draftContext,
    };
    if (kind === "hypotheses") {
      setPlan(t);
      nav("plan");
    } else launch(t);
  }
  function openRecord(r) {
    if (!r) return;
    requestNoteNavigation(() => {
    if (guide && !guidedId && !r.result.needsFile) setGuidedId(r.id);
    if (r.id === readyId) sonnerToast.dismiss("research-notification");
    setReadyId(null);
    setActive(r.id);
    applyNav("answer");
    });
  }
  const savingFinding = excerptFinding || current;
  function showSaveDialog(selectedFinding = null) {
    setExcerptFinding(selectedFinding);
    setName(
      current.kind === "data"
        ? "Gene expression analysis"
        : "Cardiac reprogramming",
    );
    setTarget(books[0]?.id || "new");
    setModal("save");
  }
  function openSave() {
    setExcerptFinding(null);
    const containing = books.find((b) =>
      b.findings.some((f) => f.id === current.id),
    );
    if (containing) {
      setBookId(containing.id);
      setNoteHint(guide);
      setModal("saved");
    } else showSaveDialog();
  }
  function persistFinding(destination, title) {
    const id = destination === "new" ? crypto.randomUUID() : destination;
    const existing = books.find((b) => b.id === id);
    if (existing?.findings.some((f) => f.id === savingFinding.id)) {
      setModal("saved");
      setBookId(id);
      setNoteHint(guide);
      return;
    }
    const finding = { ...savingFinding, note: "", savedAt: savingFinding.savedAt || new Date().toISOString() };
    try { commitBooks((p) =>
      destination === "new"
        ? [
            {
              id,
              title: title?.trim() || "Research notes",
              findings: [finding],
            },
            ...p,
          ]
        : p.map((b) =>
            b.id === id ? { ...b, findings: [...b.findings, finding] } : b,
          ),
    ); } catch { notify("Couldn’t save to notebook. Check device storage and retry.", undefined, "error"); return; }
    setBookId(id);
    setNoteHint(guide);
    setModal("saved");
  }
  function save(e) {
    e.preventDefault();
    persistFinding(target, name);
  }
  useEffect(()=>{const openLink=()=>{const target=parseBlockHash(location.hash);if(!target)return;const destination=booksRef.current.find(b=>b.id===target.bookId);if(!destination?.findings.some(f=>f.id===target.findingId)){notify("Linked research is unavailable on this device.",undefined,"error");return;}requestNoteNavigation(()=>{setBookId(destination.id);setChatFindingId(null);setNotebookDetail(true);setView("notebook");requestAnimationFrame(()=>requestAnimationFrame(()=>{window.dispatchEvent(new CustomEvent("notebook-open-block",{detail:{bookId:destination.id,findingId:target.findingId}}));requestAnimationFrame(()=>{window.dispatchEvent(new CustomEvent("notebook-open-block",{detail:{bookId:destination.id,findingId:target.findingId}}));const el=document.getElementById(target.sectionId||`block-${target.findingId}`)||document.getElementById(`block-${target.findingId}`);el?.scrollIntoView({block:"start",behavior:"instant"});el?.focus({preventScroll:true});});}));});};openLink();window.addEventListener("hashchange",openLink);return()=>window.removeEventListener("hashchange",openLink);},[]);
  function newBook(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = crypto.randomUUID();
    const template = new FormData(e.currentTarget).get("notebookTemplate") || "blank";
    try { commitBooks((p) => [{ id, title: name.trim(), findings: templateFindings(template), folderId:newBookFolderId }, ...p]); } catch { notify("Couldn’t create notebook. Check device storage and retry.",undefined,"error"); return; }
    setBookId(id);
    setNewBookFolderId(null);
    setModal(null);
    nav("notebook");
    setNotebookDetail(true);
  }
  function commitBooks(transform) {
    let latest = booksRef.current;
    const stored = localStorage.getItem("cosci-books-v2");
    if (stored) { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) latest = parsed; }
    const next = persistNotebooks(localStorage, transform(latest));
    booksRef.current = next;
    setBooks(next);
    return next;
  }
  function changeBook(destinationId, action) {
    const before = booksRef.current.find(b => b.id === destinationId)?.findings.find(f => f.id === action.findingId);
    const deletedIndex = before ? commentsFor(before).findIndex(c => c.id === action.commentId) : -1;
    const removedComment = deletedIndex < 0 ? null : commentsFor(before)[deletedIndex];
    const next = commitBooks(previous => changeNotebook(previous, destinationId, action));
    const replyIndex = removedComment?.replies?.findIndex(r => r.id === action.replyId) ?? -1;
    return { next, removedComment, deletedIndex, removedReply:removedComment?.replies?.[replyIndex], replyIndex };
  }
  function editFinding(id, contentMarkdown) {
    changeBook(book.id, { type:"block-edit", findingId:id, text:contentMarkdown });
    notify("Notebook answer updated.", undefined, "success", "Original research kept.");
  }
  function removeFinding(id) {
    const latestBook = booksRef.current.find(b => b.id === book.id);
    const index = latestBook.findings.findIndex((item) => item.id === id);
    if (index < 0) return;
    const removed = latestBook.findings[index];
    const destinationId = book.id;
    try { commitBooks((previous) => removeNotebookFinding(previous, destinationId, id)); } catch { notify("Couldn’t remove this block. Your saved content is still here.", undefined, "error"); return; }
    if (chatFinding?.id === id) {
      setDiscussionOpen(false);
      setChatFindingId(null);
    }
    notify("Answer removed from notebook.", {
      label: "Undo",
      run: () => { try { commitBooks((previous) => restoreNotebookFinding(previous, destinationId, removed, index)); } catch { notify("Couldn’t restore this block.", undefined, "error"); } },
    });
  }
  function renameBook(event) {
    event.preventDefault();
    if (!name.trim()) return;
    try { changeBook(book.id, { type:"rename", title:name.trim() }); } catch { notify("Couldn’t rename notebook.", undefined, "error"); return; }
    setModal(null);
    notify("Notebook renamed.");
  }
  function saveNotebookReply(message) {
    if (message.saved) return;
    if (book.accessRole && book.accessRole !== "editor") { notify("This role cannot add notebook blocks.",undefined,"error"); return; }
    setChatFindingId(chatFinding.id);
    const finding = {
      id: crypto.randomUUID(), question: message.question, kind: "literature", note: "",
      originResearchId: chatFinding.originResearchId || chatFinding.id,
      sourceFindingId: chatFinding.id, sourceMessageId: message.id,
      result: { title: "Notebook follow-up", summary: message.answer, sources: chatFinding.result.sources },
    };
    try { commitBooks((previous) => updateFinding(previous, book.id, chatFinding.id, {
      conversation: chatFinding.conversation.map((item) => item.id === message.id ? { ...item, saved: true } : item),
    }).map((item) => item.id === book.id ? { ...item, findings: [...item.findings, finding] } : item)); } catch { notify("Couldn’t save response.",undefined,"error"); return; }
    notify("Response saved to this notebook.");
  }
  function persistConversation(conversation) {
    try {
      if (book.accessRole && book.accessRole !== "editor") throw Error("This role cannot change the notebook discussion.");
      commitBooks(previous => {
        const current = previous.find(b => b.id === book.id)?.findings.find(f => f.id === chatFinding.id);
        if (!current) throw Error("Saved block no longer exists.");
        const existing = current.conversation || [];
        return updateFinding(previous, book.id, chatFinding.id, { conversation:[...existing,...conversation.filter(m => !existing.some(old => old.id === m.id))] });
      }); return true;
    } catch { notify("Couldn’t save the discussion. Your question is back in the composer.",undefined,"error"); return false; }
  }
  function exportBook() {
    downloadNotebook(book.title, exportNotebook(book, "md"));
    notify("Notebook exported as Markdown.");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown(current));
      notify("Answer and source links copied.");
    } catch {
      notify("Clipboard unavailable.", undefined, "error", "Use Export instead.");
    }
  }
  const answerDetails = current && (
    <div className="research-prose text-base leading-relaxed">
      {current.result.scenario === "comparison" && (
        <>
          <h3>Experimental context</h3>
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Study</TableHead>
                <TableHead>Experimental model</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.result.sources.map((source) => (
                <TableRow key={source.url}>
                  <TableCell>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.author}, {source.year}
                    </a>
                  </TableCell>
                  <TableCell>{source.model}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <h3>What to compare next</h3>
          <p>
            Starting cells, factor combinations, delivery methods and functional
            endpoints in each original paper.
          </p>
          <h3>Conclusion</h3>
          <p>
            This prepared comparison covers three selected studies. It does not
            establish equivalent efficacy across models.
          </p>
        </>
      )}
      {current.result.scenario === "target" && (
        <>
          <h3>Profile scope</h3>
          <Table className="text-xs">
            <TableBody>
              <TableRow>
                <TableCell>Target</TableCell>
                <TableCell>GATA4</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Research context</TableCell>
                <TableCell>Direct cardiac reprogramming</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Included evidence</TableCell>
                <TableCell>Three selected mouse and human studies</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <h3>Evidence to explore</h3>
          <p>
            Review GATA4 as part of the factor combinations discussed in the
            included papers. The literature example distinguishes GMT from the
            additional factors used across experimental settings.
          </p>
          <h3>Conclusion</h3>
          <p>
            A full target profile would require additional evidence on
            mechanism, expression, validation and safety. Those sections are
            outside this prepared example.
          </p>
        </>
      )}
      {current.result.scenario === "context" && (
        <>
          <h3>About this answer</h3>
          <p>This local preview retrieves passages from the selected research answer. It uses the content attached when you asked this question and does not search for new evidence.</p>
          <h3>Previous research</h3>
          <p>{current.context.question}</p>
        </>
      )}
      {current.result.needsFile && (
        <Button
          onClick={() => {
            sample();
            setQuestion(current.question);
            setCategory("data");
            nav("home");
          }}
        >
          Try the sample CSV
          <ArrowRight />
        </Button>
      )}
      {current.kind === "literature" && !current.result.scenario && (
        <>
          <h3>Research overview</h3>
          <p>{(current.result.report || CARDIAC_REPORT).overview}</p>
          <h3>Experimental systems at a glance</h3>
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>System & study</TableHead>
                <TableHead>Factors</TableHead>
                <TableHead>Finding & limitation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(current.result.report || CARDIAC_REPORT).studies.map((row) => (
                <TableRow key={row.study}>
                  <TableCell className="min-w-40 whitespace-normal align-top">
                    <p className="font-medium">{row.system}</p>
                    <a href={PAPERS[row.study].url} target="_blank" rel="noreferrer" onClick={() => setReviewedId(current.id)}>
                      {PAPERS[row.study].author}, {PAPERS[row.study].year}
                    </a>
                  </TableCell>
                  <TableCell className="min-w-40 whitespace-normal align-top">{row.factors}</TableCell>
                  <TableCell className="min-w-52 whitespace-normal align-top">
                    <p>{row.finding}</p>
                    <p className="text-muted-foreground">{row.limit}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(current.result.report || CARDIAC_REPORT).sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              {section.source !== undefined && <p>
                <a href={PAPERS[section.source].url} target="_blank" rel="noreferrer" onClick={() => setReviewedId(current.id)}>
                  {PAPERS[section.source].author}, {PAPERS[section.source].year} · Read original study
                </a>
              </p>}
            </section>
          ))}
        </>
      )}
      {current.kind === "data" && !current.result.needsFile && (
        <>
          <h3>Column statistics</h3>
          <Table className="text-xs tabular-nums">
            <TableHeader>
              <TableRow>
                {["Column", "Values", "Mean", "Min", "Max", "Missing"].map(
                  (h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.result.stats.columns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.count}</TableCell>
                  <TableCell>{fmt(c.mean)}</TableCell>
                  <TableCell>{fmt(c.min)}</TableCell>
                  <TableCell>{fmt(c.max)}</TableCell>
                  <TableCell>{c.missing}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p>
            Arithmetic means from non-empty numeric values. No statistical model
            or hypothesis test applied.
          </p>
        </>
      )}
      {current.kind === "hypotheses" &&
        IDEAS.map(([title, why, experiment]) => (
          <section key={title}>
            <h3>{title}</h3>
            <p>{why}</p>
            <p>
              <strong>Possible experiment:</strong> {experiment}
            </p>
          </section>
        ))}
      {current.kind === "hypotheses" && (
        <p>Illustrative ideas, not validated hypotheses.</p>
      )}
    </div>
  );
  const savePanelContent = current && (
<form onSubmit={save} className="space-y-6">
            {desktopNotebook && <div className="space-y-2"><h3 className="text-base font-semibold">{excerptFinding ? "Save selected text" : "Save to Notebook"}</h3><p className="text-base leading-relaxed text-muted-foreground">{excerptFinding ? "Keep this excerpt with links to its original research and sources." : "Choose a notebook to keep this answer, its sources and your notes together."}</p></div>}
            <div className="space-y-3">
              <Label htmlFor="save-notebook">Save to notebook</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger id="save-notebook" className="h-11 w-full border-0 bg-secondary/70 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">Create a new notebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {target === "new" && (
              <div className="space-y-3">
                <Label htmlFor="notebook-name">Notebook name</Label>
                <Input
                  id="notebook-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={90}
                />
              </div>
            )}
            <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-5">
              <FileText className="size-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-base font-medium">{savingFinding.question}</p>
                <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{savingFinding.result.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {savingFinding.result.sources.length
                    ? savingFinding.result.sources.length + " source links included"
                    : "Data summary included"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <NotebookPen />
                Save finding
              </Button>
            </div>
          </form>
  );
  const notebookPanelContent = current && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-700/10 p-4" role="status">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="text-xs text-emerald-700">Saved to notebook</p>
                  <p className="text-base font-medium">{book?.title}</p>
                </div>
              </div>
              <section className="space-y-4 rounded-2xl bg-secondary/60 p-5" aria-label="Saved finding preview">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Your research question</p>
                  <h3 className="text-base font-semibold leading-relaxed">{savingFinding.question}</h3>
                </div>
                {book?.findings.find((f) => f.id === savingFinding.id)?.contentMarkdown !== undefined ? (
                  <Accordion type="single" collapsible><AccordionItem value="edited-answer" className="border-0">
                    <AccordionTrigger className="items-center py-2 text-xs [&>svg]:translate-y-0">{excerptFinding ? "Selected text saved" : "Edited answer saved"}</AccordionTrigger>
                    <AccordionContent><NotebookMarkdown>{book.findings.find((f) => f.id === savingFinding.id).contentMarkdown}</NotebookMarkdown></AccordionContent>
                  </AccordionItem></Accordion>
                ) : <p className="text-base leading-relaxed">{savingFinding.result.summary}</p>}
                {(book?.findings.find((f) => f.id === savingFinding.id)?.contentMarkdown === undefined && book?.findings.find((f) => f.id === savingFinding.id)?.result.report) && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="saved-analysis" className="border-0">
                      <AccordionTrigger className="items-center py-2 text-xs [&>svg]:translate-y-0">Full analysis saved</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-base leading-relaxed">
                        {book.findings.find((f) => f.id === savingFinding.id).result.report.sections.map((section) => (
                          <section key={section.title} className="space-y-2">
                            <h4 className="font-semibold">{section.title}</h4>
                            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                          </section>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                {savingFinding.result.sources.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Sources kept with this answer</p>
                    <div className="flex flex-wrap gap-2">
                      {savingFinding.result.sources.map((source) => (
                        <Button key={source.url} asChild variant="secondary" size="sm" className="bg-white text-primary hover:bg-primary/15 hover:text-primary active:bg-primary/20">
                          <a href={source.url} target="_blank" rel="noreferrer"><BookOpen />{source.author}, {source.year}<ArrowUpRight /></a>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground">{excerptFinding ? "Selected answer text · Original research linked" : `Dataset: ${savingFinding.result.filename}`}</p>}
              </section>
              <NotebookNote key={`${book.id}:${savingFinding.id}`} bookId={book.id} finding={book.findings.find((f) => f.id === savingFinding.id)} onSave={changeBook} onNotify={notify} role={book.accessRole || "editor"} />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => requestNoteNavigation(() => { setModal(null); finishGuidance(); applyNav("notebook"); setNotebookDetail(true); })}><NotebookPen />Open full notebook<ArrowRight /></Button>
                <Button variant="secondary" onClick={() => requestNoteNavigation(() => setModal(null))}>Back to research</Button>
              </div>
            </div>
  );
  return (
    <SidebarProvider openMobile={side} onOpenMobileChange={setSide} className="h-svh min-h-0 overflow-hidden bg-[#f3f5f8]">
      <a
        href="#content"
        className="sr-only fixed z-50 rounded-md bg-background px-4 py-3 text-xs focus:not-sr-only focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Sidebar aria-label="Research navigation" className="border-r-0 text-[length:var(--text-navigation)] leading-5">
        <SidebarHeader className="gap-5 px-4 pt-5 pb-3">
          <div className="flex items-center gap-3 px-1">
            <Avatar className="size-8">
              <AvatarImage src="/assets/co-scientist.png" alt="" />
              <AvatarFallback className="text-[length:var(--text-navigation)] leading-5">Co</AvatarFallback>
            </Avatar>
            <div className="text-[length:var(--text-navigation)] leading-5">
              <p className="font-semibold">Bayer AI Co-Scientist</p>
              <p className="text-muted-foreground">Research workspace</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto md:hidden"
              aria-label="Close navigation"
              onClick={() => setSide(false)}
            >
              <X />
            </Button>
          </div>
          <Button
            variant="outline"
            className="h-10 w-full justify-start rounded-md border-0 bg-primary/10 text-[length:var(--text-navigation)] leading-5 text-primary shadow-none hover:bg-primary/15"
            onClick={fresh}
          >
            <Plus />
            New research
          </Button>
          <SearchInput
            aria-label="Search research history"
            placeholder="Search research"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            clearLabel="Clear research search"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-3">
            <SidebarGroupLabel>Recent research</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {task && (
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          className="h-10 rounded-sm hover:bg-primary/10 data-[active=true]:bg-white data-[active=true]:text-foreground data-[active=true]:hover:bg-white"
                          isActive={view === "loading"}
                          onClick={() => nav("loading")}
                          data-testid="pending-chat"
                          aria-label={`Research in progress: ${task.question}`}
                        >
                          <Spinner className="size-4 shrink-0" />
                          <span className="truncate">
                            {task.question.replace(/[?.]$/, "")}
                          </span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="max-w-72 text-[length:var(--text-navigation)] leading-5 leading-relaxed"
                      >
                        {task.question} · Research in progress
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                )}
                {visibleHistory
                  .map((r) => (
                    <SidebarMenuItem key={r.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            className="h-10 rounded-sm hover:bg-primary/10 data-[active=true]:bg-white data-[active=true]:text-foreground data-[active=true]:hover:bg-white"
                            data-testid="history-chat"
                            isActive={r.id === active && view === "answer"}
                            onClick={() => openRecord(r)}
                            aria-label={r.question}
                          >
                            <span className="truncate">
                              {r.question.replace(/[?.]$/, "")}
                            </span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-72 text-[length:var(--text-navigation)] leading-5 leading-relaxed"
                        >
                          {r.question}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                {!search && matchingHistory.length > 5 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="text-muted-foreground"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      {showAllHistory ? "Show less" : "Show all research"}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
              {!records.length && (
                <p className="px-2 py-4 text-[length:var(--text-navigation)] leading-5 leading-relaxed text-muted-foreground">
                  Your research will appear here.
                </p>
              )}
              {search && !matchingHistory.length && (
                <p className="px-2 py-4 text-[length:var(--text-navigation)] leading-5 text-muted-foreground">
                  No matching research.
                </p>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
          {readyId && !task && view !== "answer" && (
            <SidebarGroup>
              <Button
                variant="secondary"
                className="text-[length:var(--text-navigation)] leading-5"
                onClick={() =>
                  openRecord(records.find((r) => r.id === readyId))
                }
              >
                <CheckCircle2 />
                View ready answer
              </Button>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 px-1 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/15 text-[length:var(--text-navigation)] leading-5 font-semibold text-primary">
                R
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-[length:var(--text-navigation)] leading-5">
              <p className="font-medium">Researcher</p>
              <p className="text-muted-foreground">Saved on this device</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="m-3 h-[calc(100svh-1.5rem)] min-h-0 min-w-0 flex-1 overflow-hidden rounded-3xl border-0 bg-background shadow-none max-md:m-0 max-md:h-svh max-md:rounded-none">
        <header className="relative z-20 flex h-28 shrink-0 items-start gap-3 bg-background px-4 pt-2 sm:h-16 sm:items-center sm:px-6 sm:pt-0">
          <SidebarTrigger
            className="size-10 rounded-full text-foreground hover:bg-primary/15 hover:text-primary active:bg-primary/20 [&_svg]:size-4"
            aria-label="Toggle navigation"
          />
          <WorkspaceTabs
            className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-auto"
            value={workspaceTab}
            onValueChange={(value) =>
              nav(
                value === "notebook" ? "notebook" : value === "scenarios" ? "scenarios" : current ? "answer" : "home",
              )
            }
            aria-label="Main navigation"
            notebookCount={books.length}
          />
          <Badge variant="outline" className="ml-auto hidden sm:inline-flex">
            Local demo
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="ml-auto size-10 rounded-full text-foreground hover:bg-primary/15 hover:text-primary active:bg-primary/20 sm:ml-0 [&_svg]:size-4"
                variant="ghost"
                size="icon"
                aria-label="Help and capabilities"
                onClick={() => setModal("help")}
              >
                <CircleHelp />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help and capabilities</TooltipContent>
          </Tooltip>
        </header>
        <div
          id="content"
          ref={workspaceScroll}
          className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8", fitHome && "lg:py-3", view === "notebook" && books.length > 0 && "xl:overflow-hidden xl:px-0 xl:py-0")}
          tabIndex={-1}
        >
          <div
            role="tabpanel"
            id={`workspace-${workspaceTab}-panel`}
            aria-labelledby={`workspace-${workspaceTab}-tab`}
            tabIndex={0}
            className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring", fitHome && "lg:flex lg:min-h-full lg:flex-col", view === "notebook" && books.length > 0 && "xl:h-full")}
          >
            <Input
              hidden
              className="hidden"
              ref={upload}
              type="file"
              accept=".csv,text/csv"
              aria-label="Upload CSV file"
              onChange={attach}
            />
            {view === "scenarios" && <ScenarioCatalog onChoose={chooseScenario} recentResearch={recentResearch} onContinue={continueResearch} onOpen={openRecord} />}
            {view === "home" && (
              <div className={cn("mx-auto w-full max-w-3xl space-y-7 pt-4 sm:pt-6", fitHome && "flex max-w-4xl flex-col gap-4 space-y-0 lg:my-auto lg:pt-0 lg:[@media(max-height:899px)]:gap-3")}>
                <div className={cn("space-y-3", fitHome && "shrink-0 space-y-2")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Identity />
                    {!guide && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={restartGuidance}
                      >
                        Start onboarding
                      </Button>
                    )}
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Ask a scientific question
                  </h1>
                  <p className={cn("text-base leading-relaxed text-muted-foreground", fitHome && "lg:[@media(max-height:899px)]:hidden")}>
                    Find evidence in the literature, explore your data, or
                    develop hypotheses.
                  </p>
                </div>
                <ResearchGuide
                  open={firstQuestion && !task && !modal}
                  step={1}
                  isData={Boolean(file)}
                  onFinish={finishGuidance}
                >
                  <form
                    className={cn("space-y-3 overflow-hidden rounded-2xl border-0 bg-secondary/70 p-4 outline-1 outline-transparent -outline-offset-1 transition-[outline-color] hover:outline-primary/50 focus-within:outline-primary", fitHome && "shrink-0 space-y-2 lg:[@media(max-height:899px)]:p-3")}
                    onSubmit={submit}
                  >
                    <Label htmlFor="question">Your question</Label>
                    {draftContext && <ResearchContextChip context={draftContext} onRemove={() => setDraftContext(null)} onOpen={records.some((record) => record.id === draftContext.id) ? () => openRecord(records.find((record) => record.id === draftContext.id)) : undefined} />}
                    <Textarea
                      id="question"
                      ref={input}
                      className={cn("min-h-28 resize-none rounded-none border-0 bg-transparent p-0 text-base shadow-none hover:outline-none focus-visible:ring-0", fitHome && "h-16 min-h-16 lg:h-6 lg:min-h-6 lg:[@media(min-height:900px)]:h-16 lg:[@media(min-height:900px)]:min-h-16")}
                      aria-describedby={[firstQuestion && !task ? "research-guide-1-description" : "", selectedScenario && !clarifyIntent ? "scenario-draft-hint" : "", draftNotice ? "question-notice" : ""].filter(Boolean).join(" ") || undefined}
                      placeholder={
                        file
                          ? "Which columns should we explore?"
                          : firstQuestion
                            ? "What are you studying, and what would you like to find out?"
                            : "Ask your research question…"
                      }
                      value={question}
                      maxLength={3000}
                      onChange={(e) => {
                        setQuestion(e.target.value);
                        setClarifyIntent(false);
                        setDraftNotice("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                          submit(e);
                      }}
                    />
                    {file && (
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                        <FileText className="size-4" />
                        <span className="min-w-0 truncate">{file.name}</span>
                        <span className="ml-auto whitespace-nowrap text-muted-foreground">
                          {file.stats.rows} rows
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Remove attached file"
                          onClick={() => setFile(null)}
                        >
                          <X />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                      <Button
                        variant="ghost"
                        type="button"
                        className="text-muted-foreground hover:bg-primary/15 hover:text-primary active:bg-primary/20"
                        onClick={() => upload.current.click()}
                      >
                        <Paperclip />
                        Attach CSV
                      </Button>
                      {firstQuestion && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/15 hover:text-primary active:bg-primary/20"
                          onClick={() => {
                            if (file) {
                              setQuestion(EXAMPLES.data[1][0]);
                              input.current?.focus();
                            } else
                              useExample(
                                EXAMPLES.literature[1],
                                1,
                                "literature",
                              );
                          }}
                        >
                          Use an example
                        </Button>
                      )}
                      <Button
                        className="ml-auto"
                        type="submit"
                        disabled={!question.trim() || !!task}
                      >
                        Ask
                        <ArrowUp />
                      </Button>
                    </div>
                  </form>
                </ResearchGuide>
                {draftNotice && (
                  <div className="space-y-3">
                    <p id="question-notice" role="status" className="text-base leading-relaxed text-primary">{draftNotice}</p>
                    {!selectedScenario && <Button type="button" variant="secondary" onClick={useDemoExample}>Use demo example</Button>}
                  </div>
                )}
                {selectedScenario && !clarifyIntent && <ScenarioDraftHint scenario={selectedScenario} onExample={() => chooseScenario(selectedScenario, true)} onDismiss={() => setSelectedScenario(null)} />}
                {clarifyIntent && <IntentClarification onChoose={(kind) => submit(undefined, kind)} />}
                {showScenarioPreview && (
                    <ScenarioCards onChoose={chooseScenario} onBrowse={() => nav("scenarios")} />
                )}
              </div>
            )}
            {view === "plan" && plan && (
              <div className="mx-auto max-w-3xl space-y-7">
                <Button
                  variant="ghost"
                  className="-ml-3"
                  onClick={() => nav("home")}
                >
                  <ArrowLeft />
                  Back to question
                </Button>
                <QuestionBubble>{plan.question}</QuestionBubble>
                <Card>
                  <CardHeader className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      Hypothesis exploration
                    </Badge>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Proposed research plan
                    </h1>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      Check the scope before we start.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ol className="space-y-5">
                      {[
                        [
                          "Review the evidence",
                          "Use the cardiac reprogramming papers included in this demo.",
                        ],
                        [
                          "Identify useful gaps",
                          "Focus on cell origin, functional maturation and factor delivery.",
                        ],
                        [
                          "Suggest three testable ideas",
                          "Each includes a rationale and a possible experiment.",
                        ],
                      ].map(([title, detail], i) => (
                        <li key={title} className="flex gap-3">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 shrink-0 justify-center rounded-full p-0"
                          >
                            {i + 1}
                          </Badge>
                          <div className="space-y-1">
                            <h2 className="text-base font-medium">{title}</h2>
                            <p className="text-base leading-relaxed text-muted-foreground">
                              {detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <Notice>
                      This demo uses prepared hypotheses to illustrate the
                      workflow.
                    </Notice>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => nav("home")}>
                      <Pencil />
                      Edit question
                    </Button>
                    <Button onClick={() => launch(plan)}>
                      Confirm and start
                      <ArrowRight />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            {view === "loading" && task && (
              <div className="mx-auto max-w-3xl space-y-8">
                <QuestionBubble>{task.question}</QuestionBubble>
                <Card aria-live="polite" className="gap-6 rounded-3xl border-0 bg-secondary/70 py-6 shadow-none sm:py-8">
                  <CardHeader className="space-y-3 px-5 sm:px-8">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10" aria-hidden="true">
                        <Spinner className="size-6 text-primary" />
                      </span>
                      <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                        {task.context && task.kind !== "data" ? "Saved content only" : task.kind === "data"
                          ? "Local data analysis"
                          : "Demo research"}
                      </Badge>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {
                        [
                          "Understanding your question",
                          task.kind === "data"
                            ? "Checking your dataset"
                            : task.context ? "Finding passages in your previous answer"
                            : "Reviewing the evidence",
                          "Preparing a concise answer",
                        ][stage]
                      }
                    </h1>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      You can continue working while your answer is prepared.
                      We’ll let you know when it’s ready.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5 px-5 sm:px-8">
                    <Progress
                      value={researchProgress}
                      aria-label="Research progress"
                      className="h-1.5 bg-primary/10"
                    />
                    <div className="space-y-1">
                      {[
                        "Understand the question",
                        task.kind === "data"
                          ? "Calculate descriptive statistics"
                          : task.context ? "Retrieve passages from the selected answer"
                          : "Review relevant sources",
                        "Prepare findings and next steps",
                      ].map((label, i) => (
                        <div
                          key={label}
                          className={
                            "flex min-h-8 items-center gap-3 text-xs " +
                            (i > stage ? "text-muted-foreground" : "")
                          }
                        >
                          <span className="flex size-4 shrink-0 items-center justify-center">
                            {i < stage ? (
                              <CheckCircle2 className="size-4 text-emerald-700" />
                            ) : i === stage ? (
                              <Spinner className="size-4 text-primary" />
                            ) : (
                              <Circle className="size-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">{label}</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "ml-auto rounded-full bg-primary/10 text-primary",
                              i !== stage && "invisible",
                            )}
                            aria-hidden={i !== stage}
                          >
                            In progress
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 px-5 sm:px-8">
                    <Button variant="secondary" className="h-11 rounded-md bg-white px-5 has-[>svg]:px-5" onClick={() => nav("home")}>
                      Continue working
                      <ArrowRight />
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-11 rounded-md bg-destructive/10 px-5 text-destructive shadow-none hover:bg-destructive/20 has-[>svg]:px-5"
                      onClick={() => {
                        setTask(null);
                        if (guide) setGuidedId(null);
                        nav("home");
                        notify(
                          "Research cancelled. Your question is still here.",
                        );
                      }}
                    >
                      <CircleStop />
                      Cancel research
                    </Button>
                  </CardFooter>
                </Card>
                <p className="text-xs text-muted-foreground">
                  {task.kind === "data"
                    ? "CSV calculations run locally in your browser."
                    : task.context ? "Local retrieval from the selected answer · no new evidence generated"
                    : "Example workflow · no live AI request"}
                </p>
              </div>
            )}
            {view === "answer" && current && (
              <div className="mx-auto max-w-3xl space-y-8">
                {current.context && <ResearchContextChip context={current.context} onOpen={records.some((record) => record.id === current.context.id) ? () => openRecord(records.find((record) => record.id === current.context.id)) : undefined} />}
                <QuestionBubble>{current.question}</QuestionBubble>
                <AnswerSelection key={current.id} onSave={text => { showSaveDialog(createNotebookExcerpt(current, text, crypto.randomUUID(), new Date().toISOString())); }}>
                <article
                  aria-label="Co-Scientist answer"
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Identity
                      label={
                        current.result.scenario === "context" ? "Saved content only" : current.kind === "data"
                          ? "Local calculation"
                          : "Example answer"
                      }
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Copy answer and sources"
                          onClick={copy}
                        >
                          <Copy />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy answer and sources</TooltipContent>
                    </Tooltip>
                  </div>
                  {current.result.unrelated && (
                    <Notice>
                      Your question is saved. This prototype displays an
                      illustrative cardiac reprogramming review; it has not
                      generated an answer to your question.
                    </Notice>
                  )}
                  <div className="research-prose text-base leading-relaxed">
                    <h2>
                      {current.result.needsFile
                        ? current.result.title
                        : current.kind === "literature" &&
                            !current.result.scenario
                          ? "Direct answer"
                          : current.result.title}
                    </h2>
                    {current.result.scenario === "context" ? <NotebookMarkdown>{current.result.summary}</NotebookMarkdown> : <p>{current.result.summary}</p>}
                    {current.kind === "literature" && !current.result.scenario && !current.result.needsFile && (
                      <p>
                        Cardiac marker expression alone does not establish a mature functional phenotype. Compare experimental conditions and endpoints in the original papers.
                      </p>
                    )}
                  </div>
                  {current.result.visualization && !current.result.needsFile && (
                    <MeanChart columns={current.result.stats.columns} />
                  )}
                  {!current.result.needsFile && (
                    <div className="space-y-6">
                      <ResearchGuide
                        open={guidedAnswer && (!modal || ((modal === "save" || modal === "saved") && desktopNotebook))}
                        completed={guideStep === 3}
                        step={2}
                        isData={current.kind === "data"}
                        sourcesOpen={opened.sources}
                        onFinish={finishGuidance}
                      >
                        <Accordion
                          type="single"
                          collapsible
                          className={cn("rounded-2xl px-5", !guidedAnswer && "bg-secondary/70")}
                          value={opened.sources ? "sources" : ""}
                          onValueChange={(value) => {
                            if (value === "sources") setReviewedId(current.id);
                            setOpened((p) => ({
                              ...p,
                              sources: value === "sources",
                            }));
                          }}
                        >
                          <AccordionItem value="sources" className="border-0">
                            <AccordionTrigger
                              id="trigger-sources"
                              className={cn(
                                "scroll-mt-72 rounded-md px-0 py-4 text-xs",
                                guidedAnswer &&
                                  guideStep === 2 &&
                                  "text-primary",
                              )}
                            >
                              <span className="flex flex-wrap items-center gap-3">
                                <BookOpen className="size-4" />
                                Sources used
                                <span className="font-normal text-muted-foreground">
                                  {current.kind === "data"
                                    ? "1 file · local calculation"
                                    : `${current.result.sources.length} papers`}
                                </span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent
                              aria-labelledby="trigger-sources"
                              className="text-base"
                            >
                              {current.kind === "data" ? (
                                <p className="leading-relaxed">
                                  <strong>{current.result.filename}</strong>
                                  <br />
                                  {current.result.stats.rows} rows. Missing
                                  values excluded independently for each numeric
                                  column.
                                </p>
                              ) : (
                                <ul className="divide-y divide-border">
                                  {current.result.sources.map((source) => (
                                    <li
                                      key={source.url}
                                      className="py-1 first:pt-0 last:pb-0"
                                    >
                                      <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setReviewedId(current.id)}
                                        className="group flex items-start gap-3 rounded-md p-4 transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-primary"
                                      >
                                        <div className="flex-1 space-y-2">
                                          <p className="text-base leading-relaxed text-primary group-hover:underline">
                                            {source.title}
                                          </p>
                                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                              {source.author} · {source.journal} ·{" "}
                                              {source.year}
                                            </span>
                                            <Badge variant="outline">
                                              {source.model}
                                            </Badge>
                                          </div>
                                        </div>
                                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </ResearchGuide>
                    <Accordion
                      type="single"
                      collapsible
                      key={current.id}
                      value={opened.analysis ? "full-answer" : ""}
                      onValueChange={(value) => setOpened((previous) => ({ ...previous, analysis: value === "full-answer" }))}
                    >
                      <AccordionItem value="full-answer" className="border-0">
                          <motion.div
                            initial={false}
                            animate={{ height: opened.analysis ? 0 : 176, opacity: opened.analysis ? 0 : 1 }}
                            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                                  className="relative overflow-hidden" aria-hidden="true" inert>
                            <div className="pointer-events-none">{answerDetails}</div>
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/70 to-transparent" />
                          </motion.div>
                        <AccordionTrigger className={cn(
                          buttonVariants({ variant: "outline" }),
                          "group relative z-10 mx-auto mt-2 h-11 !w-auto flex-none items-center justify-center gap-3 rounded-md border-0 bg-secondary px-6 py-0 text-xs font-semibold shadow-none hover:bg-primary/10 hover:no-underline [&>svg]:translate-y-0 [&>svg]:text-foreground",
                        )}>
                          <span className="flex items-center gap-2">
                            <span className="group-data-[state=open]:hidden">Read full analysis</span>
                            <span className="hidden group-data-[state=open]:inline">Collapse analysis</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-6" style={{ animationDuration: reducedMotion ? "0ms" : "500ms", animationTimingFunction: "cubic-bezier(.4,0,.2,1)" }}>{answerDetails}</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                      <footer className="flex flex-wrap items-center gap-2">
                        <ResearchGuide
                          open={guidedAnswer && (!modal || ((modal === "save" || modal === "saved") && desktopNotebook))}
                          step={3}
                          saved={saved}
                          onFinish={finishGuidance}
                        >
                          <div className="space-y-3">
                            {guidedAnswer && (
                              <div className="flex items-start gap-3">
                                <NotebookPen className="mt-1 size-4 shrink-0 text-primary" />
                                <div className="min-w-0 space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    {saved
                                      ? "Saved finding"
                                      : "Finding to save"}
                                  </p>
                                  <p className="text-base leading-relaxed">
                                    {current.question}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Answer +{" "}
                                    {current.kind === "data"
                                      ? "file details"
                                      : `${current.result.sources.length} sources`}
                                    {saved
                                      ? ` · Notebook: ${books.find((b) => b.findings.some((f) => f.id === current.id))?.title}`
                                      : books.length === 1
                                        ? ` · Notebook: ${books[0].title}`
                                        : " · Choose a notebook when saving"}
                                  </p>
                                </div>
                              </div>
                            )}
                            <Button
                              id="save-finding"
                  className={cn(guidedAnswer && "ml-7", saved && "border-0 bg-white text-primary shadow-none hover:bg-accent")}
                              variant={saved ? "secondary" : "default"}
                              onClick={() => {
                                openSave();
                              }}
                            >
                              {saved ? <CheckCircle2 /> : <NotebookPen />}
                              {saved ? "Open in Notebook" : "Save to Notebook"}
                            </Button>
                          </div>
                        </ResearchGuide>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                              More
                              <ChevronDown />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onSelect={() => {
                                download(
                                  "research-answer.md",
                                  markdown(current),
                                );
                                notify("Answer exported.");
                              }}
                            >
                              <Download />
                              Export answer
                            </DropdownMenuItem>
                            {current.result.sources.length > 0 && (
                              <DropdownMenuItem
                                onSelect={() => {
                                  download(
                                    "research-citations.md",
                                    current.result.sources
                                      .map(
                                        (s) =>
                                          `- ${s.author} (${s.year}). ${s.title}. ${s.journal}. ${s.url}`,
                                      )
                                      .join("\n"),
                                  );
                                  notify("Citations exported.");
                                }}
                              >
                                <FileText />
                                Export citations
                              </DropdownMenuItem>
                            )}
                            {books.length > 0 && (
                              <DropdownMenuItem onSelect={showSaveDialog}>
                                <NotebookPen />
                                Save to another notebook
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </footer>
                    </div>
                  )}
                  {current.result.needsFile && answerDetails}
                </article>
                </AnswerSelection>
                {!current.result.needsFile && (
                  <section
                    aria-label="Recommended follow-up questions"
                    className="space-y-3 border-t pt-6"
                  >
                    <p className="text-xs text-muted-foreground">
                      Recommended follow-up questions
                    </p>
                    <div className="flex flex-col items-start gap-2">
                      {(current.context ? ["Summarize the findings in this research.", "Find passages about limitations and evidence gaps in this research."] : current.kind === "literature"
                        ? [
                            "Which experimental endpoints were used in mouse and human studies?",
                            "How do GMT and GHMT differ in cardiac reprogramming?",
                          ]
                        : current.kind === "data"
                          ? [
                              "Summarise the numeric columns in my CSV with means and ranges.",
                            ]
                          : [
                              "Which experiments could test these cardiac reprogramming hypotheses?",
                            ]
                      ).map((prompt) => (
                        <Button
                          key={prompt}
                          variant="outline"
                          className="h-auto min-h-9 whitespace-normal text-left"
                          onClick={() => {
                            setDraftContext(current.context || null);
                            setQuestion(prompt);
                            if (current.kind !== "data") setFile(null);
                            setCategory(
                              current.kind === "data" ? "data" : "literature",
                            );
                            nav("home");
                            setTimeout(() => input.current?.focus(), 50);
                          }}
                        >
                          {prompt}
                          <ArrowRight className="ml-auto" />
                        </Button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
            {view === "notebook" && (
              <div className="mx-auto flex min-h-0 flex-col xl:h-full">
                {notebookDetail && book ? <NotebookWorkspace
                    records={records}
                  books={books} book={book} finding={chatFinding}
                    onBook={(id) => { setBookId(id); setChatFindingId(null); }}
                    onFinding={setChatFindingId}
                    discussionOpen={discussionOpen}
                    onCloseDiscussion={() => setDiscussionOpen(false)}
                    onDiscuss={(id) => { setChatFindingId(id); setDiscussionOpen(true); }}
                    onNew={() => requestNoteNavigation(() => { setNewBookFolderId(null); setName(""); setModal("new-book"); })}
                    onRename={() => { setName(book.title); setModal("rename-book"); }}
                    onExport={exportBook} onResearch={fresh}
                    onOpen={(finding) => openRecord(records.find((record) => record.id === (finding.originResearchId || finding.id)) || finding)}
                    onEdit={editFinding} onChange={changeBook} onNotify={notify} onRemove={(id) => requestNoteNavigation(() => removeFinding(id))}
                    onConversation={persistConversation}
                    onSaveReply={saveNotebookReply}
                    onBack={() => requestNoteNavigation(() => setNotebookDetail(false))}
                  /> : <NotebookLibrary books={books} onBooks={commitBooks} onNotify={notify} onOpen={(id) => { setBookId(id); setChatFindingId(null); setNotebookDetail(true); }} onNew={(folderId) => { setNewBookFolderId(folderId || null); setName(""); setModal("new-book"); }} />
                }

              </div>
            )}
          </div>
          {["chat", "scenarios", "notebook"].filter((tab) => tab !== workspaceTab).map((tab) => <div key={tab} role="tabpanel" hidden id={`workspace-${tab}-panel`} aria-labelledby={`workspace-${tab}-tab`} />)}
        </div>
      </SidebarInset>
      <AnimatePresence initial={false}>
        {(modal === "save" || modal === "saved") && desktopNotebook && current && (
          <motion.div
            key="notebook-panel"
            data-notebook-panel-slot=""
            className="shrink-0 overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 392, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.32, 0.72, 0, 1] }}
          >
        <aside aria-label="Notebook panel" className="my-3 mr-3 flex h-[calc(100svh-1.5rem)] w-[380px] shrink-0 flex-col overflow-hidden rounded-3xl bg-background">
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><NotebookPen className="size-4 text-primary" />Notebook</h2>
            <Button variant="ghost" size="icon" className="size-10 rounded-full text-foreground hover:bg-primary/15 hover:text-primary active:bg-primary/20 [&_svg]:size-4" aria-label="Close Notebook panel" onClick={() => requestNoteNavigation(() => setModal(null))}><X /></Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{modal === "save" ? savePanelContent : notebookPanelContent}</div>
        </aside>
          </motion.div>
        )}
        {discussionOpen && view === "notebook" && notebookDetail && desktopNotebook && chatFinding && <motion.div key="finding-discussion-panel" className="shrink-0 overflow-hidden" initial={{width:0,opacity:0}} animate={{width:392,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:reducedMotion ? 0 : 0.26,ease:[0.32,0.72,0,1]}}>
          <aside aria-label="Finding discussion sidebar" className="my-3 mr-3 h-[calc(100svh-1.5rem)] w-[380px] overflow-hidden rounded-3xl bg-background">
            <NotebookConversation key={`${book.id}-${chatFinding.id}`} finding={chatFinding} workspace detached onClose={() => setDiscussionOpen(false)} onConversation={persistConversation} onSaveReply={saveNotebookReply} />
          </aside>
        </motion.div>}
      </AnimatePresence>
      <Sheet open={discussionOpen && view === "notebook" && notebookDetail && !desktopNotebook} onOpenChange={setDiscussionOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-full border-0 p-0 sm:max-w-md">
          <SheetTitle className="sr-only">Discuss this finding</SheetTitle>
          <SheetDescription className="sr-only">Conversation about the selected saved answer.</SheetDescription>
          {chatFinding && <NotebookConversation key={`${book.id}-${chatFinding.id}`} finding={chatFinding} workspace detached onClose={() => setDiscussionOpen(false)} onConversation={(conversation) => setBooks((previous) => updateFinding(previous, book.id, chatFinding.id, {conversation}))} onSaveReply={saveNotebookReply} />}
        </SheetContent>
      </Sheet>
      {modal === "sources" && (
        <Modal
          title="Your research sources"
          subtitle="Understand what is available before you start."
          onClose={() => setModal(null)}
        >
          <div className="divide-y">
            <Source
              Icon={BookOpen}
              title="PubMed"
              detail="Original papers linked in the example answers"
              status="Demo references"
            />
            <Source
              Icon={Database}
              title="Bayer datasets & tools"
              detail="Internal integrations belong to the original platform"
              status="Not connected"
            />
            <Source
              Icon={FileText}
              title={file?.name || "Attach a CSV"}
              detail={
                file
                  ? file.stats.rows + " rows · ready for descriptive analysis"
                  : "Calculate column means and ranges locally"
              }
              status={file ? "Ready" : "No file attached"}
            />
          </div>
          <Notice>
            This demo links to selected papers. It does not run a live
            literature search or connect to the client’s systems. CSV analysis
            runs in your browser.
          </Notice>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModal(null);
                nav("home");
                setTimeout(() => upload.current?.click(), 80);
              }}
            >
              <Paperclip />
              Attach CSV
            </Button>
          </DialogFooter>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="Meet your research companion"
          subtitle="Start with a question. Build on what you find."
          onClose={() => setModal(null)}
        >
          <div className="divide-y">
            <Source
              Icon={BookOpen}
              title="Explore scientific evidence"
              detail="A concise answer with original sources a click away."
            />
            <Source
              Icon={ChartColumn}
              title="Make sense of your data"
              detail="Attach a CSV to calculate means and ranges."
            />
            <Source
              Icon={NotebookPen}
              title="Keep your findings"
              detail="Save answers and sources, add notes and export a notebook."
            />
          </div>
          <Notice>
            This is a local prototype. Literature answers and hypotheses are
            examples; CSV statistics are calculated from your file. Research and
            notes are saved on this device.
          </Notice>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal("sources")}>
              <Database />
              Sources and capabilities
            </Button>
            <Button onClick={restartGuidance}>
              Restart first research
              <ArrowRight />
            </Button>
          </DialogFooter>
        </Modal>
      )}
      {(modal === "save" || modal === "saved") && !desktopNotebook && (
        <Sheet open onOpenChange={(open) => { if (!open) requestNoteNavigation(() => setModal(null)); }}>
          <SheetContent side="right" className="w-full overflow-y-auto border-0 bg-background p-6 sm:max-w-md">
            <SheetHeader className="px-0 pt-2 pb-6">
              <SheetTitle className="text-2xl">{modal === "saved" ? "Your finding in Notebook" : "Keep this finding"}</SheetTitle>
              <SheetDescription className="text-base">{modal === "saved" ? "Keep the evidence and add your own observations." : "The answer and its sources will stay together."}</SheetDescription>
            </SheetHeader>
          {modal === "saved" ? (
            notebookPanelContent
          ) : savePanelContent}
          </SheetContent>
        </Sheet>
      )}
      {modal === "rename-book" && book && <Modal title="Rename notebook" subtitle="Update the name of this collection." onClose={() => setModal(null)}>
        <form onSubmit={renameBook} className="space-y-5">
          <div className="space-y-3"><Label htmlFor="rename-notebook-name">Notebook name</Label><Input id="rename-notebook-name" autoFocus required maxLength={90} value={name} onChange={(event) => setName(event.target.value)} /></div>
          <DialogFooter><Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" disabled={!name.trim()}>Save name</Button></DialogFooter>
        </form>
      </Modal>}
      {modal === "new-book" && (
        <Modal
          title="Start a research notebook"
          subtitle="Give your findings a place to grow."
          onClose={() => setModal(null)}
        >
          <form onSubmit={newBook} className="space-y-5">
            <NotebookTemplateSelect />
            <div className="space-y-3">
              <Label htmlFor="new-notebook-name">Notebook name</Label>
              <Input
                id="new-notebook-name"
                placeholder="e.g. Cardiac reprogramming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={90}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create notebook
                <ArrowRight />
              </Button>
            </DialogFooter>
          </form>
        </Modal>
      )}
      <Toaster position="bottom-center" />
    </SidebarProvider>
  );
}
