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
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  EXAMPLES,
  SAMPLE,
  PAPERS,
  CARDIAC_REPORT,
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
  const [guidedId, setGuidedId] = useState(null),
    [reviewedId, setReviewedId] = useState(null),
    [noteHint, setNoteHint] = useState(false),
    [showAllHistory, setShowAllHistory] = useState(false);
  const [chatFindingId, setChatFindingId] = useState(null);
  const [notebookDetail, setNotebookDetail] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
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
  const guidedAnswer =
    guide && current?.id === guidedId && !current?.result.needsFile;
  const guideStep = reviewedId === current?.id || saved ? 3 : 2;
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const resetKey = "cosci-notebook-empty-demo-v2";
    if (localStorage.getItem(resetKey)) return;
    setBooks([]);
    localStorage.setItem(resetKey, "1");
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
  const notify = (text, action, type = "success") =>
    sonnerToast.custom((id) => <NotificationToast text={text} type={type} action={action} onDismiss={() => sonnerToast.dismiss(id)} />, {
      id: "research-notification",
      duration: action ? Infinity : 5500,
    });
  const nav = (v) => {
    if (v === "notebook") setNotebookDetail(false);
    viewRef.current = v;
    setView(v);
    setModal((previous) => ["save", "saved"].includes(previous) ? null : previous);
    setSide(false);
    setOpened({});
    workspaceScroll.current?.scrollTo({ top: 0, behavior: "instant" });
  };
  const fresh = () => {
    nav("home");
    setActive(null);
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
    if (kind === "data" && (i === 0 || i === 2)) sample();
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
      setModal("saved");
    } else showSaveDialog();
  }
  function persistFinding(destination, title) {
    const id = destination === "new" ? crypto.randomUUID() : destination;
    const existing = books.find((b) => b.id === id);
    if (existing?.findings.some((f) => f.id === current.id)) {
      setModal("saved");
      setBookId(id);
      setNoteHint(guide);
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
    setModal("saved");
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
    setNotebookDetail(true);
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
  function editFinding(id, contentMarkdown) {
    setBooks((previous) => updateFinding(previous, book.id, id, { contentMarkdown }));
    notify("Notebook answer updated. Original research kept.");
  }
  function removeFinding(id) {
    const index = book.findings.findIndex((item) => item.id === id);
    if (index < 0) return;
    const removed = book.findings[index];
    const destinationId = book.id;
    setBooks((previous) => removeNotebookFinding(previous, destinationId, id));
    if (chatFinding?.id === id) {
      setDiscussionOpen(false);
      setChatFindingId(null);
    }
    notify("Answer removed from notebook.", {
      label: "Undo",
      run: () => setBooks((previous) => restoreNotebookFinding(previous, destinationId, removed, index)),
    });
  }
  function renameBook(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setBooks((previous) => previous.map((item) => item.id === book.id ? { ...item, title: name.trim() } : item));
    setModal(null);
    notify("Notebook renamed.");
  }
  function saveNotebookReply(message) {
    if (message.saved) return;
    setChatFindingId(chatFinding.id);
    const finding = {
      id: crypto.randomUUID(), question: message.question, kind: "literature", note: "",
      originResearchId: chatFinding.originResearchId || chatFinding.id,
      sourceFindingId: chatFinding.id, sourceMessageId: message.id,
      result: { title: "Notebook follow-up", summary: message.answer, sources: chatFinding.result.sources },
    };
    setBooks((previous) => updateFinding(previous, book.id, chatFinding.id, {
      conversation: chatFinding.conversation.map((item) => item.id === message.id ? { ...item, saved: true } : item),
    }).map((item) => item.id === book.id ? { ...item, findings: [...item.findings, finding] } : item));
    notify("Response saved to this notebook.");
  }
  function exportBook() {
    download(
      book.title.replace(/[^a-z0-9 -]/gi, "") + ".md",
      `# ${book.title}\n\n` +
        book.findings
          .map(
            (f) =>
              markdown(f).replace(/^# /, "## ") +
              (f.contentMarkdown !== undefined && f.result.sources.length ? "\n\n### Sources kept with this answer\n" + f.result.sources.map((source) => `- [${source.title}](${source.url})`).join("\n") : "") +
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
            {desktopNotebook && <div className="space-y-2"><h3 className="text-base font-semibold">Save this answer</h3><p className="text-base leading-relaxed text-muted-foreground">Choose a notebook to keep this answer, its sources and your notes together.</p></div>}
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
                <p className="text-base font-medium">{current.question}</p>
                <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{current.result.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {current.result.sources.length
                    ? current.result.sources.length + " source links included"
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
                  <h3 className="text-base font-semibold leading-relaxed">{current.question}</h3>
                </div>
                {book?.findings.find((f) => f.id === current.id)?.contentMarkdown !== undefined ? (
                  <Accordion type="single" collapsible><AccordionItem value="edited-answer" className="border-0">
                    <AccordionTrigger className="items-center py-2 text-xs [&>svg]:translate-y-0">Edited answer saved</AccordionTrigger>
                    <AccordionContent><NotebookMarkdown>{book.findings.find((f) => f.id === current.id).contentMarkdown}</NotebookMarkdown></AccordionContent>
                  </AccordionItem></Accordion>
                ) : <p className="text-base leading-relaxed">{current.result.summary}</p>}
                {(book?.findings.find((f) => f.id === current.id)?.contentMarkdown === undefined && book?.findings.find((f) => f.id === current.id)?.result.report) && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="saved-analysis" className="border-0">
                      <AccordionTrigger className="items-center py-2 text-xs [&>svg]:translate-y-0">Full analysis saved</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-base leading-relaxed">
                        {book.findings.find((f) => f.id === current.id).result.report.sections.map((section) => (
                          <section key={section.title} className="space-y-2">
                            <h4 className="font-semibold">{section.title}</h4>
                            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                          </section>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                {current.result.sources.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Sources kept with this answer</p>
                    <div className="flex flex-wrap gap-2">
                      {current.result.sources.map((source) => (
                        <Button key={source.url} asChild variant="secondary" size="sm" className="bg-white text-primary hover:bg-primary/15 hover:text-primary active:bg-primary/20">
                          <a href={source.url} target="_blank" rel="noreferrer"><BookOpen />{source.author}, {source.year}<ArrowUpRight /></a>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground">Dataset: {current.result.filename}</p>}
              </section>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="saved-panel-note">Your notes</Label>
                  <span className="text-xs text-muted-foreground">Saved automatically</span>
                </div>
                <Textarea id="saved-panel-note" className="min-h-36 border-transparent bg-secondary/60 text-base" placeholder="What matters for your research? Add an observation or next step…" value={book?.findings.find((f) => f.id === current.id)?.note || ""} onChange={(e) => editNote(current.id, e.target.value)} />
                <p className="text-xs leading-relaxed text-muted-foreground">Your answer, sources and notes stay together. Changes are saved on this device.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => { setModal(null); finishGuidance(); nav("notebook"); setNotebookDetail(true); }}><NotebookPen />Open full notebook<ArrowRight /></Button>
                <Button variant="secondary" onClick={() => setModal(null)}>Back to research</Button>
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
      <Sidebar aria-label="Research navigation" className="border-r-0">
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
            className="w-full justify-start rounded-md border-0 bg-primary/10 text-primary shadow-none hover:bg-primary/15"
            onClick={fresh}
          >
            <Plus />
            New research
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute top-3 left-3 size-4 text-primary" />
            <Input
              className="h-10 rounded-md border-input bg-transparent pl-9 !text-xs font-medium text-primary placeholder:text-primary shadow-none"
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
                {task && (
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          className="h-9 rounded-xl hover:bg-primary/10 data-[active=true]:bg-white data-[active=true]:text-foreground data-[active=true]:hover:bg-white"
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
                        className="max-w-72 text-xs leading-relaxed"
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
                            className="h-9 rounded-xl hover:bg-primary/10 data-[active=true]:bg-white data-[active=true]:text-foreground data-[active=true]:hover:bg-white"
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
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
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
      <SidebarInset className="m-3 h-[calc(100svh-1.5rem)] min-h-0 min-w-0 flex-1 overflow-hidden rounded-3xl border-0 bg-background shadow-none max-md:m-0 max-md:h-svh max-md:rounded-none">
        <header className="relative z-20 flex h-16 shrink-0 items-center gap-3 bg-background px-4 sm:px-6">
          <SidebarTrigger
            className="size-10 rounded-full text-foreground hover:bg-primary/15 hover:text-primary active:bg-primary/20 [&_svg]:size-4"
            aria-label="Toggle navigation"
          />
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
          className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8", view === "notebook" && books.length > 0 && "xl:overflow-hidden xl:px-0 xl:py-0")}
          tabIndex={-1}
        >
          <div
            role="tabpanel"
            id={`workspace-${view === "notebook" ? "notebook" : "chat"}-panel`}
            aria-labelledby={`workspace-${view === "notebook" ? "notebook" : "chat"}-tab`}
            tabIndex={0}
            className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring", view === "notebook" && books.length > 0 && "xl:h-full")}
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
              <div className="mx-auto w-full max-w-3xl space-y-7 pt-4 sm:pt-6">
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
                <ResearchGuide
                  open={firstQuestion && !task && !modal}
                  step={1}
                  isData={Boolean(file)}
                  onFinish={finishGuidance}
                >
                  <form
                    className="space-y-3 overflow-hidden rounded-2xl border-0 bg-secondary/70 p-4 outline-1 outline-transparent -outline-offset-1 transition-[outline-color] hover:outline-primary/50 focus-within:outline-primary"
                    onSubmit={submit}
                  >
                    <Label htmlFor="question">Your question</Label>
                    <Textarea
                      id="question"
                      ref={input}
                      className="min-h-28 resize-none rounded-none border-0 bg-transparent p-0 text-base shadow-none hover:outline-none focus-visible:ring-0"
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
                {!firstQuestion && (
                  <section
                    aria-label="Editable question examples"
                    className="space-y-3"
                  >
                    <p className="text-center text-xs font-medium text-muted-foreground">
                      Try one of these examples
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        [
                          "hypotheses",
                          "Hypothesis Generation",
                          0,
                          MessageSquare,
                        ],
                        ["literature", "Literature Review", 1, BookOpen],
                        ["data", "Data Analysis", 0, ChartColumn],
                        ["literature", "Comparative Study", 2, ArrowRight],
                        ["data", "Data Visualization", 2, ChartColumn],
                        ["literature", "Target Profiling", 3, Database],
                      ].map(([kind, label, index, Icon]) => (
                        <Button
                          variant="outline"
                          className="group flex h-full min-h-56 w-full flex-col items-start justify-start gap-4 whitespace-normal rounded-xl border-transparent bg-secondary/60 p-4 text-left font-normal shadow-none transition-colors duration-150 hover:bg-accent active:bg-primary/20 motion-reduce:transition-none"
                          key={label}
                          onClick={() =>
                            useExample(EXAMPLES[kind][index], index, kind)
                          }
                        >
                          <span className="flex items-center gap-3 text-xs font-medium">
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                kind === "hypotheses"
                                  ? "bg-violet-100 text-violet-700"
                                  : kind === "data"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-sky-100 text-primary",
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            {label}
                          </span>
                          <span className="block text-base leading-relaxed text-foreground">
                            {EXAMPLES[kind][index][0]}
                          </span>
                          <span className="mt-auto flex w-full items-center justify-between gap-2 pt-2 text-xs font-medium text-primary">
                            Use example
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15 motion-reduce:transition-none">
                              <ArrowRight className="size-3.5" />
                            </span>
                          </span>
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
                <Card aria-live="polite" className="gap-6 rounded-3xl border-0 bg-secondary/70 py-6 shadow-none sm:py-8">
                  <CardHeader className="space-y-3 px-5 sm:px-8">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10" aria-hidden="true">
                        <Spinner className="size-6 text-primary" />
                      </span>
                      <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
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
                    : "Example workflow · no live AI request"}
                </p>
              </div>
            )}
            {view === "answer" && current && (
              <div className="mx-auto max-w-3xl space-y-8">
                <QuestionBubble>{current.question}</QuestionBubble>
                <article
                  aria-label="Co-Scientist answer"
                  className="flex flex-col gap-6"
                >
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
                        : current.kind === "literature" &&
                            !current.result.scenario
                          ? "Direct answer"
                          : current.result.title}
                    </h2>
                    <p>{current.result.summary}</p>
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
                                <div className="divide-y">
                                  {current.result.sources.map((source) => (
                                    <a
                                      key={source.url}
                                      href={source.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => setReviewedId(current.id)}
                                      className="group flex items-start gap-3 rounded-md px-4 py-4 transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-primary"
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
                            className="relative overflow-hidden" aria-hidden="true" inert="">
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
              <div className={cn("mx-auto", books.length ? "flex min-h-0 flex-col xl:h-full" : "max-w-5xl space-y-8")}>
                {!books.length && (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Your notebooks
                    </h1>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      Findings, sources and your own thinking.
                    </p>
                  </div>
                  {books.length > 0 && <Button
                    className="rounded-md"
                    onClick={() => {
                      setName("");
                      setModal("new-book");
                    }}
                  >
                    <Plus />
                    New notebook
                  </Button>}
                </div>
                )}
                {!books.length ? (
                  <section aria-label="Empty notebook" className="flex min-h-[60svh] flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
                      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10" aria-hidden="true">
                        <NotebookPen className="size-8 text-primary" strokeWidth={1.5} />
                      </div>
                      <h2 className="max-w-md text-2xl font-semibold tracking-tight">
                        Keep useful findings together
                      </h2>
                      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                        Start in Chat, then save an answer and its sources here.
                        Add your notes and build on what you find.
                      </p>
                      <Button className="mt-7 h-11 rounded-md px-6 has-[>svg]:px-6" onClick={fresh}>
                        Start research
                        <ArrowRight />
                      </Button>
                  </section>
                ) : (
                  notebookDetail ? <NotebookWorkspace
                    books={books} book={book} finding={chatFinding}
                    onBook={(id) => { setBookId(id); setChatFindingId(null); }}
                    onFinding={setChatFindingId}
                    discussionOpen={discussionOpen}
                    onDiscuss={(id) => { setChatFindingId(id); setDiscussionOpen(true); }}
                    onNew={() => { setName(""); setModal("new-book"); }}
                    onRename={() => { setName(book.title); setModal("rename-book"); }}
                    onExport={exportBook} onResearch={fresh}
                    onOpen={(finding) => openRecord(records.find((record) => record.id === (finding.originResearchId || finding.id)) || finding)}
                    onEdit={editFinding} onNote={editNote} onRemove={removeFinding}
                    onConversation={(conversation) => setBooks((previous) => updateFinding(previous, book.id, chatFinding.id, { conversation }))}
                    onSaveReply={saveNotebookReply}
                    onBack={() => setNotebookDetail(false)}
                  /> : <NotebookLibrary books={books} onOpen={(id) => { setBookId(id); setChatFindingId(null); setNotebookDetail(true); }} onNew={() => { setName(""); setModal("new-book"); }} />
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
            <Button variant="ghost" size="icon" className="size-10 rounded-full text-foreground hover:bg-primary/15 hover:text-primary active:bg-primary/20 [&_svg]:size-4" aria-label="Close Notebook panel" onClick={() => setModal(null)}><X /></Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{modal === "save" ? savePanelContent : notebookPanelContent}</div>
        </aside>
          </motion.div>
        )}
        {discussionOpen && view === "notebook" && notebookDetail && desktopNotebook && chatFinding && <motion.div key="finding-discussion-panel" className="shrink-0 overflow-hidden" initial={{width:0,opacity:0}} animate={{width:392,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:reducedMotion ? 0 : 0.26,ease:[0.32,0.72,0,1]}}>
          <aside aria-label="Finding discussion sidebar" className="my-3 mr-3 h-[calc(100svh-1.5rem)] w-[380px] overflow-hidden rounded-3xl bg-background">
            <NotebookConversation key={`${book.id}-${chatFinding.id}`} finding={chatFinding} workspace detached onClose={() => setDiscussionOpen(false)} onConversation={(conversation) => setBooks((previous) => updateFinding(previous, book.id, chatFinding.id, {conversation}))} onSaveReply={saveNotebookReply} />
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
        <Sheet open onOpenChange={(open) => { if (!open) setModal(null); }}>
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
