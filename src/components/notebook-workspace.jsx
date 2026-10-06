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

} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { FindingContent } from "./notebook-content";

export function NotebookLibrary({ books, onOpen, onNew }) {
  const [search, setSearch] = useState("");
  const results = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="mx-auto flex w-full max-w-5xl min-h-0 flex-col gap-7 xl:h-full xl:px-8 xl:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your notebooks
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Collect answers, sources and your own notes in one place.
        </p>
      </header>
      <div className="flex shrink-0 items-center gap-3">
        <Input
          aria-label="Search notebooks"
          placeholder="Search notebooks"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 min-w-0 flex-1"
        />
        <Button className="h-11" onClick={onNew}>
          <Plus />
          New notebook
        </Button>
      </div>
      <div
        aria-label="Notebook list"
        className="min-h-0 space-y-3 xl:overflow-y-auto xl:overscroll-contain"
      >
        {results.map((book) => (
          <Button
            key={book.id}
            variant="ghost"
            aria-label={`Open notebook ${book.title}`}
            onClick={() => onOpen(book.id)}
            className="h-auto w-full justify-start gap-4 whitespace-normal !rounded-2xl bg-secondary !p-6 text-left transition-colors hover:bg-accent "
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><NotebookPen className="!size-5" /></span>
            <span className="min-w-0 flex-1 space-y-2">
              <span className="block text-base font-semibold">
                {book.title}
              </span>

              <span className="block truncate text-xs font-normal text-muted-foreground">
                {book.findings.at(-1)?.question ||
                  "Ready for your first answer"}
              </span>
            </span>
            <span aria-label={`${book.findings.length} saved answers`} className="shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-normal text-muted-foreground">{book.findings.length} saved {book.findings.length === 1 ? "answer" : "answers"}</span><ArrowRight className="shrink-0 text-primary" />
          </Button>
        ))}
        {!results.length && (
          <div className="space-y-2 py-12 text-center">
            <h2 className="text-base font-semibold">No matching notebooks</h2>
            <p className="text-base text-muted-foreground">
              Try another name or create a notebook.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function NotebookWorkspace({
  book,
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
  onConversation,
  onSaveReply,
  onBack,
  onDiscuss,
  discussionOpen,
}) {
  return (
    <div className="min-h-0 min-w-0 flex-1 xl:overflow-y-auto xl:overscroll-contain xl:px-8 xl:py-8"><div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-6">
      <Button variant="ghost" className="-ml-4 w-fit shrink-0 !px-4" onClick={onBack}>
        <ArrowLeft />
        All notebooks
      </Button>
      <section aria-label="Notebook header" className="-mx-4 space-y-5 rounded-2xl bg-secondary/70 p-4 sm:-mx-6 sm:p-6">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="break-words text-[32px] font-semibold leading-[40px] tracking-tight">{book.title}</h1>
          <span className="shrink-0 rounded-md bg-white px-2.5 py-1 text-xs text-muted-foreground">{book.findings.length} saved {book.findings.length === 1 ? "answer" : "answers"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onResearch}>
            <Plus />
            Add research
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notebook actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRename}>
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
      <p className="text-base leading-relaxed text-muted-foreground">Answers you save, with their sources and your notes.</p>
      </section>
      {!book.findings.length ? (
        <div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
          <FileText className="size-8 text-primary" />
          <h2 className="text-2xl font-semibold">
            Ready for your first answer
          </h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Save an answer from Chat to start this collection.
          </p>
          <Button onClick={onResearch}>Start research</Button>
        </div>
      ) : (
        <div className="space-y-10 pb-6">
          {book.findings.map((block, index) => (
            <article
              key={`${book.id}-${block.id}`}
              data-testid="saved-finding"
              aria-label="Saved answer block"
              className="min-w-0 space-y-6 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border [&:not(:first-child)]:pt-10"
            >
              <div className="relative flex items-center gap-3">
                <span aria-label={`Saved answer ${index + 1}`} className={`flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold tabular-nums text-primary ${discussionOpen ? "" : "xl:absolute xl:-left-12"}`}>{String(index + 1).padStart(2, "0")}</span>
                <p className="text-xs text-muted-foreground">{(block.originResearchId && block.originResearchId !== block.id) || /notebook/i.test(block.result.title || "") ? "Saved from a notebook conversation" : "Saved from research"}</p>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="min-w-0 flex-1 text-2xl font-semibold leading-tight tracking-tight">{block.question}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onOpen(block)}>Open research<ArrowUpRight /></Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for saved answer ${index + 1}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem variant="destructive" onClick={() => onRemove(block.id)}><Trash2 className="text-destructive" />Remove from notebook</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <FindingContent
                finding={block}
                documentView
                onSave={(content) => onEdit(block.id, content)}
                onDiscuss={() => onDiscuss(block.id)}
              />
              {!!block.result.sources.length && (
                <section className="space-y-3">
                  <h3 className="text-base font-semibold">
                    Sources kept with this answer
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {block.result.sources.map((source) => (
                      <Button
                        key={source.url}
                        asChild
                        variant="secondary"
                        size="sm"
                      >
                        <a href={source.url} target="_blank" rel="noreferrer">
                          <BookOpen />
                          {source.author}, {source.year}
                          <ArrowUpRight />
                        </a>
                      </Button>
                    ))}
                  </div>
                </section>
              )}
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor={`note-${block.id}`}>Your notes</Label>
                  <span className="text-xs text-muted-foreground">
                    Saved automatically
                  </span>
                </div>
                <Textarea
                  id={`note-${block.id}`}
                  aria-label={`Notes for ${block.question}`}
                  value={block.note || ""}
                  onChange={(event) => onNote(block.id, event.target.value)}
                  placeholder="Add an observation or next step…"
                  className="min-h-28"
                />
              </section>
            </article>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
