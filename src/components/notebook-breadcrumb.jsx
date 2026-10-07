import { ChevronsRight, Folder, NotebookPen } from "lucide-react";

export function NotebookBreadcrumb({ onHome, folder, title }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[14px] leading-5">
        <li>
          <button
            type="button"
            onClick={onHome}
            className="flex min-h-10 items-center gap-2 rounded-sm text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
          >
            <NotebookPen className="size-4" />
            All notebooks
          </button>
        </li>
        {(folder || title) && (
          <li aria-hidden="true">
            <ChevronsRight className="size-4 text-muted-foreground" />
          </li>
        )}
        {folder && (
          <li
            className="flex items-center gap-2"
            aria-current={title ? undefined : "page"}
          >
            <Folder className="size-4" />
            {folder}
          </li>
        )}
        {folder && title && (
          <li aria-hidden="true">
            <ChevronsRight className="size-4 text-muted-foreground" />
          </li>
        )}
        {title && (
          <li aria-current="page" className="flex min-w-0 items-center gap-2">
            <NotebookPen className="size-4 shrink-0" />
            <span className="break-words">{title}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
