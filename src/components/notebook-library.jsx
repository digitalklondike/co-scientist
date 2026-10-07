import { NotebookBreadcrumb } from "./notebook-breadcrumb";
import { placeNotebookItem } from "../notebook-presentation";
import { useNotebookSort, NotebookDragHandle } from "./notebook-sortable";
import { notebookMatches } from "../notebook-search.js";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  NotebookPen,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Pencil,
  Trash2,
  Copy,
  FolderInput,
  Upload,
} from "lucide-react";
import { NotebookButton as Button, NotebookCount } from "./notebook-ui";
import { NotebookInput as Input } from "./notebook-ui";
import { SearchInput } from "@/components/ui/search-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { importSnapshot, commentsFor } from "../notebook-flows";
export function NotebookLibrary({ books, onOpen, onNew, onBooks, onNotify }) {
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState(() => {
    try {
      const f = JSON.parse(localStorage.getItem("cosci-notebook-folders"));
      return Array.isArray(f) ? f : [];
    } catch {
      return [];
    }
  });
  const [folderId, setFolderId] = useState(null);
  const [modal, setModal] = useState(null);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("root");
  const [error, setError] = useState("");
  const upload = useRef(null);
  const open = (type, item) => {
    setModal({ type, item });
    setName(item?.title || "");
    setDestination(item?.folderId || "root");
    setError("");
  };
  function saveFolders(next) {
    localStorage.setItem("cosci-notebook-folders", JSON.stringify(next));
    setFolders(next);
  }
  function submit(e) {
    e.preventDefault();
    try {
      const item = modal.item;
      if (modal.type === "new-folder")
        saveFolders([
          ...folders,
          { id: crypto.randomUUID(), title: name.trim() },
        ]);
      if (modal.type === "rename-folder")
        saveFolders(
          folders.map((f) =>
            f.id === item.id ? { ...f, title: name.trim() } : f,
          ),
        );
      if (modal.type === "delete-folder") {
        onBooks((previous) =>
          previous.map((b) =>
            b.folderId === item.id ? { ...b, folderId: null } : b,
          ),
        );
        saveFolders(folders.filter((f) => f.id !== item.id));
        if (folderId === item.id) setFolderId(null);
      }
      if (modal.type === "move")
        onBooks((previous) =>
          previous.map((b) =>
            b.id === item.id
              ? { ...b, folderId: destination === "root" ? null : destination }
              : b,
          ),
        );
      if (modal.type === "delete") {
        const index = books.findIndex((b) => b.id === item.id);
        onBooks((previous) => previous.filter((b) => b.id !== item.id));
        onNotify("Notebook deleted. Original research kept.", {
          label: "Undo",
          run: () => {
            try {
              onBooks((previous) => {
                if (previous.some((b) => b.id === item.id)) return previous;
                const next = [...previous];
                next.splice(Math.min(index, next.length), 0, item);
                return next;
              });
            } catch {
              onNotify("Couldn’t restore notebook.", undefined, "error");
            }
          },
        });
      }
      setModal(null);
    } catch (e) {
      setError(`Couldn’t save. ${e.message}`);
    }
  }
  async function importFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024)
        throw Error("Notebook file exceeds 10 MB.");
      const imported = importSnapshot(await file.text());
      onBooks((previous) => [imported, ...previous]);
      onNotify("Notebook imported as a separate local copy.");
      onOpen(imported.id);
    } catch (e) {
      onNotify(e.message, undefined, "error");
    }
  }
  const results = books.filter((b) =>
    search
      ? b.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        notebookMatches(b, search).length > 0
      : folderId
        ? b.folderId === folderId
        : true,
  );
  const sorting = useNotebookSort({
    items: results,
    group: "notebook-library",
    onNotify,
    onPlace: (id, targetId) =>
      onBooks((previous) => placeNotebookItem(previous, id, targetId)),
    onMove: (id, direction) =>
      onBooks((previous) => {
        const i = previous.findIndex((b) => b.id === id),
          target = previous[i + direction];
        return target ? placeNotebookItem(previous, id, target.id) : previous;
      }),
  });
  const reducedMotion = useReducedMotion();
  const draggedBook = results.find((book) => book.id === sorting.dragging?.id);
  const currentFolder = folders.find((f) => f.id === folderId);
  return (
    <div className="min-h-0 min-w-0 flex-1 xl:overflow-y-auto xl:overscroll-contain xl:px-8 xl:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-6">
        <header className="space-y-2">
          <h1 className="text-[32px] font-semibold leading-[40px] tracking-tight">
            Your notebooks
          </h1>
          <p className="text-base text-muted-foreground">
            Keep research, sources and comments together.
          </p>
        </header>
        <NotebookBreadcrumb
          folder={currentFolder?.title}
          onHome={() => {
            setFolderId(null);
            setSearch("");
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <SearchInput
              inputClassName="h-10"
              aria-label="Search notebooks"
              placeholder="Search notebooks and their content"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              clearLabel="Clear notebook search"
            />
          </div>
          <Button onClick={() => onNew(folderId)}>
            <Plus />
            New notebook
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Import notebook"
            onClick={() => upload.current?.click()}
          >
            <Upload />
          </Button>
          <input
            ref={upload}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Import notebook file"
            onChange={importFile}
          />
        </div>
        {
          <section aria-label="Notebook folders" className="space-y-3">
            {!currentFolder && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  static
                  size="icon"
                  className="h-10 w-16 rounded-xl border-dashed"
                  aria-label="New folder"
                  onClick={() => open("new-folder")}
                >
                  <FolderPlus />
                </Button>
                {!!folders.length && (
                  <span
                    aria-hidden="true"
                    className="mx-1 h-7 w-px bg-border"
                  />
                )}
                {folders
                  .filter(
                    (f) =>
                      !search ||
                      f.title.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center overflow-hidden rounded-xl border transition-colors duration-150 motion-reduce:transition-none [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-ring [&:has(:focus-visible)]:ring-offset-2 ${folderId === f.id ? "border-primary bg-accent" : "border-border bg-secondary hover:border-primary/50"}`}
                    >
                      <Button
                        static
                        variant="ghost"
                        aria-pressed={folderId === f.id}
                        className="rounded-none focus-visible:border-transparent focus-visible:ring-0"
                        onClick={() => {
                          setFolderId(f.id);
                          setSearch("");
                        }}
                      >
                        <Folder />
                        {f.title}
                        <span className="text-xs text-muted-foreground">
                          {books.filter((b) => b.folderId === f.id).length}
                        </span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            static
                            size="icon"
                            className="rounded-none focus-visible:border-transparent focus-visible:ring-0"
                            aria-label={`Folder actions for ${f.title}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => open("rename-folder", f)}
                          >
                            <Pencil />
                            Rename folder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => open("delete-folder", f)}
                          >
                            <Trash2 />
                            Delete folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
              </div>
            )}
          </section>
        }
        <div
          aria-label="Notebook list"
          className="min-h-0 space-y-3 xl:overflow-y-auto xl:overscroll-contain"
        >
          <span className="sr-only" role="status">
            {sorting.status}
          </span>
          {sorting.previewItems.map((book) => (
            <motion.div
              key={book.id}
              layout={reducedMotion ? false : "position"}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              style={{ opacity: sorting.dragging?.id === book.id ? 0.3 : 1 }}
              data-sort-group="notebook-library"
              data-sort-id={book.id}
              className={`group flex items-center gap-2 rounded-2xl border bg-secondary p-4 ${sorting.target === book.id ? "border-primary ring-2 ring-primary/20" : "border-transparent"}`}
            >
              <NotebookDragHandle
                label={book.title}
                {...sorting.handle(book.id)}
              />
              <Button
                static
                variant="ghost"
                aria-label={`Open notebook ${book.title}`}
                onClick={() => onOpen(book.id)}
                className="h-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal p-0 text-left hover:bg-transparent active:bg-transparent has-[>svg]:px-0 sm:gap-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-focus-within:bg-primary group-focus-within:text-primary-foreground">
                  <NotebookPen className="!size-5" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block break-words text-base font-semibold">
                    {book.title}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {book.accessRole && book.accessRole !== "editor"
                      ? `${book.accessRole === "viewer" ? "View only" : "Comment access"} · `
                      : ""}
                    {book.findings.at(-1)?.question ||
                      "Ready for your first block"}
                  </span>
                </span>
                <NotebookCount className="max-sm:hidden">
                  {book.findings.length} saved{" "}
                  {book.findings.length === 1 ? "block" : "blocks"}
                </NotebookCount>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Notebook actions for ${book.title}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => open("move", book)}>
                    <FolderInput />
                    Move to folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        onBooks((previous) => [
                          {
                            ...structuredClone(book),
                            id: crypto.randomUUID(),
                            title: `${book.title} · copy`,
                          },
                          ...previous,
                        ]);
                        onNotify("Notebook duplicated with its saved content.");
                      } catch {
                        onNotify(
                          "Couldn’t duplicate notebook.",
                          undefined,
                          "error",
                        );
                      }
                    }}
                  >
                    <Copy />
                    Duplicate notebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => open("delete", book)}
                  >
                    <Trash2 />
                    Delete notebook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
          {sorting.dragging &&
            draggedBook &&
            createPortal(
              <div
                aria-hidden="true"
                className="pointer-events-none fixed z-[80] flex items-center gap-4 rounded-2xl border border-primary/40 bg-secondary p-4 shadow-xl"
                style={{
                  left: sorting.dragging.left,
                  top: sorting.dragging.top,
                  width: sorting.dragging.width,
                  minHeight: sorting.dragging.height,
                  transform: `translate3d(${sorting.dragging.dx}px,${sorting.dragging.dy}px,0)`,
                }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-focus-within:bg-primary group-focus-within:text-primary-foreground">
                  <NotebookPen className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="break-words text-base font-semibold">
                    {draggedBook.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {draggedBook.findings.at(-1)?.question ||
                      "Ready for your first block"}
                  </p>
                </div>
                <NotebookCount className="max-sm:hidden">
                  {draggedBook.findings.length} saved blocks
                </NotebookCount>
              </div>,
              document.body,
            )}
          {!results.length && (
            <div className="space-y-3 py-12 text-center">
              <h2 className="text-base font-semibold">
                {search
                  ? "No matching notebooks"
                  : folderId
                    ? "This folder is empty"
                    : "Ready for your first notebook"}
              </h2>
              <p className="text-base text-muted-foreground">
                {search
                  ? "Try another topic or comment phrase."
                  : folderId
                    ? "Move an existing notebook here or create a new one."
                    : "Create a collection or save your next answer from Chat."}
              </p>
              <Button variant="secondary" onClick={() => onNew(folderId)}>
                <Plus />
                New notebook
              </Button>
            </div>
          )}
        </div>
        <Dialog
          open={!!modal}
          onOpenChange={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
        >
          <DialogContent className="gap-6 p-6">
            <DialogHeader>
              <DialogTitle>
                {modal?.type === "delete"
                  ? "Delete notebook?"
                  : modal?.type === "delete-folder"
                    ? "Delete folder?"
                    : modal?.type === "move"
                      ? "Move notebook"
                      : modal?.type === "rename-folder"
                        ? "Rename folder"
                        : "New folder"}
              </DialogTitle>
              <DialogDescription>
                {modal?.type === "delete"
                  ? "Removes this local notebook and its saved blocks and comments. Original research chats stay available. Undo is offered after deletion."
                  : modal?.type === "delete-folder"
                    ? "The notebooks inside this folder will stay in All notebooks."
                    : modal?.type === "move"
                      ? "Organize your collection without changing its content."
                      : "Folders group notebooks in this library. Research chats remain in the left sidebar."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              {["new-folder", "rename-folder"].includes(modal?.type) && (
                <div className="space-y-2">
                  <Label htmlFor="folder-name">Folder name</Label>
                  <Input
                    id="folder-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              {modal?.type === "move" && (
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger
                    className="h-10 max-sm:min-h-11"
                    aria-label="Destination folder"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">
                      All notebooks · no folder
                    </SelectItem>
                    {folders.map((f) => (
                      <SelectItem value={f.id} key={f.id}>
                        {f.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {error && (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={
                    modal?.type.startsWith("delete") ? "destructive" : "default"
                  }
                  disabled={
                    ["new-folder", "rename-folder"].includes(modal?.type) &&
                    !name.trim()
                  }
                >
                  {modal?.type.startsWith("delete")
                    ? "Delete"
                    : modal?.type === "move"
                      ? "Move notebook"
                      : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
