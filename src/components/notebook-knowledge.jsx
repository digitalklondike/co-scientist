import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ListTree,
  Link2,
  Plus,
  ArrowUpRight,
  X,
  BookOpen,
} from "lucide-react";
import {
  NotebookButton as Button,
  NotebookInput as Input,
} from "./notebook-ui";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Label } from "./ui/label";
import { markdown } from "../data";
import {
  blockHash,
  notebookSections,
  NOTEBOOK_TEMPLATES,
  versionDifference,
} from "../notebook-knowledge";
import { useNoteNavigation } from "./note-navigation-context";

export function NotebookTemplateSelect() {
  return (
    <div className="space-y-2">
      <Label htmlFor="notebook-template">Starting structure</Label>
      <select
        id="notebook-template"
        name="notebookTemplate"
        defaultValue="blank"
        className="h-11 w-full rounded-md border bg-white px-3 text-base"
      >
        {NOTEBOOK_TEMPLATES.map((t) => (
          <option value={t.id} key={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      <p className="text-[14px] text-muted-foreground">
        Templates provide editable sections. Research and sources are added by
        you.
      </p>
    </div>
  );
}

export function CitationPreview({ source, children }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Preview source: ${source.title}`}
          className="inline rounded text-primary underline decoration-primary/40 underline-offset-4 hover:bg-accent focus-visible:outline-2"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 max-w-[calc(100vw-32px)] space-y-3"
        aria-label="Source preview"
      >
        <p className="text-base font-medium">{source.title}</p>
        <p className="text-[14px] text-muted-foreground">
          {source.author || "Author not recorded"}
          {source.year ? ` · ${source.year}` : ""}
        </p>
        <p className="break-all text-xs text-muted-foreground">{source.url}</p>
        <Button asChild variant="secondary" size="sm">
          <a href={source.url} target="_blank" rel="noreferrer">
            Open original source
            <ArrowUpRight />
          </a>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function CitationInsert({ finding, inputRef, draft, onDraft }) {
  const [open, setOpen] = useState(false);
  const selection = useRef({ start: 0, end: 0 });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            selection.current = {
              start: inputRef.current?.selectionStart ?? draft.length,
              end: inputRef.current?.selectionEnd ?? draft.length,
            };
          }}
          disabled={!finding.result.sources.length}
        >
          <BookOpen />
          Insert citation
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-72 w-80 max-w-[calc(100vw-32px)] space-y-2 overflow-y-auto"
        aria-label="Choose citation"
      >
        <p className="text-[14px] text-muted-foreground">
          Choose a saved source for the statement at your cursor.
        </p>
        {finding.result.sources.map((s, i) => (
          <Button
            key={s.url}
            variant="ghost"
            type="button"
            className="h-auto w-full justify-start whitespace-normal text-left"
            onClick={() => {
              const { start, end } = selection.current;
              const insert = ` [${i + 1}](<${s.url}>)`;
              onDraft(
                draft.slice(0, start) +
                  draft.slice(start, end) +
                  insert +
                  draft.slice(end),
              );
              setOpen(false);
              requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.setSelectionRange(
                  end + insert.length,
                  end + insert.length,
                );
              });
            }}
          >
            [{i + 1}] {s.title}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function VersionComparison({ finding, version }) {
  const differences = versionDifference(version.text, markdown(finding));
  const oldSources = version.sources;
  const current = finding.result.sources;
  const removed = oldSources?.filter(
    (s) => !current.some((c) => c.url === s.url),
  );
  const added =
    oldSources &&
    current.filter((s) => !oldSources.some((c) => c.url === s.url));
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-muted-foreground">
        Previous → current. Added text is green; removed text is red and struck
        through.
      </p>
      <div
        className="rounded-lg border text-[14px] leading-6"
        aria-label="Version differences"
      >
        {differences.map((d, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap break-words px-3 ${d.type === "add" ? "bg-green-50 text-green-900" : d.type === "remove" ? "bg-red-50 text-red-900 line-through" : "text-muted-foreground"}`}
          >
            <span
              className="mr-2 inline-block w-3 font-medium"
              aria-label={d.type}
            >
              {d.type === "add" ? "+" : d.type === "remove" ? "−" : " "}
            </span>
            {d.text || " "}
          </p>
        ))}
      </div>
      <p className="text-[14px] font-medium">Source changes</p>
      {oldSources ? (
        <>
          <p className="text-[14px] text-muted-foreground">
            {added.length} added · {removed.length} removed
          </p>
          {added.map((s) => (
            <p key={s.url} className="text-[14px] text-green-900">
              + {s.title}
            </p>
          ))}
          {removed.map((s) => (
            <p key={s.url} className="text-[14px] text-red-900">
              − {s.title}
            </p>
          ))}
        </>
      ) : (
        <p className="text-[14px] text-muted-foreground">
          Source history was not recorded for this older version.
        </p>
      )}
      <p className="text-[14px] text-muted-foreground">
        Restoring changes the text only. Current sources and discussions are
        retained.
      </p>
    </div>
  );
}

export function ContextStepDialog({
  book,
  context,
  onClose,
  onChange,
  onNotify,
}) {
  const [text, setText] = useState(context?.text || "");
  const [error, setError] = useState("");
  useEffect(() => {
    setText(context?.text || "");
    setError("");
  }, [context]);
  return (
    <Dialog open={!!context} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create next step</DialogTitle>
          <DialogDescription>
            Keep this task linked to its research or discussion.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              onChange(book.id, {
                type: "task-add",
                text,
                findingId: context.findingId,
                commentId: context.commentId,
              });
              onNotify("Next step added with its context.");
              onClose();
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          <Label htmlFor="context-step">Next step</Label>
          <Input
            autoFocus
            id="context-step"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <p className="text-[14px] text-muted-foreground">
            From:{" "}
            {book.findings.find((f) => f.id === context?.findingId)?.question}
          </p>
          {error && (
            <p role="alert" className="text-destructive text-[14px]">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!text.trim()}>Add step</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NotebookNavigator({ book, collapsed, onReveal }) {
  const guard = useNoteNavigation();
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(null);
  const current = useRef(null);
  const restoring = useRef(false);
  const [dock, setDock] = useState(null);
  const go = (findingId, sectionId = "", immediate = false) =>
    guard(() => {
      onReveal(findingId);
      setOpen(false);
      window.dispatchEvent(
        new CustomEvent("notebook-open-block", {
          detail: { bookId: book.id, findingId },
        }),
      );
      requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent("notebook-open-block", {
            detail: { bookId: book.id, findingId },
          }),
        );
        requestAnimationFrame(() => {
          const el =
            document.getElementById(sectionId || `block-${findingId}`) ||
            document.getElementById(`block-${findingId}`);
          el?.scrollIntoView({
            block: "start",
            behavior:
              immediate ||
              matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
          });
          el?.focus({ preventScroll: true });
          if (immediate) {
            let frames = 6;
            const align = () => {
              el?.scrollIntoView({ block: "start", behavior: "instant" });
              if (--frames > 0) requestAnimationFrame(align);
              else {
                restoring.current = false;
                window.dispatchEvent(new Event("scroll"));
              }
            };
            requestAnimationFrame(align);
          }
        });
      });
    });
  useEffect(() => {
    restoring.current = false;
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(`cosci-reading:${book.id}`));
    } catch {}
    if (
      saved &&
      book.findings.some((f) => f.id === saved.findingId) &&
      !location.hash.includes("notebook=")
    ) {
      restoring.current = true;
      go(saved.findingId, saved.sectionId, true);
    }
    const area = document
      .getElementById(`block-${book.findings[0]?.id}`)
      ?.closest("[data-notebook-scroll]");
    let scrollArea = area;
    while (
      scrollArea &&
      !/(auto|scroll)/.test(getComputedStyle(scrollArea).overflowY)
    )
      scrollArea = scrollArea.parentElement;
    let frame;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const column = area?.firstElementChild;
        const bounds = column?.getBoundingClientRect();
        const edge = scrollArea?.getBoundingClientRect().top || 0;
        const first = document.getElementById(`block-${book.findings[0]?.id}`);
        const reading =
          !!first && first.getBoundingClientRect().top <= edge + 8;
        setDock(
          reading && bounds
            ? { top: edge, left: bounds.left, width: bounds.width }
            : null,
        );
        if (restoring.current) return;
        const root = document.querySelector("[data-notebook-nav]");
        const top =
          (reading ? root?.getBoundingClientRect().bottom || edge + 44 : edge) +
          16;
        const blocks = [
          ...document.querySelectorAll('[data-testid="saved-finding"]'),
        ];
        const visible = blocks.find(
          (el) =>
            el.getBoundingClientRect().bottom > top &&
            el.getBoundingClientRect().top < innerHeight,
        );
        if (!visible) return;
        const id = visible.id.slice(6);
        const headers = [
          ...visible.querySelectorAll("[data-notebook-section]"),
        ];
        const heading = headers
          .filter((h) => h.getBoundingClientRect().top <= top + 64)
          .at(-1);
        const next = { findingId: id, sectionId: heading?.id || "" };
        if (JSON.stringify(next) !== JSON.stringify(current.current)) {
          current.current = next;
          setActive(next);
          try {
            localStorage.setItem(
              `cosci-reading:${book.id}`,
              JSON.stringify(next),
            );
          } catch {}
        }
      });
    };
    area?.addEventListener("scroll", read);
    window.addEventListener("scroll", read, true);
    window.addEventListener("resize", read);
    read();
    return () => {
      cancelAnimationFrame(frame);
      area?.removeEventListener("scroll", read);
      window.removeEventListener("scroll", read, true);
      window.removeEventListener("resize", read);
    };
  }, [book.id]);
  return (
    <div
      data-notebook-nav
      hidden={!dock}
      style={dock || { display: "none" }}
      className="fixed z-20 flex items-center gap-3 rounded-b-lg border border-t-0 bg-white px-2 py-1"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="sm" aria-label="Navigate notebook">
            <ListTree />
            Contents
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="max-h-[65svh] w-[min(420px,calc(100vw-32px))] overflow-y-auto p-2"
          aria-label="Navigate notebook sections"
        >
          <nav>
            {book.findings.map((f, i) => (
              <div key={f.id} className="mb-2">
                <Button
                  variant={
                    active?.findingId === f.id && !active.sectionId
                      ? "tonal"
                      : "ghost"
                  }
                  className="h-auto w-full justify-start whitespace-normal text-left"
                  onClick={() => go(f.id)}
                >
                  {String(i + 1).padStart(2, "0")} · {f.question}
                </Button>
                {notebookSections(markdown(f), f.id).map((s) => (
                  <Button
                    key={s.id}
                    variant={active?.sectionId === s.id ? "tonal" : "ghost"}
                    className="ml-5 h-auto min-h-8 w-[calc(100%-20px)] justify-start whitespace-normal text-left"
                    size="sm"
                    onClick={() => go(f.id, s.id)}
                  >
                    {s.title}
                  </Button>
                ))}
              </div>
            ))}
          </nav>
        </PopoverContent>
      </Popover>
      <p className="min-w-0 truncate text-xs text-muted-foreground">
        {notebookSections(
          markdown(
            book.findings.find((f) => f.id === active?.findingId) || {
              result: { summary: "", sources: [] },
            },
          ),
          active?.findingId,
        ).find((s) => s.id === active?.sectionId)?.title ||
          book.findings.find((f) => f.id === active?.findingId)?.question ||
          "Navigate research and sections"}
      </p>
    </div>
  );
}
