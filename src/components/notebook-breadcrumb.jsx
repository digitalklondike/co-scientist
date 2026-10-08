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
            All notebooks
          </button>
        </li>
        {(folder || title) && (
          <li aria-hidden="true">
            <span className="text-muted-foreground">/</span>
          </li>
        )}
        {folder && (
          <li
            className="flex items-center gap-2"
            aria-current={title ? undefined : "page"}
          >
            {folder}
          </li>
        )}
        {folder && title && (
          <li aria-hidden="true">
            <span className="text-muted-foreground">/</span>
          </li>
        )}
        {title && (
          <li aria-current="page" className="flex min-w-0 items-center gap-2">
            <span className="break-words">{title}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
