import { NotebookSummary } from "./notebook-summary";
import { SearchInput } from "@/components/ui/search-input";
import { citedSummarySources, summaryNeedsReview } from "../notebook-summary";
import { CitationInsert, VersionComparison } from "./notebook-knowledge";
import { motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import { useNotebookSort, NotebookDragHandle } from "./notebook-sortable";
import { useState, useEffect, useContext, useId } from "react";
import {
  GripVertical,
  Plus,
  Check,
  ChevronDown,
  ListTree,
  ClipboardCheck,
  ListChecks,
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  Trash2,
  History,
  Bold,
  Bookmark,
  Italic,
  List,
  Heading2,
  Link,
} from "lucide-react";
import {
  NotebookButton as Button,
  NotebookInput as Input,
  NotebookHint,
  NotebookCheckbox,
} from "./notebook-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { markdown } from "../data.js";
import { commentsFor } from "../notebook-flows.js";
import { NoteNavigation } from "./note-navigation-context";
import { useNoteNavigation } from "./note-navigation-context";
export { formatNotebookDate as savedDate } from "../notebook-presentation.js";
import { formatNotebookDate as savedDate } from "../notebook-presentation.js";
export function jumpToBlock(bookId, findingId, commentId) {
  const eventName = commentId
    ? "notebook-open-comments"
    : "notebook-open-block";
  const reveal = () =>
    window.dispatchEvent(
      new CustomEvent(eventName, { detail: { bookId, findingId, commentId } }),
    );
  reveal();
  requestAnimationFrame(() => {
    reveal();
    requestAnimationFrame(() => {
      const el = document.getElementById(
        `${commentId ? "comments" : "block"}-${findingId}`,
      );
      el?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      el?.focus({ preventScroll: true });
    });
  });
}
export function ResearchPicker({
  book,
  records = [],
  onChange,
  onResearch,
  onNotify,
  open,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-4 overflow-hidden sm:max-w-xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add research</DialogTitle>
          <DialogDescription>
            Add as many existing results as you need. Each is saved as a
            separate copy.
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onResearch();
            }}
          >
            Start new research
            <ArrowUpRight />
          </Button>
        </div>
        <SearchInput
          className="shrink-0"
          aria-label="Find existing research"
          placeholder="Search existing research"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          clearLabel="Clear existing research search"
        />
        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1"
          aria-label="Existing research results"
        >
          {records
            .filter((r) =>
              r.question.toLowerCase().includes(query.toLowerCase()),
            )
            .map((r) => {
              const saved = book.findings.some((f) => f.id === r.id);
              return (
                <Button
                  key={r.id}
                  variant="secondary"
                  disabled={saved}
                  className="h-auto w-full justify-between whitespace-normal p-4 text-left disabled:opacity-100 disabled:text-muted-foreground"
                  onClick={() => {
                    try {
                      onChange(book.id, { type: "research-add", record: r });
                      onNotify("Research added to this notebook.");
                      setError("");
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  <span>
                    {r.question}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {saved
                        ? "Already saved"
                        : `${r.result.sources.length} sources · save a copy`}
                    </span>
                  </span>
                  {saved ? (
                    <Check className="shrink-0 text-primary" />
                  ) : (
                    <Plus className="shrink-0" />
                  )}
                </Button>
              );
            })}
          {!records.length && (
            <p className="text-base text-muted-foreground">
              No completed research yet.
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex shrink-0 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function NotebookOverview({ book, role, onChange }) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(null);
  const overviewId = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const guard = useNoteNavigation();
  const navigation = useContext(NoteNavigation),
    editorId = useId();
  useEffect(() => {
    navigation.editors.set(editorId, {
      dirty: !!text.trim(),
      canSave: role === "editor" && !!text.trim(),
      save: () => {
        if (run({ type: "task-add", text })) {
          setText("");
          return true;
        }
        return false;
      },
      discard: () => {
        setText("");
        return true;
      },
    });
    return () => navigation.editors.delete(editorId);
  });

  const run = (action) => {
    try {
      onChange(book.id, action);
      setError("");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };
  const sorting = useNotebookSort({
    group: "notebook-contents",
    items: book.findings,
    onNotify: (message) => setError(message),
    onMove: (id, direction) =>
      run({ type: "block-move", findingId: id, direction }),
    onPlace: (id, targetId) =>
      run({ type: "block-place", findingId: id, targetId }),
  });
  const open = book.findings.flatMap((f) =>
    commentsFor(f)
      .filter((c) => !c.resolved)
      .map((c) => ({ ...c, finding: f })),
  );
  return (
    <section
      className="overflow-hidden rounded-xl border bg-secondary/40"
      aria-label="Notebook overview"
    >
      <div
        className="grid gap-1 p-1 sm:grid-cols-3"
        role="group"
        aria-label="Notebook overview sections"
      >
        {[
          [
            "contents",
            ListTree,
            "Contents",
            `${book.findings.length} ${book.findings.length === 1 ? "block" : "blocks"}`,
          ],
          [
            "review",
            ClipboardCheck,
            "Overview",
            book.summary
              ? summaryNeedsReview(book)
                ? "Needs review"
                : "Summary saved"
              : "Write a summary",
          ],
          [
            "steps",
            ListChecks,
            "Next steps",
            `${(book.nextSteps || []).filter((t) => !t.done).length} remaining`,
          ],
        ].map(([key, Icon, title, info]) => (
          <Button
            key={key}
            static
            variant={active === key ? "tonal" : "ghost"}
            className="h-auto min-h-10 max-sm:min-h-11 w-full justify-start gap-2 rounded-lg px-3 py-1 text-left has-[>svg]:px-3"
            aria-label={title}
            aria-expanded={active === key}
            aria-controls={`${overviewId}-${key}`}
            onClick={() => setActive(active === key ? null : key)}
          >
            <Icon className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium leading-4">
                {title}
              </span>
              <span className="block text-xs font-normal leading-4 text-muted-foreground tabular-nums">
                {info}
              </span>
            </span>
            <ChevronDown
              className={`size-4 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none ${active === key ? "rotate-180" : ""}`}
            />
          </Button>
        ))}
      </div>
      <div
        id={`${overviewId}-contents`}
        role="region"
        aria-label="Contents"
        hidden={active !== "contents"}
        className="border-t p-3 sm:p-4"
      >
        <nav className="space-y-0.5" aria-label="Notebook contents">
          <span role="status" className="sr-only">
            {sorting.status}
          </span>
          {sorting.previewItems.map((f, i) => (
            <motion.div
              key={f.id}
              layout={reducedMotion ? false : "position"}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              style={{ opacity: sorting.dragging?.id === f.id ? 0.3 : 1 }}
              data-sort-group="notebook-contents"
              data-sort-id={f.id}
              className={`flex items-center gap-1 rounded-md ${sorting.target === f.id ? "bg-accent ring-1 ring-primary" : ""}`}
            >
              <NotebookDragHandle
                label={`contents item ${i + 1}`}
                {...sorting.handle(f.id, role !== "editor")}
              />
              <Button
                variant="ghost"
                className="h-auto min-h-8 w-full justify-start whitespace-normal px-2 py-1.5 text-left"
                onClick={() => guard(() => jumpToBlock(book.id, f.id))}
              >
                {String(i + 1).padStart(2, "0")} · {f.question}
              </Button>
            </motion.div>
          ))}
        </nav>
        {sorting.dragging &&
          createPortal(
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-[80] flex items-center gap-3 rounded-lg border border-primary/40 bg-white px-3 py-2 text-xs shadow-lg"
              style={{
                left: sorting.dragging.left,
                top: sorting.dragging.top,
                width: sorting.dragging.width,
                minHeight: sorting.dragging.height,
                transform: `translate3d(${sorting.dragging.dx}px,${sorting.dragging.dy}px,0)`,
              }}
            >
              <GripVertical className="size-4 shrink-0 text-primary" />
              {
                book.findings.find((f) => f.id === sorting.dragging.id)
                  ?.question
              }
            </div>,
            document.body,
          )}
      </div>
      <div
        id={`${overviewId}-review`}
        role="region"
        aria-label="Overview"
        hidden={active !== "review"}
        className="border-t p-3 sm:p-4"
      >
        <div className="space-y-3">
          <NotebookSummary book={book} role={role} onChange={onChange} />
          <div className="flex flex-col gap-3">
            <section
              className="min-w-0 rounded-lg border bg-white p-4"
              aria-label="Key evidence"
            >
              <h3 className="flex items-center gap-2 text-base font-medium">
                <BookOpen className="size-4 text-primary" /> Key evidence
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {citedSummarySources(book).length}{" "}
                  {citedSummarySources(book).length === 1
                    ? "source"
                    : "sources"}
                </span>
              </h3>
              {!citedSummarySources(book).length && (
                <p className="mt-2 text-[14px] text-muted-foreground">
                  Insert citations in your summary to show its supporting
                  evidence here.
                </p>
              )}
              <div className="mt-3 space-y-1">
                {citedSummarySources(book).map((s) => (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    key={s.url}
                    className="h-auto min-h-11 w-full justify-start gap-3 whitespace-normal px-2 py-2 text-left text-[14px] leading-snug hover:bg-secondary [&_svg]:shrink-0"
                  >
                    <a href={s.url} target="_blank" rel="noreferrer">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/60 text-primary">
                        <BookOpen className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block">{s.title}</span>
                        {(s.author || s.year) && (
                          <span className="mt-1 block text-xs font-normal text-muted-foreground">
                            {[s.author, s.year].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </a>
                  </Button>
                ))}
              </div>
            </section>
            <section
              className="min-w-0 rounded-lg border bg-white p-4"
              aria-label="Open questions"
            >
              <h3 className="flex items-center gap-2 text-base font-medium">
                <MessageCircle className="size-4 text-primary" /> Open questions
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {open.length}{" "}
                  {open.length === 1 ? "discussion" : "discussions"}
                </span>
              </h3>
              {open.map((c) => (
                <Button
                  key={c.id + c.finding.id}
                  variant="ghost"
                  className="mt-3 h-auto min-h-11 w-full justify-start gap-3 whitespace-normal px-2 py-2 text-left text-[14px] leading-snug hover:bg-secondary"
                  onClick={() =>
                    guard(() => jumpToBlock(book.id, c.finding.id, c.id))
                  }
                >
                  <span className="mt-1 size-1.5 shrink-0 self-start rounded-full bg-primary/50" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-3">{c.text}</span>
                    <span className="mt-1 line-clamp-2 text-xs font-normal text-muted-foreground">
                      {c.finding.question}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                </Button>
              ))}
              {!open.length && (
                <NotebookHint className="mt-2">
                  No open discussions.
                </NotebookHint>
              )}
            </section>
          </div>
        </div>
      </div>
      <div
        id={`${overviewId}-steps`}
        role="region"
        aria-label="Next steps"
        hidden={active !== "steps"}
        className="border-t p-3 sm:p-4"
      >
        <div className="space-y-3">
          <div className="space-y-0.5">
            {(book.nextSteps || []).map((t) => (
              <div className="flex items-center gap-2" key={t.id}>
                <label className="flex min-h-8 flex-1 items-center gap-2 py-1 text-[14px] max-sm:min-h-11">
                  <NotebookCheckbox
                    aria-label={t.text}
                    checked={t.done}
                    disabled={role !== "editor"}
                    onCheckedChange={() =>
                      run({ type: "task-toggle", taskId: t.id })
                    }
                  />
                  <span
                    className={
                      t.done ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {t.text}
                  </span>
                </label>
                {t.findingId &&
                  (book.findings.some((f) => f.id === t.findingId) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        guard(() =>
                          jumpToBlock(book.id, t.findingId, t.commentId),
                        )
                      }
                    >
                      {t.commentId ? "Discussion" : "Research"}
                      <ArrowUpRight />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Research removed
                    </span>
                  ))}
                {role === "editor" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove next step: ${t.text}`}
                    onClick={() => run({ type: "task-delete", taskId: t.id })}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {role === "editor" && (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (run({ type: "task-add", text })) setText("");
              }}
            >
              <Input
                className="min-w-0 flex-1"
                aria-label="New next step"
                placeholder="What needs to happen next?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button type="submit" disabled={!text.trim()}>
                <Plus />
                Add step
              </Button>
            </form>
          )}
          <NotebookHint>
            Saved on this device. No assignments or notifications.
          </NotebookHint>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
export function SourceEditor({
  bookId,
  finding,
  role,
  onChange,
  keySourceUrls = [],
}) {
  const [open, setOpen] = useState(false),
    [form, setForm] = useState({ title: "", url: "", author: "", year: "" }),
    [error, setError] = useState("");
  const guard = useNoteNavigation();
  const navigation = useContext(NoteNavigation),
    editorId = useId();
  const discard = () => {
    setForm({ title: "", url: "", author: "", year: "" });
    setOpen(false);
    return true;
  };
  useEffect(() => {
    navigation.editors.set(editorId, {
      dirty: open && Object.values(form).some((v) => v.trim()),
      canSave: !!form.title.trim() && !!form.url.trim(),
      save: () => save(),
      discard,
    });
    return () => navigation.editors.delete(editorId);
  });
  const save = (e) => {
    e?.preventDefault();
    try {
      onChange(bookId, { type: "source-add", findingId: finding.id, ...form });
      setForm({ title: "", url: "", author: "", year: "" });
      setOpen(false);
      setError("");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };
  return (
    <>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">
            Sources kept with this block
          </h3>
          {role === "editor" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => guard(() => setOpen(true))}
            >
              <Plus />
              Add source
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {finding.result.sources.map((s) => (
            <div key={s.url} className="flex items-center gap-1">
              <Button asChild variant="secondary" size="sm">
                <a href={s.url} target="_blank" rel="noreferrer">
                  <BookOpen />
                  {s.manual ? s.title : `${s.author}, ${s.year}`}
                  <ArrowUpRight />
                </a>
              </Button>
              {role === "editor" && (
                <Button
                  variant={keySourceUrls.includes(s.url) ? "tonal" : "ghost"}
                  size="icon-sm"
                  aria-label={`Key source: ${s.title}`}
                  aria-pressed={keySourceUrls.includes(s.url)}
                  onClick={() =>
                    onChange(bookId, { type: "key-source", url: s.url })
                  }
                >
                  <Bookmark
                    className={
                      keySourceUrls.includes(s.url)
                        ? "fill-primary text-primary"
                        : ""
                    }
                  />
                </Button>
              )}
              {s.manual && role === "editor" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove source ${s.title}`}
                  onClick={() => {
                    try {
                      onChange(bookId, {
                        type: "source-delete",
                        findingId: finding.id,
                        sourceId: s.id,
                      });
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          ))}
        </div>
        {!finding.result.sources.length && (
          <NotebookHint>
            No structured sources yet. Add the evidence supporting this block.
          </NotebookHint>
        )}
      </section>
      <Dialog
        open={open}
        onOpenChange={(value) =>
          value ? setOpen(true) : guard(() => setOpen(false))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add structured source</DialogTitle>
            <DialogDescription>
              This reference stays with the block and is included in citation
              exports.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {["title", "url", "author", "year"].map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`source-${finding.id}-${key}`}>
                  {key === "url" ? "URL" : key[0].toUpperCase() + key.slice(1)}
                  {["author", "year"].includes(key) ? " (optional)" : ""}
                </Label>
                <Input
                  id={`source-${finding.id}-${key}`}
                  required={["title", "url"].includes(key)}
                  type={key === "url" ? "url" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <Button type="submit">Add source</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function EditorExtras({
  finding,
  bookId,
  historyOnly,
  inputRef,
  draft,
  onDraft,
  onRestore,
  disabled,
}) {
  const [history, setHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [restoreError, setRestoreError] = useState("");
  useEffect(() => {
    const reveal = (e) => {
      if (
        e.detail.findingId === finding.id &&
        (!bookId || e.detail.bookId === bookId)
      ) {
        setHistory(true);
        setSelected(finding.versions?.at(-1)?.id || null);
      }
    };
    window.addEventListener("notebook-open-history", reveal);
    return () => window.removeEventListener("notebook-open-history", reveal);
  }, [bookId, finding.id, finding.versions]);
  const format = (start, end = "", placeholder = "text") => {
    const el = inputRef?.current;
    if (!el) return;
    const a = el.selectionStart,
      b = el.selectionEnd;
    const value = draft.slice(a, b) || placeholder;
    onDraft(draft.slice(0, a) + start + value + end + draft.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + start.length, a + start.length + value.length);
    });
  };
  return (
    <>
      {inputRef && (
        <CitationInsert
          finding={finding}
          inputRef={inputRef}
          draft={draft}
          onDraft={onDraft}
        />
      )}
      {inputRef && (
        <div
          className="flex flex-wrap gap-1"
          role="toolbar"
          aria-label="Block formatting"
        >
          {[
            [Bold, "Bold", "**", "**"],
            [Italic, "Italic", "*", "*"],
            [Heading2, "Heading", "\n## ", ""],
            [List, "Bullet list", "\n- ", ""],
            [Link, "Link", "[", "](https://example.com)"],
          ].map(([Icon, label, start, end]) => (
            <Button
              type="button"
              key={label}
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              onClick={() => format(start, end)}
            >
              <Icon />
            </Button>
          ))}
        </div>
      )}
      {!historyOnly && onRestore && !!finding.versions?.length && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !finding.versions?.length}
          onClick={() => setHistory(true)}
        >
          <History />
          Version history · {finding.versions?.length || 0}
        </Button>
      )}
      <Dialog open={history} onOpenChange={setHistory}>
        <DialogContent className="flex max-h-[85svh] flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-6 pb-4 pt-6 pr-14">
            <DialogTitle>Previous versions</DialogTitle>
            <DialogDescription>
              The last five saved versions are kept on this device. Restoring
              preserves sources and comments.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 pb-6">
            {finding.versions?.map((v, i) => (
              <Button
                key={v.id}
                variant={selected === v.id ? "tonal" : "secondary"}
                className="w-full justify-start"
                onClick={() => setSelected(v.id)}
              >
                Version {i + 1} · {savedDate(v.savedAt)}
              </Button>
            ))}
            {selected && finding.versions.some((v) => v.id === selected) && (
              <VersionComparison
                finding={finding}
                version={finding.versions.find((v) => v.id === selected)}
              />
            )}
          </div>
          <div className="shrink-0 space-y-3 border-t bg-background px-6 py-4">
            {restoreError && (
              <p role="alert" className="text-xs text-destructive">
                {restoreError}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setHistory(false)}>
                Cancel
              </Button>
              <Button
                disabled={
                  !selected ||
                  !finding.versions?.some((v) => v.id === selected) ||
                  !onRestore ||
                  disabled
                }
                onClick={() => {
                  try {
                    onRestore(selected);
                    setHistory(false);
                    setRestoreError("");
                  } catch (e) {
                    setRestoreError(e.message);
                  }
                }}
              >
                Restore selected version
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
