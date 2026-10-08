import { generatedNotebookSummary } from "../notebook-summary";
import { Sparkles } from "lucide-react";
export function NotebookSummary({ book }) {
  const text = generatedNotebookSummary(book);
  return (
    <section
      key={text}
      className="notebook-ai-summary space-y-4 rounded-lg p-4 sm:p-5"
      aria-label="Notebook summary"
    >
      <header className="relative z-10 flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-base font-medium text-primary">AI summary</h3>
          <p className="text-xs text-muted-foreground">
            From {book.findings.length} saved records · Updates automatically
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-white/80 px-2 py-1 text-xs text-muted-foreground">
          Local demo
        </span>
      </header>
      {text ? (
        <p className="relative z-10 text-[14px] leading-relaxed">{text}</p>
      ) : (
        <p className="relative z-10 text-[14px] text-muted-foreground">
          {book.findings.length
            ? "Add research findings or notes to generate an overview."
            : "Add a record to generate a summary."}
        </p>
      )}
    </section>
  );
}
