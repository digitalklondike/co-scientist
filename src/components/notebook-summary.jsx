import { FindingContent } from "./notebook-content";
import { NotebookButton as Button } from "./notebook-ui";
import { History } from "lucide-react";
import { markdown } from "../data";
import { formatNotebookDate } from "../notebook-presentation";
import { notebookSources, summaryNeedsReview } from "../notebook-summary";
import { useNoteNavigation } from "./note-navigation-context";
export function NotebookSummary({ book, role, onChange }) {
  const guard = useNoteNavigation();
  const selected = book.findings.find((f) => f.id === book.conclusionFindingId);
  const starter = selected
    ? markdown(selected)
        .replace(/^# [^\n]+\n\s*\n/, "")
        .split(/\n\n/)[0]
    : "";
  const finding = {
    id: "notebook-summary",
    origin: "personal",
    question: "Notebook summary",
    contentMarkdown: book.summary?.text ?? starter,
    result: {
      summary: book.summary?.text ?? starter,
      sources: notebookSources(book),
    },
    versions: book.summary?.versions || [],
  };
  return (
    <section
      className="rounded-lg border bg-white p-4 sm:p-5"
      aria-label="Notebook summary"
    >
      <FindingContent
        key={book.id}
        finding={finding}
        bookId={book.id}
        documentView
        readOnly={role !== "editor"}
        headerContent={
          <div className="space-y-1.5">
            <h3 className="text-base font-medium">Summary</h3>
            {book.summary && (
              <p className="text-xs text-muted-foreground">
                Saved · {formatNotebookDate(book.summary.savedAt)}
              </p>
            )}
            {summaryNeedsReview(book) && (
              <p
                role="status"
                className="text-[14px] font-medium text-muted-foreground"
              >
                Research changed — review summary.
              </p>
            )}
            {!book.summary && (
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {selected
                  ? `Starting text from “${selected.question}”. Save it as your notebook summary.`
                  : "Summarise the question, findings and limitations. Cite the evidence supporting your conclusions."}
              </p>
            )}
          </div>
        }
        extraActions={
          !!finding.versions.length && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Version history"
              onClick={() =>
                guard(() =>
                  window.dispatchEvent(
                    new CustomEvent("notebook-open-history", {
                      detail: { bookId: book.id, findingId: finding.id },
                    }),
                  ),
                )
              }
            >
              <History />
            </Button>
          )
        }
        editLabel={book.summary ? "Edit summary" : "Write summary"}
        editorLabel="Summary in Markdown"
        editorDescription="Describe the question, findings and limitations. Use Insert citation to connect conclusions to saved evidence."
        onSave={(text) => onChange(book.id, { type: "summary-save", text })}
        onRestore={
          role === "editor"
            ? (versionId) =>
                onChange(book.id, { type: "summary-restore", versionId })
            : undefined
        }
      />
    </section>
  );
}
