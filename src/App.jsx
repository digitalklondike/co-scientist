import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  NotebookPen,
  MessageSquare,
  Plus,
  Search,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { WorkspaceTabs } from "@/components/workspace-tabs";
import { Toaster } from "@/components/ui/sonner";
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
import {
  EXAMPLES,
  SAMPLE,
  PAPERS,
  IDEAS,
  parseCSV,
  answer,
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

function ResearchGuide({
  children,
  open,
  step,
  saved,
  isData,
  sourcesOpen,
  onFinish,
}) {
  const id = `research-guide-${step}`;
  const title = saved
    ? "Your finding is saved."
    : step === 1
      ? "Ask your first research question"
      : step === 2
        ? isData
          ? "Look at the data behind your answer"
          : "Look at the original evidence"
        : "Keep a useful finding";
  const description = saved
    ? "Open Notebook to find this answer and its sources. You can add your own notes there."
    : step === 1
      ? isData
        ? "Tell me which columns to explore and what to calculate. Then send your question."
        : "Describe what you’re studying and what you want to find out. You can edit an example to get started."
      : step === 2
        ? isData
          ? "Open Sources used to see the file and how the calculation was made."
          : sourcesOpen
            ? "Open a paper below to inspect its methods and experimental model."
            : "Open Sources used below, then choose a paper to see the original study."
        : "Save this answer with its sources to Notebook so you can return to it. This step is optional.";
  return (
    <>
      {open && (
        <section
          id={id}
          aria-label="Research onboarding"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          className="mb-5 basis-full scroll-mt-24 space-y-3 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <Identity label={`Onboarding · ${step}/3`} />
            <Button
              variant="ghost"
              size="sm"
              className="-mr-2 -my-2 shrink-0 text-muted-foreground"
              aria-label={saved ? "Finish onboarding" : "Skip onboarding"}
              onClick={onFinish}
            >
              {saved ? "Finish" : "Skip"}
            </Button>
          </div>
          <h2
            id={`${id}-title`}
            className="text-xl font-semibold leading-snug"
            aria-live="polite"
          >
            {title}
          </h2>
          <p
            id={`${id}-description`}
            className="text-base leading-relaxed text-muted-foreground"
            aria-live="polite"
          >
            {description}
          </p>
        </section>
      )}
      {children}
    </>
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
  const [view, setView] = useState("home"),
    [records, setRecords] = useSaved("records", []),
    [books, setBooks] = useSaved("books", []),
    [guide, setGuide] = useState(true);
  const [guidedId, setGuidedId] = useState(null),
    [reviewedId, setReviewedId] = useState(null),
    [noteHint, setNoteHint] = useState(false),
    [showAllHistory, setShowAllHistory] = useState(false);
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
    upload = useRef(),
    viewRef = useRef(view);
  viewRef.current = view;
  const current = records.find((r) => r.id === active),
    book = books.find((b) => b.id === bookId) || books[0],
    saved =
      current && books.some((b) => b.findings.some((f) => f.id === current.id));
  const uniqueHistory = records.filter(
    (r, i, list) =>
      list.findIndex(
        (item) =>
          item.question
            .trim()
            .toLowerCase()
            .replace(/[?.]+$/, "") ===
          r.question
            .trim()
            .toLowerCase()
            .replace(/[?.]+$/, ""),
      ) === i,
  );
  const matchingHistory = uniqueHistory.filter((r) =>
    r.question.toLowerCase().includes(search.toLowerCase()),
  );
  const firstQuestion =
    guide &&
    (!guidedId || (current?.id === guidedId && current.result.needsFile));
  const guidedAnswer =
    guide && current?.id === guidedId && !current?.result.needsFile;
  const guideStep = reviewedId === current?.id || saved ? 3 : 2;
  useEffect(() => {
    if (view !== "answer" || !guidedAnswer || modal) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`research-guide-${guideStep}`)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [
    view,
    guidedAnswer,
    current?.id,
    guideStep,
    saved,
    modal,
    opened.sources,
  ]);
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
  const notify = (text, action, type = "success") =>
    sonnerToast[type](text, {
      id: "research-notification",
      duration: action ? Infinity : 5500,
      action: action ? { label: action.label, onClick: action.run } : undefined,
    });
  const nav = (v) => {
    viewRef.current = v;
    setView(v);
    setSide(false);
    setOpened({});
    window.scrollTo(0, 0);
  };
  const fresh = () => {
    nav("home");
    if (guide) setGuidedId(null);
    setQuestion("");
    setFile(null);
    setTimeout(() => input.current?.focus(), 50);
  };
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
        const r = { ...task, result: answer(task) };
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
      notify("Choose a CSV file for local data analysis.", undefined, "error");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      notify("Choose a CSV smaller than 2 MB.", undefined, "error");
      return;
    }
    try {
      const stats = parseCSV(await f.text());
      setFile({ name: f.name, stats });
      setCategory("data");
      notify(`${f.name} is ready · ${stats.rows} rows.`);
    } catch (err) {
      notify(err.message, undefined, "error");
    }
  }
  function useExample(example, i, kind = category) {
    setCategory(kind);
    setQuestion(example[0]);
    if (kind === "data" && i === 0) sample();
    else setFile(null);
    input.current?.focus();
  }
  function launch(t) {
    if (guide) setGuidedId(t.id);
    setReadyId(null);
    setTask(t);
    setActive(t.id);
    nav("loading");
  }
  function submit(e) {
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
    const kind =
      file || /csv|numeric column|column mean/i.test(question)
        ? "data"
        : /hypothes|experimental ideas/i.test(question)
          ? "hypotheses"
          : "literature";
    const t = {
      id: crypto.randomUUID(),
      question: question.trim(),
      kind,
      file,
    };
    if (kind === "hypotheses") {
      setPlan(t);
      nav("plan");
    } else launch(t);
  }
  function openRecord(r) {
    if (!r) return;
    if (guide && !guidedId && !r.result.needsFile) setGuidedId(r.id);
    if (r.id === readyId) sonnerToast.dismiss("research-notification");
    setReadyId(null);
    setActive(r.id);
    nav("answer");
  }
  function showSaveDialog() {
    setName(
      current.kind === "data"
        ? "Gene expression analysis"
        : "Cardiac reprogramming",
    );
    setTarget(books[0]?.id || "new");
    setModal("save");
  }
  function openSave() {
    const containing = books.find((b) =>
      b.findings.some((f) => f.id === current.id),
    );
    if (containing) {
      setBookId(containing.id);
      setNoteHint(guide);
      nav("notebook");
    } else if (books.length === 1) {
      persistFinding(books[0].id);
    } else showSaveDialog();
  }
  function persistFinding(destination, title) {
    const id = destination === "new" ? crypto.randomUUID() : destination;
    const existing = books.find((b) => b.id === id);
    if (existing?.findings.some((f) => f.id === current.id)) {
      setModal(null);
      setBookId(id);
      setNoteHint(guide);
      nav("notebook");
      return;
    }
    const finding = { ...current, note: "" };
    setBooks((p) =>
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
    );
    setBookId(id);
    setNoteHint(guide);
    setModal(null);
    if (!guidedAnswer)
      notify(
        "Saved to " +
          (existing?.title || title?.trim() || "Research notes") +
          ".",
        {
          label: "Open notebook",
          run: () => nav("notebook"),
        },
      );
  }
  function save(e) {
    e.preventDefault();
    persistFinding(target, name);
  }
  function newBook(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = crypto.randomUUID();
    setBooks((p) => [{ id, title: name.trim(), findings: [] }, ...p]);
    setBookId(id);
    setModal(null);
    nav("notebook");
  }
  function editNote(id, note) {
    if (id === guidedId && note.trim()) finishGuidance();
    setBooks((p) =>
      p.map((b) =>
        b.id === book.id
          ? {
              ...b,
              findings: b.findings.map((f) =>
                f.id === id ? { ...f, note } : f,
              ),
            }
          : b,
      ),
    );
  }
  function exportBook() {
    download(
      book.title.replace(/[^a-z0-9 -]/gi, "") + ".md",
      `# ${book.title}\n\n` +
        book.findings
          .map(
            (f) =>
              markdown(f).replace(/^# /, "## ") +
              (f.note ? "\n\n### My notes\n" + f.note : ""),
          )
          .join("\n\n"),
    );
    notify("Notebook exported as Markdown.");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown(current));
      notify("Answer and source links copied.");
    } catch {
      notify("Clipboard unavailable. Use Export instead.", undefined, "error");
    }
  }
  return (
    <SidebarProvider openMobile={side} onOpenMobileChange={setSide}>
      <a
        href="#content"
        className="sr-only fixed z-50 rounded-md bg-background px-4 py-3 text-xs focus:not-sr-only focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Sidebar aria-label="Research navigation">
        <SidebarHeader className="gap-5 px-4 pt-5 pb-3">
          <div className="flex items-center gap-3 px-1">
            <Avatar className="size-8">
              <AvatarImage src="/assets/co-scientist.png" alt="" />
              <AvatarFallback>Co</AvatarFallback>
            </Avatar>
            <div className="text-xs leading-5">
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
            className="w-full justify-start"
            onClick={fresh}
          >
            <Plus />
            New research
            <kbd className="ml-auto text-xs text-muted-foreground">Ctrl K</kbd>
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              aria-label="Search research history"
              placeholder="Search research"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-3">
            <SidebarGroupLabel>Recent research</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {matchingHistory
                  .slice(0, showAllHistory || search ? undefined : 5)
                  .map((r) => (
                    <SidebarMenuItem key={r.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            className="h-9"
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
                          className="max-w-72 text-xs leading-relaxed"
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
                <p className="px-2 py-4 text-xs leading-relaxed text-muted-foreground">
                  Your research will appear here.
                </p>
              )}
              {search && !matchingHistory.length && (
                <p className="px-2 py-4 text-xs text-muted-foreground">
                  No matching research.
                </p>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
          {task && (
            <SidebarGroup>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => nav("loading")}
              >
                <Spinner />
                Research in progress
              </Button>
            </SidebarGroup>
          )}
          {readyId && !task && view !== "answer" && (
            <SidebarGroup>
              <Button
                variant="secondary"
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
              <AvatarFallback className="bg-secondary text-xs">
                R
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-xs">
              <p className="font-medium">Researcher</p>
              <p className="text-muted-foreground">Saved on this device</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <WorkspaceTabs
            className="absolute left-1/2 -translate-x-1/2"
            value={view === "notebook" ? "notebook" : "chat"}
            onValueChange={(value) =>
              nav(
                value === "notebook" ? "notebook" : current ? "answer" : "home",
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
                className="ml-auto sm:ml-0"
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
          className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10"
          tabIndex={-1}
        >
          <div
            role="tabpanel"
            id={`workspace-${view === "notebook" ? "notebook" : "chat"}-panel`}
            aria-labelledby={`workspace-${view === "notebook" ? "notebook" : "chat"}-tab`}
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            {view === "home" && (
              <div className="mx-auto w-full max-w-3xl space-y-7 pt-6 sm:pt-12">
                {!(firstQuestion && !task) && (
                  <div className="space-y-3">
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
                    <p className="text-base leading-relaxed text-muted-foreground">
                      Find evidence in the literature, explore your data, or
                      develop hypotheses.
                    </p>
                  </div>
                )}
                <ResearchGuide
                  open={firstQuestion && !task && !modal}
                  step={1}
                  isData={Boolean(file)}
                  onFinish={finishGuidance}
                >
                  <form
                    className={cn(
                      "space-y-3 rounded-xl border bg-background p-4 transition-colors focus-within:border-primary",
                      firstQuestion && !task && "border-primary/40",
                    )}
                    onSubmit={submit}
                  >
                    <Label htmlFor="question">Your question</Label>
                    <Textarea
                      id="question"
                      ref={input}
                      className="min-h-28 resize-none rounded-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                      aria-describedby={
                        firstQuestion && !task
                          ? "research-guide-1-description"
                          : undefined
                      }
                      placeholder={
                        file
                          ? "Which columns should we explore?"
                          : firstQuestion
                            ? "What are you studying, and what would you like to find out?"
                            : "Ask your research question…"
                      }
                      value={question}
                      maxLength={3000}
                      onChange={(e) => setQuestion(e.target.value)}
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
                        className="text-muted-foreground"
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
                {!firstQuestion && (
                  <section
                    aria-label="Editable question examples"
                    className="space-y-3"
                  >
                    <p className="text-xs text-muted-foreground">
                      Try an example, then edit it for your research.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["literature", "Compare mouse and human evidence", 1],
                        ["data", "Calculate mean gene expression", 0],
                        [
                          "hypotheses",
                          "Explore cardiac reprogramming hypotheses",
                          0,
                        ],
                      ].map(([kind, label, index]) => (
                        <Button
                          variant="outline"
                          className="h-auto min-h-9 whitespace-normal text-left"
                          key={kind}
                          onClick={() =>
                            useExample(EXAMPLES[kind][index], index, kind)
                          }
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </section>
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
                <Card aria-live="polite">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Spinner className="size-5 text-primary" />
                      <Badge variant="secondary">
                        {task.kind === "data"
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
                            : "Reviewing the evidence",
                          "Preparing a concise answer",
                        ][stage]
                      }
                    </h1>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      The tools are selected for your question. You can keep
                      working while the answer is prepared.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <Progress
                      value={researchProgress}
                      aria-label="Research progress"
                    />
                    {[
                      "Understand the question",
                      task.kind === "data"
                        ? "Calculate descriptive statistics"
                        : "Review relevant sources",
                      "Prepare findings and next steps",
                    ].map((label, i) => (
                      <div
                        key={label}
                        className={
                          "flex items-center gap-3 text-xs " +
                          (i > stage ? "text-muted-foreground" : "")
                        }
                      >
                        {i < stage ? (
                          <CheckCircle2 className="size-4 text-primary" />
                        ) : i === stage ? (
                          <Spinner className="text-primary" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                        <span>{label}</span>
                        {i === stage && (
                          <Badge variant="secondary" className="ml-auto">
                            In progress
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => nav("home")}>
                      Continue working
                      <ArrowRight />
                    </Button>
                    <Button
                      variant="ghost"
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
                    : "Example workflow · no live AI request"}
                </p>
              </div>
            )}
            {view === "answer" && current && (
              <div className="mx-auto max-w-3xl space-y-8">
                <Button variant="ghost" className="-ml-3" onClick={fresh}>
                  <ArrowLeft />
                  New research
                </Button>
                <QuestionBubble>{current.question}</QuestionBubble>
                <article aria-label="Co-Scientist answer" className="space-y-6">
                  <div className="flex items-center justify-between gap-2">
                    <Identity
                      label={
                        current.kind === "data"
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
                        : current.kind === "literature"
                          ? "Direct answer"
                          : current.result.title}
                    </h2>
                    <p>{current.result.summary}</p>
                  </div>
                  <div className="research-prose text-base leading-relaxed">
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
                    {current.kind === "literature" && (
                      <>
                        <h3>Evidence across experimental models</h3>
                        <p>
                          Gata4, Mef2c and Tbx5 were used to reprogram mouse
                          fibroblasts into cardiomyocyte-like cells in vitro.{" "}
                          <a
                            href={PAPERS[0].url}
                            onClick={() => setReviewedId(current.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ieda et al., 2010
                          </a>
                          .
                        </p>
                        <p>
                          Song and colleagues studied reprogramming with Gata4,
                          Hand2, Mef2c and Tbx5 in the mouse heart.{" "}
                          <a
                            href={PAPERS[1].url}
                            onClick={() => setReviewedId(current.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Song et al., 2012
                          </a>
                          .
                        </p>
                        <p>
                          Human fibroblast work includes additional cardiac
                          factors and muscle-specific microRNAs.{" "}
                          <a
                            href={PAPERS[2].url}
                            onClick={() => setReviewedId(current.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Nam et al., 2013
                          </a>
                          .
                        </p>
                        <h3>Conclusion</h3>
                        <p>
                          Cardiac marker expression does not establish a mature
                          functional phenotype. Outcomes depend on starting
                          cells and experimental conditions. Compare methods and
                          endpoints in the original papers.
                        </p>
                        <p>
                          An illustrative review of three selected papers, not
                          an exhaustive literature search.
                        </p>
                      </>
                    )}
                    {current.kind === "data" && !current.result.needsFile && (
                      <>
                        <h3>Column statistics</h3>
                        <Table className="text-xs tabular-nums">
                          <TableHeader>
                            <TableRow>
                              {[
                                "Column",
                                "Values",
                                "Mean",
                                "Min",
                                "Max",
                                "Missing",
                              ].map((h) => (
                                <TableHead key={h}>{h}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {current.result.stats.columns.map((c) => (
                              <TableRow key={c.name}>
                                <TableCell className="font-medium">
                                  {c.name}
                                </TableCell>
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
                          Arithmetic means from non-empty numeric values. No
                          statistical model or hypothesis test applied.
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
                  {!current.result.needsFile && (
                    <div className="space-y-4">
                      <Accordion
                        type="single"
                        collapsible
                        value={opened.sources ? "sources" : ""}
                        onValueChange={(value) => {
                          if (value === "sources" && current.kind === "data")
                            setReviewedId(current.id);
                          setOpened((p) => ({
                            ...p,
                            sources: value === "sources",
                          }));
                        }}
                      >
                        <AccordionItem value="sources">
                          <ResearchGuide
                            open={guidedAnswer && guideStep === 2 && !modal}
                            step={2}
                            isData={current.kind === "data"}
                            sourcesOpen={opened.sources}
                            onFinish={finishGuidance}
                          >
                            <AccordionTrigger
                              id="trigger-sources"
                              className={cn(
                                "scroll-mt-72 rounded-md px-3 text-xs",
                                guidedAnswer &&
                                  guideStep === 2 &&
                                  "bg-secondary ring-1 ring-primary/40",
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
                          </ResearchGuide>
                          <AccordionContent
                            aria-labelledby="trigger-sources"
                            className="text-base"
                            rootClassName="data-[state=open]:animate-none"
                          >
                            {current.kind === "data" ? (
                              <p className="leading-relaxed">
                                <strong>{current.result.filename}</strong>
                                <br />
                                {current.result.stats.rows} rows. Missing values
                                excluded independently for each numeric column.
                              </p>
                            ) : (
                              <div className="divide-y">
                                {current.result.sources.map((source) => (
                                  <a
                                    key={source.url}
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setReviewedId(current.id)}
                                    className="group flex items-start gap-3 rounded-md px-2 py-4 hover:bg-accent"
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
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <footer className="flex flex-wrap items-center gap-2">
                        <ResearchGuide
                          open={guidedAnswer && guideStep === 3 && !modal}
                          step={3}
                          saved={saved}
                          onFinish={finishGuidance}
                        >
                          <Button
                            id="save-finding"
                            variant={saved ? "outline" : "default"}
                            onClick={() => {
                              openSave();
                              if (saved) finishGuidance();
                            }}
                          >
                            {saved ? <CheckCircle2 /> : <NotebookPen />}
                            {saved ? "Open in Notebook" : "Save to Notebook"}
                          </Button>
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
                </article>
                {!current.result.needsFile && (
                  <section
                    aria-label="Recommended follow-up questions"
                    className="space-y-3 border-t pt-6"
                  >
                    <p className="text-xs text-muted-foreground">
                      Recommended follow-up questions
                    </p>
                    <div className="flex flex-col items-start gap-2">
                      {(current.kind === "literature"
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
              <div className="mx-auto max-w-5xl space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Your notebooks
                    </h1>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      Findings, sources and your own thinking.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setName("");
                      setModal("new-book");
                    }}
                  >
                    <Plus />
                    New notebook
                  </Button>
                </div>
                {!books.length ? (
                  <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                      <NotebookPen className="size-8 text-muted-foreground" />
                      <h2 className="text-2xl font-semibold">
                        Keep your first finding
                      </h2>
                      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                        Save an answer from Chat to keep it with its sources.
                        Add your notes and return whenever you’re ready.
                      </p>
                      <Button onClick={fresh}>
                        Start your first research
                        <ArrowRight />
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <aside aria-label="Notebook list" className="space-y-3">
                      <Input
                        aria-label="Search notebooks"
                        placeholder="Find a notebook"
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                      />
                      <div className="flex flex-col gap-1">
                        {books
                          .filter((b) =>
                            b.title
                              .toLowerCase()
                              .includes(bookSearch.toLowerCase()),
                          )
                          .map((b) => (
                            <Button
                              key={b.id}
                              variant={book.id === b.id ? "secondary" : "ghost"}
                              aria-pressed={book.id === b.id}
                              className="h-auto min-h-12 justify-start px-3 py-3"
                              onClick={() => setBookId(b.id)}
                            >
                              <NotebookPen className="shrink-0" />
                              <span className="min-w-0 text-left">
                                <span className="block truncate">
                                  {b.title}
                                </span>
                                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                  {b.findings.length}{" "}
                                  {b.findings.length === 1
                                    ? "finding"
                                    : "findings"}
                                </span>
                              </span>
                            </Button>
                          ))}
                      </div>
                      {bookSearch &&
                        !books.some((b) =>
                          b.title
                            .toLowerCase()
                            .includes(bookSearch.toLowerCase()),
                        ) && (
                          <p className="text-xs text-muted-foreground">
                            No matching notebooks.
                          </p>
                        )}
                    </aside>
                    <section className="min-w-0 space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-5">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-semibold tracking-tight">
                            {book.title}
                          </h2>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {book.findings.length} saved{" "}
                            {book.findings.length === 1
                              ? "finding"
                              : "findings"}{" "}
                            · Changes saved on this device
                          </p>
                        </div>
                        <Button variant="outline" onClick={exportBook}>
                          <Download />
                          Export notes
                        </Button>
                      </div>
                      {!book.findings.length && (
                        <div className="space-y-3 py-8">
                          <h3 className="text-base font-semibold">
                            Ready for your first finding
                          </h3>
                          <p className="text-base text-muted-foreground">
                            Open an answer in Chat and select “Save to
                            Notebook”.
                          </p>
                          <Button variant="outline" onClick={fresh}>
                            Start research
                            <ArrowRight />
                          </Button>
                        </div>
                      )}
                      {[...book.findings].reverse().map((f) => (
                        <Card key={f.id} data-testid="saved-finding">
                          <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge variant="secondary">
                                <FileText className="size-3" />
                                Saved finding
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRecord(f)}
                              >
                                Open research
                                <ArrowUpRight />
                              </Button>
                            </div>
                            <h3 className="break-words text-base font-semibold leading-relaxed">
                              {f.question}
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <p className="text-base leading-relaxed">
                              {f.result.summary}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {f.result.sources.map((s) => (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  key={s.url}
                                >
                                  <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <BookOpen />
                                    {s.author}, {s.year}
                                    <ArrowUpRight />
                                  </a>
                                </Button>
                              ))}
                              {f.result.filename && (
                                <Badge variant="outline">
                                  <Database className="size-3" />
                                  {f.result.filename}
                                </Badge>
                              )}
                            </div>
                            {noteHint && f.id === guidedId && (
                              <OnboardingHint
                                title="Add your next step"
                                id={"note-guidance-" + f.id}
                                onSkip={finishGuidance}
                              >
                                Add an observation below. Your notes save
                                automatically; you can return to this finding
                                anytime.
                              </OnboardingHint>
                            )}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <Label htmlFor={"note-" + f.id}>
                                  Your notes
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                  Saved automatically
                                </span>
                              </div>
                              <Textarea
                                id={"note-" + f.id}
                                aria-label={"Notes for " + f.question}
                                aria-describedby={
                                  noteHint && f.id === guidedId
                                    ? "note-guidance-" + f.id
                                    : undefined
                                }
                                className="min-h-24 text-base"
                                placeholder="Add an observation or next step…"
                                value={f.note}
                                onChange={(e) => editNote(f.id, e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            role="tabpanel"
            hidden
            id={`workspace-${view === "notebook" ? "chat" : "notebook"}-panel`}
            aria-labelledby={`workspace-${view === "notebook" ? "chat" : "notebook"}-tab`}
          />
        </div>
      </SidebarInset>
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
      {modal === "save" && (
        <Modal
          title="Keep this finding"
          subtitle="The answer and its sources will stay together."
          onClose={() => setModal(null)}
        >
          <form onSubmit={save} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="save-notebook">Save to notebook</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger id="save-notebook" className="w-full">
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
            <div className="flex items-start gap-3 rounded-md bg-muted p-4">
              <FileText className="size-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-base font-medium">{current.result.title}</p>
                <p className="text-xs text-muted-foreground">
                  {current.result.sources.length
                    ? current.result.sources.length + " source links included"
                    : "Data summary included"}
                </p>
              </div>
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
                <NotebookPen />
                Save finding
              </Button>
            </DialogFooter>
          </form>
        </Modal>
      )}
      {modal === "new-book" && (
        <Modal
          title="Start a research notebook"
          subtitle="Give your findings a place to grow."
          onClose={() => setModal(null)}
        >
          <form onSubmit={newBook} className="space-y-5">
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
      <Toaster position="bottom-right" closeButton />
    </SidebarProvider>
  );
}
