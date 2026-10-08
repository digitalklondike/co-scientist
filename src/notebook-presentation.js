export function formatNotebookDate(value) {
  if (!value || !Number.isFinite(new Date(value).getTime()))
    return "date unavailable";
  const d = new Date(value),
    pad = (n) => String(n).padStart(2, "0");
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function sourceYearCounts(sources) {
  const counts = new Map();
  for (const s of sources) {
    const year = Number(s.year);
    if (Number.isInteger(year) && year > 1800 && year < 2200)
      counts.set(year, (counts.get(year) || 0) + 1);
  }
  return [...counts]
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ year, count }));
}
export function sortNotebookItems(items, mode) {
  if (mode === "manual") return items;
  return [...items].sort((a, b) =>
    mode === "title"
      ? (a.title || a.question).localeCompare(b.title || b.question)
      : (new Date(b.updatedAt || b.savedAt || 0).getTime() || 0) -
        (new Date(a.updatedAt || a.savedAt || 0).getTime() || 0),
  );
}
export function placeNotebookItem(items, id, targetId) {
  const from = items.findIndex((x) => x.id === id),
    to = items.findIndex((x) => x.id === targetId);
  if (from < 0 || to < 0) throw Error("Reorder target no longer exists.");
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Use the resting row positions so animated neighbors cannot change the target.
export function notebookDragTarget(rows, id, centerY) {
  if (!rows.some((row) => row.id === id)) return id;
  const index = rows.filter(
    (row) => row.id !== id && centerY >= (row.top + row.bottom) / 2,
  ).length;
  return rows[index]?.id || id;
}
