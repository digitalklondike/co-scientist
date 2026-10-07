import { NotebookMarkdown } from "./notebook-content";
import { generatedNotebookSummary, notebookSources } from "../notebook-summary";
export function NotebookSummary({ book }) {
  const text = generatedNotebookSummary(book);
  return (
    <section
      className="space-y-4 rounded-lg border bg-white p-4 sm:p-5"
      aria-label="Notebook summary"
    >
      <header className="space-y-1.5">
        <h3 className="text-base font-medium">Summary</h3>
        <p className="text-xs text-muted-foreground">
          Local demo · Automatically extracted from all {book.findings.length}{" "}
          saved records. Updates when records change.
        </p>
      </header>
      {text ? (
        <NotebookMarkdown
          documentView
          findingId="notebook-summary"
          sources={notebookSources(book)}
        >
          {text}
        </NotebookMarkdown>
      ) : (
        <p className="text-base text-muted-foreground">
          Add a record to generate a summary.
        </p>
      )}
    </section>
  );
}
