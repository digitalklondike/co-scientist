import { useEffect } from "react";
import { NotebookNavigator, ContextStepDialog } from "./notebook-knowledge";
import { blockHash } from "../notebook-knowledge";
import {
  ResearchPicker,
  NotebookOverview,
  SourceEditor,
  savedDate,
} from "./notebook-enhancements";
import { useState } from "react";
import {
  BookOpen,
  FileText,
  Plus,
  Pencil,
  Download,
  ArrowUpRight,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  NotebookPen,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Link2,
  ListChecks,
  History,
} from "lucide-react";

import { NotebookButton as Button, NotebookCount } from "./notebook-ui";
import { NotebookInput as Input } from "./notebook-ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { FindingContent } from "./notebook-content";
import { NotebookNote } from "./notebook-notes";
import { NotebookTools } from "./notebook-tools";
import { useNoteNavigation } from "./note-navigation-context";
export { NotebookLibrary } from "./notebook-library";

export function NotebookWorkspace({
  book,
  books = [],
  onBook,
  records,
  finding,
  onFinding,
  onNew,
  onRename,
  onExport,
  onResearch,
  onOpen,
  onEdit,
  onRemove,
  onNote,
  onNotify,
  onConversation,
  onSaveReply,
  onBack,
  onDiscuss,
  discussionOpen,
  onChange,
  onCloseDiscussion,
}) {
  const guard = useNoteNavigation();
  const [previewRole, setPreviewRole] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [stepContext, setStepContext] = useState(null);
  useEffect(() => {
    const reveal = (e) => {
      if (e.detail.bookId === book.id)
        setCollapsed((p) => ({ ...p, [e.detail.findingId]: false }));
    };
    const step = (e) => {
      if (e.detail.bookId === book.id) setStepContext(e.detail);
    };
    window.addEventListener("notebook-open-block", reveal);
    window.addEventListener("notebook-open-comments", reveal);
    window.addEventListener("notebook-create-step", step);
    return () => {
      window.removeEventListener("notebook-open-block", reveal);
      window.removeEventListener("notebook-open-comments", reveal);
      window.removeEventListener("notebook-create-step", step);
    };
  }, [book.id]);

  const [addAfter, setAddAfter] = useState(null);
  const [researchPicker, setResearchPicker] = useState(false);
  const role = previewRole || book.accessRole || "editor";
  const run = (action) => {
    try {
      onChange(book.id, action);
    } catch (e) {
      onNotify(e.message, undefined, "error");
    }
  };
  return (
    <div
      data-notebook-scroll
      className="min-h-0 min-w-0 flex-1 xl:overflow-y-auto xl:overscroll-contain xl:px-8 xl:py-8"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-6">
        <Button
          variant="ghost"
          className="-ml-4 w-fit shrink-0 !px-4"
          onClick={onBack}
        >
          <ArrowLeft />
          All notebooks
        </Button>
        {!!book.findings.length && (
          <NotebookNavigator
            key={`navigation-${book.id}`}
            book={book}
            collapsed={collapsed}
            onReveal={(id) => setCollapsed((p) => ({ ...p, [id]: false }))}
          />
        )}
        <section
          aria-label="Notebook header"
          className="-mx-4 space-y-4 rounded-2xl bg-secondary/70 p-4 sm:-mx-6 sm:p-6"
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h1 className="break-words text-[32px] font-semibold leading-[40px] tracking-tight">
                {book.title}
              </h1>
              <NotebookCount>
                {book.findings.length} saved{" "}
                {book.findings.length === 1 ? "block" : "blocks"}
              </NotebookCount>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="tonal"
                onClick={() => guard(() => setResearchPicker(true))}
                disabled={role !== "editor"}
              >
                <Plus />
                Add research
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notebook actions"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={role !== "editor"}
                    onClick={onRename}
                  >
                    <Pencil />
                    Rename notebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download />
                    Export notebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNew}>
                    <Plus />
                    New notebook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <p className="text-base leading-relaxed text-muted-foreground">
            Saved research and your own blocks, with sources and comments.
          </p>
        </section>
        {previewRole && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-accent/40 p-4"
          >
            <p className="text-xs">
              Previewing as {previewRole} · actions reflect this role
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => guard(() => setPreviewRole(null))}
            >
              Exit role preview
            </Button>
          </div>
        )}
        <NotebookTools
          key={book.id}
          book={book}
          role={role}
          onChange={onChange}
          onNotify={onNotify}
          onPreview={(next) =>
            guard(() => {
              onCloseDiscussion?.();
              setPreviewRole(next);
            })
          }
          addAfter={addAfter}
          onClearAfter={() => setAddAfter(null)}
        />
        <ResearchPicker
          book={book}
          records={records}
          onChange={onChange}
          onResearch={onResearch}
          onNotify={onNotify}
          open={researchPicker}
          onClose={() => setResearchPicker(false)}
        />
        {!!book.findings.length && (
          <NotebookOverview book={book} role={role} onChange={onChange} />
        )}
        {!book.findings.length ? (
          <div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
            <FileText className="size-8 text-primary" />
            <h2 className="text-2xl font-semibold">
              Ready for your first block
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Save an answer from Chat or add your own block to start this
              collection.
            </p>
            <Button
              disabled={role !== "editor"}
              onClick={() => guard(() => setResearchPicker(true))}
            >
              Start research
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {book.findings.map((block, index) => (
              <article
                key={`${book.id}-${block.id}`}
                data-testid="saved-finding"
                id={`block-${block.id}`}
                tabIndex={-1}
                aria-label="Saved answer block"
                className="scroll-mt-28 min-w-0 space-y-6 rounded-2xl border border-border bg-white p-4 sm:p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="space-y-2">
                  <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      aria-label={`Saved answer ${index + 1}`}
                      className={`flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold tabular-nums text-primary `}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {block.origin === "excerpt"
                        ? "Saved from selected answer text"
                        : block.origin === "personal"
                          ? "Written by you"
                          : (block.originResearchId &&
                                block.originResearchId !== block.id) ||
                              /notebook/i.test(block.result.title || "")
                            ? "Saved from a notebook conversation"
                            : "Saved from research"}
                    </p>
                    <p className="text-xs text-muted-foreground sm:ml-auto sm:text-right">
                      {(block.editedAt || block.savedAt) &&
                      savedDate(block.editedAt || block.savedAt) !==
                        "date unavailable"
                        ? savedDate(block.editedAt || block.savedAt)
                        : ""}
                    </p>
                  </div>
                  {block.originQuestion &&
                    block.originQuestion !== block.question && (
                      <p className="text-xs text-muted-foreground">
                        Original research: {block.originQuestion}
                      </p>
                    )}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 basis-full text-2xl font-semibold leading-tight tracking-tight [text-wrap:balance] sm:basis-0">
                      {block.question}
                    </h2>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        aria-label={`${collapsed[block.id] ? "Expand" : "Collapse"} research ${index + 1}`}
                        aria-expanded={!collapsed[block.id]}
                        onClick={() =>
                          guard(() =>
                            setCollapsed((p) => ({
                              ...p,
                              [block.id]: !p[block.id],
                            })),
                          )
                        }
                      >
                        <ChevronDown
                          className={collapsed[block.id] ? "-rotate-90" : ""}
                        />
                      </Button>
                      {block.origin !== "personal" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          tooltip="Open original research. This notebook copy stays saved."
                          onClick={() => onOpen(block)}
                        >
                          Open research
                          <ArrowUpRight />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            aria-label={`Actions for saved answer ${index + 1}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              const url = new URL(location.href);
                              url.hash = blockHash(book.id, block.id);
                              navigator.clipboard.writeText(url.href).then(
                                () =>
                                  onNotify(
                                    "Local link copied. Opens this block on this device.",
                                  ),
                                () =>
                                  onNotify(
                                    "Couldn’t copy link.",
                                    undefined,
                                    "error",
                                  ),
                              );
                            }}
                          >
                            <Link2 />
                            Copy link to block
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={role !== "editor"}
                            onClick={() =>
                              guard(() =>
                                setStepContext({
                                  findingId: block.id,
                                  text: "",
                                }),
                              )
                            }
                          >
                            <ListChecks />
                            Create next step
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!block.versions?.length}
                            onClick={() =>
                              guard(() => {
                                setCollapsed((p) => ({
                                  ...p,
                                  [block.id]: false,
                                }));
                                requestAnimationFrame(() =>
                                  window.dispatchEvent(
                                    new CustomEvent("notebook-open-history", {
                                      detail: {
                                        bookId: book.id,
                                        findingId: block.id,
                                      },
                                    }),
                                  ),
                                );
                              })
                            }
                          >
                            <History />
                            Version history
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={role !== "editor" || index === 0}
                            onClick={() =>
                              guard(() =>
                                run({
                                  type: "block-move",
                                  findingId: block.id,
                                  direction: -1,
                                }),
                              )
                            }
                          >
                            <ArrowUp />
                            Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={
                              role !== "editor" ||
                              index === book.findings.length - 1
                            }
                            onClick={() =>
                              guard(() =>
                                onChange(book.id, {
                                  type: "block-move",
                                  findingId: block.id,
                                  direction: 1,
                                }),
                              )
                            }
                          >
                            <ArrowDown />
                            Move down
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={role !== "editor"}
                            onClick={() => guard(() => setAddAfter(block.id))}
                          >
                            <Plus />
                            Insert block below
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={role !== "editor"}
                            onClick={() => onRemove(block.id)}
                          >
                            <Trash2 className="text-destructive" />
                            Remove from notebook
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                {collapsed[block.id] ? (
                  <p className="line-clamp-2 text-base text-muted-foreground">
                    {block.result.summary
                      .split(/^## /m)[0]
                      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")}
                  </p>
                ) : (
                  <>
                    <FindingContent
                      finding={block}
                      bookId={book.id}
                      readOnly={role !== "editor"}
                      documentView
                      onSave={(content) => onEdit(block.id, content)}
                      onRestore={(versionId) =>
                        onChange(book.id, {
                          type: "block-restore",
                          findingId: block.id,
                          versionId,
                        })
                      }
                      onDiscuss={
                        role === "editor"
                          ? () => onDiscuss(block.id)
                          : undefined
                      }
                    />
                    <SourceEditor
                      bookId={book.id}
                      finding={block}
                      role={role}
                      onChange={onChange}
                    />
                    <NotebookNote
                      key={`${book.id}:${block.id}`}
                      bookId={book.id}
                      finding={block}
                      onSave={onChange}
                      onNotify={onNotify}
                      role={role}
                    />
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <ContextStepDialog
        book={book}
        context={stepContext}
        onClose={() => setStepContext(null)}
        onChange={onChange}
        onNotify={onNotify}
      />
    </div>
  );
}
