import { notebookMatches } from "../notebook-search.js";
import { useContext, useEffect, useId, useRef, useState } from "react";
import {
  Search,
  MessageSquare,
  Plus,
  Share2,
  Download,
  ArrowUpRight,
  CheckCheck,
} from "lucide-react";
import {
  NotebookButton as Button,
  NotebookCount,
  NotebookActionGroup,
  NotebookHint,
} from "./notebook-ui";
import { NotebookInput as Input } from "./notebook-ui";
import { SearchInput } from "@/components/ui/search-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  commentsFor,
  exportNotebook,
  downloadNotebook,
  snapshot,
} from "../notebook-flows.js";
import { NoteNavigation } from "./note-navigation-context";
import { useNoteNavigation } from "./note-navigation-context";
function SearchExcerpt({ text, query }) {
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent px-0.5 text-accent-foreground">
        {text.slice(index, index + query.trim().length)}
      </mark>
      {text.slice(index + query.trim().length)}
    </>
  );
}
export function NotebookTools({
  book,
  role,
  onChange,
  onNotify,
  onPreview,
  addAfter,
  onClearAfter,
}) {
  const guard = useNoteNavigation();
  const editorId = useId();
  const navigation = useContext(NoteNavigation);
  const recoveryKey = "cosci-block-draft:" + book.id;
  const [restored] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(recoveryKey));
    } catch {
      return null;
    }
  });
  const [dialog, setDialog] = useState(
    restored?.text || restored?.title ? "add" : null,
  );
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState(restored?.title || "");
  const [text, setText] = useState(restored?.text || "");
  const [error, setError] = useState("");
  const [format, setFormat] = useState("md");
  const [include, setInclude] = useState(true);
  const [shareRole, setShareRole] = useState("viewer");
  const actualRole = book.accessRole || "editor";
  const [commentFilter, setCommentFilter] = useState("open");
  const allComments = book.findings.flatMap((f) =>
    commentsFor(f).map((c) => ({ ...c, finding: f })),
  );
  const results = notebookMatches(book, search);
  const open = (kind) =>
    guard(() => {
      setDialog(kind);
      setError("");
    });
  const jump = (id, comments = false, commentId = null) => {
    setDialog(null);
    requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent(
          comments ? "notebook-open-comments" : "notebook-open-block",
          { detail: { bookId: book.id, findingId: id, commentId } },
        ),
      );
      const el = document.getElementById(
        `${comments ? "comments" : "block"}-${id}`,
      );
      el?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      el?.focus({ preventScroll: true });
    });
  };
  const add = (event) => {
    event?.preventDefault();
    try {
      onChange(book.id, { type: "block-add", title, text, afterId: addAfter });
      setDialog(null);
      setText("");
      setTitle("");
      onClearAfter?.();
      try {
        localStorage.removeItem(recoveryKey);
      } catch {}
      navigation.editors.delete(editorId);
      onNotify("Your block added to the notebook.");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };
  // Add-between-blocks is a real insertion action, not a second notebook composer.
  const effectiveDialog =
    addAfter !== null && addAfter !== undefined ? "add" : dialog;
  const lastDialog = useRef(effectiveDialog);
  if (effectiveDialog) lastDialog.current = effectiveDialog;
  const displayDialog = effectiveDialog || lastDialog.current;
  function discard() {
    try {
      localStorage.removeItem(recoveryKey);
    } catch {
      setError("Couldn’t discard draft. Try again.");
      return false;
    }
    setTitle("");
    setText("");
    setDialog(null);
    onClearAfter?.();
    setError("");
    navigation.editors.delete(editorId);
    return true;
  }
  function close() {
    guard(() => {
      setDialog(null);
      onClearAfter?.();
      setError("");
    });
  }
  useEffect(() => {
    const dirty = effectiveDialog === "add" && !!(title.trim() || text.trim());
    navigation.editors.set(editorId, {
      dirty,
      canSave: !!title.trim() && !!text.trim(),
      save: () => add(),
      discard,
    });
    return () => navigation.editors.delete(editorId);
  });
  function updateDraft(field, value) {
    const next = { title, text, [field]: value };
    if (field === "title") setTitle(value);
    else setText(value);
    try {
      localStorage.setItem(recoveryKey, JSON.stringify(next));
      setError("");
    } catch {
      setError(
        "Draft recovery unavailable. Keep this dialog open until you save.",
      );
    }
  }
  return (
    <>
      <div
        aria-label="Notebook tools"
        className="flex flex-wrap items-center gap-4"
      >
        <div className="relative min-w-48 flex-1 basis-full lg:basis-64">
          <SearchInput
            aria-label="Search in this notebook"
            placeholder="Search blocks and comments"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            clearLabel="Clear notebook content search"
          />
        </div>
        <div
          role="group"
          aria-label="Notebook content tools"
          className="flex flex-wrap items-center gap-2"
        >
          <Button variant="secondary" onClick={() => open("comments")}>
            <MessageSquare />
            Discussions{" "}
            <NotebookCount className="px-2 py-0.5">
              {allComments.filter((c) => !c.resolved).length}
            </NotebookCount>
          </Button>
          {role === "editor" && (
            <Button variant="outline" onClick={() => open("add")}>
              <Plus />
              Add block
            </Button>
          )}
        </div>
        <NotebookActionGroup aria-label="Share and export">
          <Button
            static
            variant="ghost"
            size="icon"
            aria-label="Share notebook"
            onClick={() => open("share")}
          >
            <Share2 />
          </Button>
          <Button
            static
            variant="ghost"
            size="icon"
            aria-label="Export notebook"
            onClick={() => open("export")}
          >
            <Download />
          </Button>
        </NotebookActionGroup>
      </div>
      {search && (
        <section
          aria-label="Search results"
          className="space-y-2 rounded-xl bg-secondary p-4"
        >
          <p role="status" className="text-xs text-muted-foreground">
            {results.length} matching{" "}
            {results.length === 1 ? "block" : "blocks"}
          </p>
          {results.map(({ finding: f, snippet, type, commentId }) => (
            <Button
              key={f.id}
              variant="ghost"
              className="h-auto min-h-11 w-full justify-between whitespace-normal text-left"
              onClick={() => jump(f.id, !!commentId, commentId)}
            >
              <span className="space-y-2">
                <span className="block font-semibold">{f.question}</span>
                <span className="block text-xs text-primary">{type}</span>
                <span className="block text-base font-normal text-muted-foreground">
                  {snippet}
                </span>
              </span>
              <ArrowUpRight className="shrink-0" />
            </Button>
          ))}
          {!results.length && (
            <p className="text-base">Try a topic, phrase or comment text.</p>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </section>
      )}
      <Dialog
        open={!!effectiveDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) close();
        }}
      >
        <DialogContent className="max-h-[90svh] gap-6 overflow-y-auto p-6 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {displayDialog === "add"
                ? "Add your own block"
                : displayDialog === "comments"
                  ? "Notebook comments"
                  : displayDialog === "share"
                    ? "Share notebook"
                    : "Export notebook"}
            </DialogTitle>
            <DialogDescription>
              {displayDialog === "add"
                ? "Keep your own observations, experiment plans or conclusions alongside saved research."
                : displayDialog === "comments"
                  ? "Every discussion stays attached to its saved block."
                  : displayDialog === "share"
                    ? "Try access roles and share a portable snapshot. This demo has no live invitations or cloud sync."
                    : "Choose a format. Only saved content is exported."}
            </DialogDescription>
          </DialogHeader>
          {displayDialog === "add" && (
            <form className="space-y-4" onSubmit={add}>
              <div className="space-y-2">
                <Label htmlFor="block-title">Block title</Label>
                <Input
                  id="block-title"
                  autoFocus
                  value={title}
                  onChange={(e) => updateDraft("title", e.target.value)}
                  placeholder="Experiment plan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-text">Content · Markdown supported</Label>
                <Textarea
                  id="block-text"
                  value={text}
                  onChange={(e) => updateDraft("text", e.target.value)}
                  placeholder="Write your observations or next steps…"
                  className="min-h-48"
                />
              </div>
              {addAfter && (
                <p className="text-xs text-muted-foreground">
                  Inserted after:{" "}
                  {book.findings.find((f) => f.id === addAfter)?.question}
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!title.trim() || !text.trim()}>
                  Add block
                </Button>
              </DialogFooter>
            </form>
          )}
          {displayDialog === "comments" && (
            <div className="space-y-4">
              <Select value={commentFilter} onValueChange={setCommentFilter}>
                <SelectTrigger
                  className="h-10 max-sm:min-h-11"
                  aria-label="Filter comments"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open discussions</SelectItem>
                  <SelectItem value="resolved">Resolved discussions</SelectItem>
                  <SelectItem value="all">All comments</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                {allComments
                  .filter(
                    (c) =>
                      commentFilter === "all" ||
                      c.resolved === (commentFilter === "resolved"),
                  )
                  .map((c) => (
                    <Button
                      key={`${c.finding.id}-${c.id}`}
                      variant="ghost"
                      className="h-auto w-full justify-start whitespace-normal rounded-xl bg-secondary p-4 text-left"
                      onClick={() => jump(c.finding.id, true, c.id)}
                    >
                      <MessageSquare className="shrink-0 text-primary" />
                      <span className="min-w-0 space-y-1">
                        <span className="block text-xs font-semibold text-primary">
                          {c.finding.question}
                        </span>
                        <span className="block line-clamp-2 text-base font-normal">
                          {c.text}
                        </span>
                        {c.resolved && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCheck className="size-3" />
                            Resolved
                          </span>
                        )}
                      </span>
                    </Button>
                  ))}
                {!allComments.filter(
                  (c) =>
                    commentFilter === "all" ||
                    c.resolved === (commentFilter === "resolved"),
                ).length && (
                  <p className="py-8 text-center text-base text-muted-foreground">
                    No {commentFilter === "all" ? "" : commentFilter + " "}
                    comments yet.
                  </p>
                )}
              </div>
            </div>
          )}
          {displayDialog === "export" && (
            <div className="space-y-4">
              <Label>File format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger
                  className="h-10 max-sm:min-h-11"
                  aria-label="Export format"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="md">
                    Markdown · editable document
                  </SelectItem>
                  <SelectItem value="html">
                    HTML · readable / print to PDF
                  </SelectItem>
                  <SelectItem value="xlsx">
                    Excel · literature, web and computational
                  </SelectItem>
                  <SelectItem value="csv">
                    CSV · citations for spreadsheets
                  </SelectItem>
                  <SelectItem value="json">
                    Notebook file · backup and import
                  </SelectItem>
                </SelectContent>
              </Select>
              {["md", "html"].includes(format) && (
                <label className="flex min-h-10 items-center gap-3 text-xs">
                  <input
                    type="checkbox"
                    checked={include}
                    onChange={(e) => setInclude(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Include saved comments
                </label>
              )}
              <NotebookHint>
                {format === "json"
                  ? "Contains blocks, comments, sources and discussions. Imported files keep their access role."
                  : format === "xlsx"
                    ? "Three sheets: Literature, Web and Computational. Includes only evidence actually saved in this notebook."
                    : format === "csv"
                      ? "Exports the original source metadata, one source per row. Opens in Excel or Google Sheets."
                      : format === "html"
                        ? "Open the HTML file in your browser. Use Print → Save as PDF for a PDF copy."
                        : "Includes edited blocks and the original source links."}
              </NotebookHint>
              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    downloadNotebook(
                      book.title,
                      exportNotebook(book, format, include),
                    );
                    onNotify("Notebook export downloaded.");
                    setDialog(null);
                  }}
                >
                  <Download />
                  Download
                </Button>
              </DialogFooter>
            </div>
          )}
          {displayDialog === "share" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-base font-semibold">{book.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {book.findings.length} blocks · {allComments.length} comments
                </p>
              </div>
              <Label>Recipient’s access in this prototype</Label>
              <Select value={shareRole} onValueChange={setShareRole}>
                <SelectTrigger
                  className="h-10 max-sm:min-h-11"
                  aria-label="Recipient access"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer · read only</SelectItem>
                  <SelectItem
                    value="commenter"
                    disabled={actualRole === "viewer"}
                  >
                    Commenter · read and comment
                  </SelectItem>
                  <SelectItem value="editor" disabled={actualRole !== "editor"}>
                    Editor · edit blocks and comment
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-base text-muted-foreground">
                {shareRole === "viewer"
                  ? "Can read blocks, sources and comments. Cannot change content."
                  : shareRole === "commenter"
                    ? "Can post, reply and resolve comments. Scientific content stays read-only."
                    : "Can add, edit and reorder blocks, and participate in comments."}
              </p>
              <NotebookHint>
                Download the file and send it yourself. The recipient imports it
                from the Notebook library. It is a separate local copy; later
                edits do not sync. Roles demonstrate product behaviour, not
                secure access control for the file.
              </NotebookHint>
              <DialogFooter className="flex-wrap pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    onPreview(shareRole);
                    setDialog(null);
                  }}
                >
                  Preview as {shareRole}
                </Button>
                <Button
                  onClick={() => {
                    downloadNotebook(book.title, {
                      body: snapshot(book, shareRole),
                      type: "application/json",
                      extension: "json",
                    });
                    onNotify("Shareable notebook snapshot downloaded.");
                  }}
                >
                  <Download />
                  Download snapshot
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
