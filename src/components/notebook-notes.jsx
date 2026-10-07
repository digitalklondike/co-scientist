import { useContext, useEffect, useId, useRef, useState } from "react";
import {
  MessageSquare,
  ChevronDown,
  Reply,
  CheckCheck,
  Check,
  Pencil,
  Trash2,
  ListChecks,
} from "lucide-react";
import {
  NotebookButton as Button,
  NotebookCount,
  NotebookHint,
} from "./notebook-ui";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { readNoteDraft, clearNoteDraft } from "../notebook-notes.js";
import { NoteNavigation } from "./note-navigation-context.js";
import { commentsFor } from "../notebook-flows.js";

export function NotebookNotesProvider({ children }) {
  const editors = useRef(new Map());
  const continuation = useRef(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const dirtyEditors = () =>
    [...editors.current.values()].filter((editor) => editor.dirty);
  useEffect(() => {
    const warn = (event) => {
      if (!dirtyEditors().length) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const request = (action) => {
    const dirty = dirtyEditors();
    if (!dirty.length) {
      action();
      return;
    }
    continuation.current = action;
    setPending(dirty);
  };
  const proceed = async (save) => {
    setBusy(true);
    for (const editor of dirtyEditors()) {
      if (save && !(await editor.save())) {
        setBusy(false);
        setPending(null);
        return;
      }
      if (!save && !editor.discard()) {
        setBusy(false);
        setPending(null);
        return;
      }
    }
    const action = continuation.current;
    continuation.current = null;
    setBusy(false);
    setPending(null);
    action?.();
  };
  return (
    <NoteNavigation.Provider value={{ request, editors: editors.current }}>
      {children}
      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your changes before leaving?</DialogTitle>
            <DialogDescription>
              Your changes haven’t been saved to the notebook. Save them,
              discard them, or stay here to keep editing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-wrap">
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              Keep editing
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => proceed(false)}
            >
              Discard changes
            </Button>
            <Button
              disabled={busy || pending?.some((editor) => !editor.canSave)}
              onClick={() => proceed(true)}
            >
              {busy && <Spinner />}Save and leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NoteNavigation.Provider>
  );
}

export function NotebookNote({
  bookId,
  finding,
  onSave,
  onNotify,
  role = "editor",
}) {
  const navigation = useContext(NoteNavigation);
  const editorId = useId();
  const sectionRef = useRef(null);
  const inputRef = useRef(null);
  const comments = commentsFor(finding);
  const [restored] = useState(() =>
    readNoteDraft(localStorage, bookId, finding.id),
  );
  const [draft, setDraft] = useState(restored?.text || "");
  const [mode, setMode] = useState(restored?.mode || "add");
  const [replyTarget, setReplyTarget] = useState(restored?.replyTarget || null);
  const [target, setTarget] = useState(restored?.target || null);
  const [base, setBase] = useState(restored?.mode ? restored.base : "");
  const [composer, setComposer] = useState(!!restored?.text);
  const [expanded, setExpanded] = useState(
    () => !!restored?.text || commentsFor(finding).some((c) => !c.resolved),
  );
  const [showResolved, setShowResolved] = useState(false);
  const [all, setAll] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState(
    restored ? "Unsaved draft restored. Review before posting." : "",
  );
  useEffect(() => {
    const reveal = (event) => {
      if (
        event.detail.bookId !== bookId ||
        event.detail.findingId !== finding.id
      )
        return;
      setExpanded(true);
      setShowResolved(true);
      setAll(true);
    };
    window.addEventListener("notebook-open-comments", reveal);
    return () => window.removeEventListener("notebook-open-comments", reveal);
  }, [bookId, finding.id]);
  const dirty = composer && draft !== base;
  const canSave = dirty && !!draft.trim() && role !== "viewer";
  const visible = comments.filter((c) => showResolved || !c.resolved);
  const resolvedCount = comments.filter((c) => c.resolved).length;
  const date = (value) =>
    value
      ? new Date(value).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Previous note";
  function clear() {
    try {
      clearNoteDraft(localStorage, bookId, finding.id);
      return true;
    } catch {
      return false;
    }
  }
  function discard() {
    if (!clear()) {
      setError("Couldn’t discard your recovery draft. Try again.");
      return false;
    }
    setDraft("");
    setBase("");
    setMode("add");
    setTarget(null);
    setComposer(false);
    setWarning("");
    setError("");
    navigation.editors.delete(editorId);
    return true;
  }
  function change(text) {
    setDraft(text);
    setError("");
    try {
      localStorage.setItem(
        `cosci-note-draft:${bookId}:${finding.id}`,
        JSON.stringify({ text, base, mode, target, replyTarget }),
      );
      setWarning("");
    } catch {
      setWarning(
        "Draft recovery unavailable. Keep this page open until you post.",
      );
    }
  }
  async function save() {
    if (!canSave) return false;
    setSaving(true);
    setError("");
    try {
      await onSave(bookId, {
        type:
          mode === "reply-edit"
            ? "comment-reply-edit"
            : mode === "edit"
              ? "comment-edit"
              : mode === "reply"
                ? "comment-reply"
                : "comment-add",
        findingId: finding.id,
        commentId: target,
        replyId: replyTarget,
        text: draft,
      });
      const cleared = clear();
      setDraft("");
      setBase("");
      setComposer(false);
      setMode("add");
      setTarget(null);
      setExpanded(true);
      setWarning(
        cleared
          ? ""
          : "Comment saved. The recovery draft could not be cleared.",
      );
      navigation.editors.delete(editorId);
      onNotify(
        mode.includes("edit")
          ? "Comment updated."
          : mode === "reply"
            ? "Reply posted."
            : "Comment posted.",
      );
      return true;
    } catch (e) {
      setError(`Couldn’t save. ${e.message} Your draft is still here.`);
      sectionRef.current?.scrollIntoView({ block: "center" });
      return false;
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    navigation.editors.set(editorId, { dirty, canSave, save, discard });
    return () => navigation.editors.delete(editorId);
  });
  function start(nextMode = "add", comment = null, reply = null) {
    navigation.request(() => {
      setMode(nextMode);
      setReplyTarget(reply?.id || null);
      setTarget(comment?.id || null);
      setDraft(
        nextMode === "reply-edit"
          ? reply.text
          : nextMode === "edit"
            ? comment.text
            : "",
      );
      setBase(
        nextMode === "reply-edit"
          ? reply.text
          : nextMode === "edit"
            ? comment.text
            : "",
      );
      setComposer(true);
      setExpanded(true);
      setError("");
      setWarning("");
      requestAnimationFrame(() => inputRef.current?.focus());
    });
  }
  async function action(comment, type) {
    try {
      const result = await onSave(bookId, {
        type,
        findingId: finding.id,
        commentId: comment.id,
        resolved: !comment.resolved,
      });
      if (type === "comment-delete")
        onNotify("Comment deleted.", {
          label: "Undo",
          run: () => {
            try {
              onSave(bookId, {
                type: "comment-restore",
                findingId: finding.id,
                comment: result?.removedComment || comment,
                index:
                  result?.deletedIndex ??
                  comments.findIndex((c) => c.id === comment.id),
              });
            } catch {
              onNotify("Couldn’t restore this comment.", undefined, "error");
            }
          },
        });
      else
        onNotify(
          comment.resolved ? "Discussion reopened." : "Discussion resolved.",
        );
    } catch (e) {
      setError(e.message);
    }
  }
  async function removeReply(comment, reply) {
    try {
      const result = await onSave(bookId, {
        type: "comment-reply-delete",
        findingId: finding.id,
        commentId: comment.id,
        replyId: reply.id,
      });
      onNotify("Reply deleted.", {
        label: "Undo",
        run: () => {
          try {
            onSave(bookId, {
              type: "comment-reply-restore",
              findingId: finding.id,
              commentId: comment.id,
              reply: result?.removedReply || reply,
              index: result?.replyIndex ?? 0,
            });
          } catch {
            onNotify(
              "Couldn’t restore reply. Its discussion may have been removed.",
              undefined,
              "error",
            );
          }
        },
      });
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section
      ref={sectionRef}
      id={`comments-${finding.id}`}
      tabIndex={-1}
      aria-label={`Comments for ${finding.question}`}
      className={`scroll-mt-6 space-y-4 rounded-2xl border border-border bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-ring ${expanded ? "p-4 sm:p-6" : "px-4 py-2"}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`comment-list-${editorId}`}
          onClick={() => navigation.request(() => setExpanded(!expanded))}
          className="flex min-h-10 items-center gap-2 rounded-md max-sm:min-h-11 text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MessageSquare className="size-4" />
          </span>
          Comments
          <NotebookCount>
            {comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)}
          </NotebookCount>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        {!composer && role !== "viewer" && (
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => start()}
          >
            <MessageSquare />
            Add comment
          </Button>
        )}
      </header>
      {expanded && (
        <div id={`comment-list-${editorId}`} className="space-y-4">
          {!!resolvedCount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
            >
              <CheckCheck />
              {showResolved ? "Hide" : "Show"} {resolvedCount} resolved
            </Button>
          )}
          {!visible.length && !composer && (
            <NotebookHint>
              {resolvedCount
                ? "All discussions resolved."
                : "Capture an observation, question or next step for this block."}
            </NotebookHint>
          )}
          {(all ? visible : visible.slice(0, 3)).map((comment) => (
            <article
              key={comment.id}
              className={`space-y-3 rounded-xl bg-white p-4 ${comment.resolved ? "border border-border" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {comment.author === "You"
                      ? "Y"
                      : comment.author.slice(0, 1)}
                  </span>
                  <span className="text-xs font-semibold">
                    {comment.author}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {date(comment.createdAt)}
                    {comment.editedAt ? " · Edited" : ""}
                  </span>
                </div>
                {comment.resolved && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCheck className="size-3.5" />
                    Resolved
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.5]">
                {comment.text}
              </p>
              {!!comment.replies?.length && (
                <div className="space-y-3 border-s-2 border-accent ps-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id}>
                      <p className="mb-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {reply.author}
                        </span>{" "}
                        · {date(reply.createdAt)}
                        {reply.editedAt ? " · Edited" : ""}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.5]">
                        {reply.text}
                      </p>
                      {role !== "viewer" && reply.author === "You" && (
                        <div className="mt-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => start("reply-edit", comment, reply)}
                          >
                            <Pencil />
                            Edit reply
                          </Button>
                          <Button
                            variant="danger-ghost"
                            size="sm"
                            onClick={() =>
                              navigation.request(() =>
                                removeReply(comment, reply),
                              )
                            }
                          >
                            <Trash2 />
                            Delete reply
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {role !== "viewer" && (
                <div className="flex flex-wrap gap-1">
                  {role === "editor" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigation.request(() =>
                          window.dispatchEvent(
                            new CustomEvent("notebook-create-step", {
                              detail: {
                                bookId,
                                findingId: finding.id,
                                commentId: comment.id,
                                text: comment.text,
                              },
                            }),
                          ),
                        )
                      }
                    >
                      <ListChecks />
                      Create next step
                    </Button>
                  )}
                  {!comment.resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => start("reply", comment)}
                    >
                      <Reply />
                      Reply
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => action(comment, "comment-resolve")}
                  >
                    <Check />
                    {comment.resolved ? "Reopen" : "Resolve"}
                  </Button>
                  <Button
                    disabled={comment.author !== "You"}
                    variant="ghost"
                    size="sm"
                    onClick={() => start("edit", comment)}
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    disabled={comment.author !== "You"}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      navigation.request(() =>
                        action(comment, "comment-delete"),
                      )
                    }
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              )}
            </article>
          ))}
          {visible.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => setAll(!all)}>
              {all
                ? "Show fewer comments"
                : `Show all ${visible.length} comments`}
            </Button>
          )}
          {composer && role !== "viewer" && (
            <form
              className="space-y-3 rounded-xl border border-input bg-white p-4"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <Label htmlFor={`note-${finding.id}`}>
                {mode.includes("edit")
                  ? "Edit your comment"
                  : mode === "reply"
                    ? "Your reply"
                    : "Your comment"}
              </Label>
              {mode === "reply" && (
                <p className="truncate text-xs text-muted-foreground">
                  Replying to: {comments.find((c) => c.id === target)?.text}
                </p>
              )}
              <Textarea
                ref={inputRef}
                id={`note-${finding.id}`}
                aria-label={`Comment for ${finding.question}`}
                value={draft}
                onChange={(e) => change(e.target.value)}
                placeholder="Add an observation, question or next step…"
                disabled={saving}
                className="min-h-28"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span role="status" className="text-xs text-muted-foreground">
                  {saving
                    ? "Saving…"
                    : dirty
                      ? "Draft · not posted"
                      : "Only posted comments appear in exports"}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={saving}
                    onClick={discard}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={!canSave || saving}>
                    {saving && <Spinner />}
                    {error
                      ? "Retry"
                      : mode.includes("edit")
                        ? "Save changes"
                        : mode === "reply"
                          ? "Post reply"
                          : "Post comment"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
      {warning && (
        <p role="status" className="text-xs text-muted-foreground">
          {warning}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
