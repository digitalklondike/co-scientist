import { useState } from "react";
import { sourceYearCounts } from "../notebook-presentation";
import { NotebookButton as Button, NotebookHint } from "./notebook-ui";
export function NotebookSourceChart({ sources = [] }) {
  const rows = sourceYearCounts(sources);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  if (!rows.length) return null;
  if (!open)
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Show source chart
      </Button>
    );
  const max = Math.max(...rows.map((row) => row.count));
  const ceiling = max <= 2 ? 2 : Math.ceil(max / 4) * 4;
  const ticks = Array.from(
    { length: ceiling <= 2 ? 3 : 5 },
    (_, i) => ceiling - i * (ceiling <= 2 ? 1 : ceiling / 4),
  );
  const highlighted = rows.find((row) => row.year === selected);
  return (
    <figure
      aria-label="Saved sources by publication year"
      className="notebook-source-chart space-y-4 rounded-xl border bg-white p-4 sm:p-5"
    >
      <figcaption className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="block text-base font-medium">
            Sources by publication year
          </span>
          <p className="!m-0 text-[14px] text-muted-foreground">
            {rows.reduce((total, row) => total + row.count, 0)} dated references
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Hide chart
        </Button>
      </figcaption>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-[var(--notebook-chart-1)]" />
        Saved sources
      </div>
      <div className="overflow-x-auto pt-7">
        <div className="relative mb-6 h-44 min-w-64 pl-8">
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-between"
            aria-hidden="true"
          >
            {ticks.map((tick) => (
              <div
                key={tick}
                className="relative ml-8 border-t border-dashed border-border/70"
              >
                <span className="absolute right-full -top-2 mr-3 text-xs tabular-nums text-muted-foreground">
                  {tick}
                </span>
              </div>
            ))}
          </div>
          <div className="relative flex h-full items-end gap-3 px-3 sm:gap-6 sm:px-6">
            {rows.map((row, index) => (
              <button
                key={row.year}
                type="button"
                aria-pressed={selected === row.year}
                aria-label={`${row.year}: ${row.count} saved ${row.count === 1 ? "source" : "sources"}`}
                onClick={() =>
                  setSelected(selected === row.year ? null : row.year)
                }
                style={{
                  "--bar-color": `var(--notebook-chart-${(index % 3) + 1})`,
                }}
                className="group relative flex h-full min-w-10 flex-1 items-end justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span
                  style={{ height: `${(row.count / ceiling) * 100}%` }}
                  className={`relative w-full max-w-20 rounded-t-md border border-[var(--bar-color)] bg-[linear-gradient(180deg,var(--bar-color),color-mix(in_srgb,var(--bar-color)_55%,white))] transition-[opacity,box-shadow] duration-150 motion-reduce:transition-none group-hover:shadow-[0_0_0_2px_var(--bar-color)] ${selected === row.year ? "shadow-[0_0_0_2px_var(--primary)]" : highlighted ? "opacity-45 group-hover:opacity-100" : ""}`}
                >
                  <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium tabular-nums">
                    {row.count}
                  </span>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border bg-white px-3 py-2 text-left text-xs text-foreground shadow-sm group-hover:block group-focus-visible:block">
                    <span className="block font-medium">{row.year}</span>
                    <span className="text-muted-foreground">
                      {row.count} saved {row.count === 1 ? "source" : "sources"}
                    </span>
                  </span>
                </span>
                <span className="absolute -bottom-6 text-xs tabular-nums text-muted-foreground">
                  {row.year}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-[14px] text-muted-foreground" role="status">
          {highlighted
            ? `${highlighted.year} · ${highlighted.count} saved ${highlighted.count === 1 ? "source" : "sources"}`
            : "Select a year to inspect its source count."}
        </p>
        <NotebookHint>
          Counts saved references, not experimental effectiveness.
        </NotebookHint>
      </div>
    </figure>
  );
}
