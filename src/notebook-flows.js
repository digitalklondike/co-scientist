import { placeNotebookItem } from "./notebook-presentation.js";
import { markdown } from "./data.js";
import { citationsWorkbook } from "./notebook-citations.js";
import {
  researchRevision,
  notebookSources,
  generatedNotebookSummary,
} from "./notebook-summary.js";
export function commentsFor(finding) {
  return (
    finding.comments ??
    (finding.note
      ? [
          {
            id: `legacy-${finding.id}`,
            text: finding.note,
            author: "You",
            createdAt: null,
            replies: [],
            resolved: false,
          },
        ]
      : [])
  );
}
export function persistNotebooks(storage, books) {
  storage.setItem("cosci-books-v2", JSON.stringify(books));
  return books;
}
export function changeNotebook(books, bookId, action) {
  const book = books.find((b) => b.id === bookId);
  if (!book) throw Error("Notebook no longer exists.");
  const role = book.accessRole || "editor";
  if (
    role === "viewer" ||
    (role === "commenter" && !action.type.startsWith("comment-"))
  )
    throw Error("This notebook is read-only for this action.");
  const id = action.id || crypto.randomUUID();
  const now = action.now || new Date().toISOString();
  const requireText = (text) => {
    if (!text?.trim()) throw Error("Content cannot be empty.");
    return text.trim();
  };
  let next = { ...book };
  if (action.type === "rename") next.title = requireText(action.title);
  else if (action.type === "folder") next.folderId = action.folderId || null;
  else if (
    action.type === "summary-save" ||
    action.type === "summary-restore"
  ) {
    const previous = book.summary;
    const restored = previous?.versions?.find((v) => v.id === action.versionId);
    if (action.type === "summary-restore" && !restored)
      throw Error("Summary version no longer available.");
    const text = requireText(restored ? restored.text : action.text);
    const versions = previous
      ? [
          ...(previous.versions || []),
          {
            id,
            text: previous.text,
            savedAt: previous.savedAt,
            researchRevision: previous.researchRevision,
            sources: structuredClone(previous.sources || []),
          },
        ].slice(-5)
      : [];
    next.summary = {
      text,
      savedAt: now,
      researchRevision: restored
        ? restored.researchRevision
        : researchRevision(book),
      sources: structuredClone(notebookSources(book)),
      versions,
    };
  } else if (action.type === "research-add") {
    const record = action.record;
    if (!record?.id || !record.result) throw Error("Select a research result.");
    if (book.findings.some((f) => f.id === record.id))
      throw Error("Research already saved in this notebook.");
    next.findings = [
      ...book.findings,
      {
        ...structuredClone(record),
        note: "",
        comments: [],
        savedAt: now,
        originResearchId: record.id,
        originQuestion: record.question,
      },
    ];
  } else if (action.type.startsWith("task-")) {
    next.nextSteps = [...(book.nextSteps || [])];
    if (action.type === "task-add") {
      const context = action.findingId
        ? book.findings.find((f) => f.id === action.findingId)
        : null;
      if (action.findingId && !context)
        throw Error("Task context no longer exists.");
      if (
        action.commentId &&
        !context?.comments?.some((c) => c.id === action.commentId) &&
        !commentsFor(context || {}).some((c) => c.id === action.commentId)
      )
        throw Error("Comment context no longer exists.");
      next.nextSteps.push({
        id,
        text: requireText(action.text),
        done: false,
        ...(action.findingId ? { findingId: action.findingId } : {}),
        ...(action.commentId ? { commentId: action.commentId } : {}),
      });
    } else {
      const ti = next.nextSteps.findIndex((t) => t.id === action.taskId);
      if (ti < 0) throw Error("Next step no longer exists.");
      if (action.type === "task-toggle")
        next.nextSteps[ti] = {
          ...next.nextSteps[ti],
          done: !next.nextSteps[ti].done,
        };
      else if (action.type === "task-delete") next.nextSteps.splice(ti, 1);
      else if (action.type === "task-place") {
        if (!next.nextSteps.some((t) => t.id === action.targetId))
          throw Error("Next step no longer exists.");
        next.nextSteps = placeNotebookItem(
          next.nextSteps,
          action.taskId,
          action.targetId,
        );
      } else if (action.type === "task-move") {
        const target = next.nextSteps[ti + action.direction];
        if (target)
          next.nextSteps = placeNotebookItem(
            next.nextSteps,
            action.taskId,
            target.id,
          );
      } else throw Error("Unknown next step action.");
    }
  } else if (action.type === "block-add") {
    const question = requireText(action.title),
      text = requireText(action.text);
    const block = {
      id,
      question,
      kind: "note",
      origin: "personal",
      savedAt: now,
      contentMarkdown: `# ${question}\n\n${text}`,
      result: { title: "Your own block", summary: text, sources: [] },
      comments: [],
    };
    next.findings = [...book.findings];
    const index = action.afterId
      ? next.findings.findIndex((f) => f.id === action.afterId) + 1
      : next.findings.length;
    next.findings.splice(index, 0, block);
  } else {
    const index = book.findings.findIndex((f) => f.id === action.findingId);
    if (index < 0) throw Error("Saved block no longer exists.");
    next.findings = [...book.findings];
    if (action.type === "block-place") {
      next.findings = placeNotebookItem(
        book.findings,
        action.findingId,
        action.targetId,
      );
    } else if (action.type === "block-move") {
      const to = Math.max(
        0,
        Math.min(next.findings.length - 1, index + action.direction),
      );
      const [block] = next.findings.splice(index, 1);
      next.findings.splice(to, 0, block);
    } else if (
      action.type === "source-add" ||
      action.type === "source-delete"
    ) {
      const block = book.findings[index];
      let sources = [...block.result.sources];
      if (action.type === "source-add") {
        let url;
        try {
          url = new URL(action.url);
          if (!["http:", "https:"].includes(url.protocol)) throw Error();
        } catch {
          throw Error("Enter a valid HTTP or HTTPS URL.");
        }
        if (sources.some((s) => new URL(s.url).href === url.href))
          throw Error("Source already added.");
        sources.push({
          id,
          title: requireText(action.title),
          url: url.href,
          author: action.author?.trim() || "",
          year: action.year?.trim() || "",
          type: "web",
          manual: true,
        });
      } else {
        if (!sources.find((s) => s.id === action.sourceId)?.manual)
          throw Error("Original research sources cannot be removed.");
        sources = sources.filter((s) => s.id !== action.sourceId);
      }
      next.findings[index] = {
        ...block,
        result: { ...block.result, sources },
        versions: [
          ...(block.versions || []),
          {
            id: crypto.randomUUID(),
            text: markdown(block),
            sources: structuredClone(block.result.sources),
            savedAt: block.editedAt || block.savedAt || now,
          },
        ].slice(-5),
        editedAt: now,
      };
    } else if (
      action.type === "block-edit" ||
      action.type === "block-restore"
    ) {
      const block = book.findings[index];
      const restored = (block.versions || []).find(
        (v) => v.id === action.versionId,
      );
      if (action.type === "block-restore" && !restored)
        throw Error("Version no longer available.");
      const text = requireText(
        action.type === "block-restore" ? restored.text : action.text,
      );
      const versions =
        text === markdown(block)
          ? block.versions || []
          : [
              ...(block.versions || []),
              {
                id,
                text: markdown(block),
                sources: structuredClone(block.result.sources),
                savedAt: block.editedAt || block.savedAt || null,
              },
            ].slice(-5);
      next.findings[index] = {
        ...next.findings[index],
        contentMarkdown: text,
        editedAt: now,
        versions,
        ...(next.findings[index].origin === "personal"
          ? {
              question:
                text.match(/^# ([^\n]+)/)?.[1] || next.findings[index].question,
              result: {
                ...next.findings[index].result,
                summary: text.replace(/^# [^\n]+\n\s*\n/, ""),
              },
            }
          : {}),
      };
    } else if (action.type.startsWith("comment-")) {
      let comments = commentsFor(book.findings[index]).map((c) => ({
        ...c,
        replies: [...(c.replies || [])],
      }));
      const ci = comments.findIndex((c) => c.id === action.commentId);
      if (action.type === "comment-add")
        comments.push({
          id,
          text: requireText(action.text),
          author: "You",
          createdAt: now,
          resolved: false,
          replies: [],
        });
      else if (action.type === "comment-restore") {
        if (comments.some((c) => c.id === action.comment.id))
          throw Error("Comment already restored.");
        comments.splice(
          Math.min(action.index, comments.length),
          0,
          action.comment,
        );
      } else {
        if (ci < 0) throw Error("Comment no longer exists.");
        if (
          ["comment-edit", "comment-delete"].includes(action.type) &&
          comments[ci].author !== "You"
        )
          throw Error("Only the author can edit or delete this comment.");
        if (action.type === "comment-edit")
          comments[ci] = {
            ...comments[ci],
            text: requireText(action.text),
            editedAt: now,
          };
        else if (action.type === "comment-delete") comments.splice(ci, 1);
        else if (action.type === "comment-resolve")
          comments[ci].resolved = action.resolved;
        else if (action.type.startsWith("comment-reply-")) {
          const ri = comments[ci].replies.findIndex(
            (r) => r.id === action.replyId,
          );
          if (action.type === "comment-reply-restore") {
            if (comments[ci].replies.some((r) => r.id === action.reply.id))
              throw Error("Reply already restored.");
            comments[ci].replies.splice(
              Math.min(action.index, comments[ci].replies.length),
              0,
              action.reply,
            );
          } else {
            if (ri < 0) throw Error("Reply no longer exists.");
            if (comments[ci].replies[ri].author !== "You")
              throw Error("Only the author can edit or delete this reply.");
            if (action.type === "comment-reply-edit")
              comments[ci].replies[ri] = {
                ...comments[ci].replies[ri],
                text: requireText(action.text),
                editedAt: now,
              };
            else if (action.type === "comment-reply-delete")
              comments[ci].replies.splice(ri, 1);
            else throw Error("Unknown reply action.");
          }
        } else if (action.type === "comment-reply") {
          if (comments[ci].resolved)
            throw Error("Reopen the discussion before replying.");
          comments[ci].replies.push({
            id,
            text: requireText(action.text),
            author: "You",
            createdAt: now,
          });
        } else throw Error("Unknown comment action.");
      }
      next.findings[index] = { ...book.findings[index], note: "", comments };
    } else throw Error("Unknown notebook action.");
  }
  next.updatedAt = now;
  return books.map((b) => (b.id === bookId ? next : b));
}
export function snapshot(book, role = "viewer") {
  return JSON.stringify(
    {
      format: "co-scientist-notebook",
      version: 1,
      exportedAt: new Date().toISOString(),
      role,
      book,
    },
    null,
    2,
  );
}
export function importSnapshot(text, id = crypto.randomUUID()) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw Error("Invalid notebook file.");
  }
  const b = data.book;
  if (
    data.format !== "co-scientist-notebook" ||
    data.version !== 1 ||
    !["viewer", "commenter", "editor"].includes(data.role) ||
    typeof b?.title !== "string" ||
    !b.title.trim() ||
    !Array.isArray(b.findings) ||
    b.findings.length > 500
  )
    throw Error("Invalid notebook file.");
  if (b.summary !== undefined) {
    const validSources = (sources) =>
      Array.isArray(sources) &&
      sources.every(
        (s) =>
          s &&
          typeof s.title === "string" &&
          typeof s.url === "string" &&
          /^https?:\/\//i.test(s.url),
      );
    const s = b.summary;
    if (
      !s ||
      typeof s.text !== "string" ||
      typeof s.savedAt !== "string" ||
      typeof s.researchRevision !== "string" ||
      !validSources(s.sources) ||
      !Array.isArray(s.versions) ||
      s.versions.length > 5 ||
      s.versions.some(
        (v) =>
          !v ||
          typeof v.id !== "string" ||
          typeof v.text !== "string" ||
          typeof v.researchRevision !== "string" ||
          !validSources(v.sources),
      )
    )
      throw Error("Invalid summary history.");
  }

  if (
    b.nextSteps !== undefined &&
    (!Array.isArray(b.nextSteps) ||
      b.nextSteps.some(
        (t) =>
          typeof t.id !== "string" ||
          typeof t.text !== "string" ||
          typeof t.done !== "boolean" ||
          (t.findingId !== undefined && typeof t.findingId !== "string") ||
          (t.commentId !== undefined && typeof t.commentId !== "string"),
      ))
  )
    throw Error("Invalid next steps.");
  if (
    b.keySourceUrls !== undefined &&
    (!Array.isArray(b.keySourceUrls) ||
      b.keySourceUrls.some((url) => typeof url !== "string"))
  )
    throw Error("Invalid key sources.");
  if (
    b.linkedNotebookIds !== undefined &&
    (!Array.isArray(b.linkedNotebookIds) ||
      b.linkedNotebookIds.some((id) => typeof id !== "string"))
  )
    throw Error("Invalid notebook links.");
  const ids = new Set();
  for (const f of b.findings) {
    if (
      typeof f.id !== "string" ||
      ids.has(f.id) ||
      typeof f.question !== "string" ||
      typeof f.result?.summary !== "string" ||
      !Array.isArray(f.result.sources) ||
      (f.contentMarkdown !== undefined &&
        typeof f.contentMarkdown !== "string") ||
      (f.note !== undefined && typeof f.note !== "string")
    )
      throw Error("Invalid notebook block.");
    if (
      f.versions !== undefined &&
      (!Array.isArray(f.versions) ||
        f.versions.length > 5 ||
        f.versions.some(
          (v) =>
            typeof v.id !== "string" ||
            typeof v.text !== "string" ||
            (v.sources !== undefined &&
              (!Array.isArray(v.sources) ||
                v.sources.some(
                  (s) =>
                    !s ||
                    typeof s.title !== "string" ||
                    typeof s.url !== "string" ||
                    !/^https?:\/\//i.test(s.url),
                ))),
        ))
    )
      throw Error("Invalid block history.");
    if (
      f.result.report &&
      (typeof f.result.report.overview !== "string" ||
        !Array.isArray(f.result.report.studies) ||
        f.result.report.studies.some(
          (r) => typeof r.study !== "number" || r.study < 0 || r.study > 2,
        ) ||
        !Array.isArray(f.result.report.sections) ||
        f.result.report.sections.some(
          (r) =>
            typeof r.title !== "string" ||
            !Array.isArray(r.paragraphs) ||
            r.paragraphs.some((p) => typeof p !== "string") ||
            (r.items !== undefined && !Array.isArray(r.items)),
        ))
    )
      throw Error("Invalid research report.");
    ids.add(f.id);
    if (
      f.conversation !== undefined &&
      (!Array.isArray(f.conversation) ||
        f.conversation.some(
          (m) =>
            typeof m.id !== "string" ||
            typeof m.question !== "string" ||
            typeof m.answer !== "string",
        ))
    )
      throw Error("Invalid discussion.");
    if (
      f.result.sources.some(
        (s) =>
          typeof s.title !== "string" ||
          typeof s.url !== "string" ||
          !/^https?:\/\//i.test(s.url),
      )
    )
      throw Error("Invalid source link.");
    if (
      f.comments !== undefined &&
      (!Array.isArray(f.comments) ||
        f.comments.some(
          (c) =>
            typeof c.id !== "string" ||
            typeof c.text !== "string" ||
            typeof c.author !== "string" ||
            !Array.isArray(c.replies) ||
            c.replies.some(
              (r) => typeof r.text !== "string" || typeof r.author !== "string",
            ),
        ))
    )
      throw Error("Invalid comments.");
  }
  const importedFindings = b.findings.map((f) => ({
    ...f,
    note: "",
    comments: commentsFor(f).map((c) => ({
      ...c,
      author: c.author === "You" ? "Original author" : c.author,
      replies: (c.replies || []).map((r) => ({
        ...r,
        author: r.author === "You" ? "Original author" : r.author,
      })),
    })),
  }));
  return {
    ...b,
    findings: importedFindings,
    id,
    folderId: null,
    accessRole: data.role,
    importedAt: new Date().toISOString(),
    title: `${b.title} · imported`,
  };
}
const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function readableHtml(markdownText) {
  const inline = (text) =>
    escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  const lines = markdownText.split("\n");
  const output = [];
  let paragraph = [],
    list = [];
  const flush = () => {
    if (paragraph.length) {
      output.push("<p>" + paragraph.map(inline).join("<br>") + "</p>");
      paragraph = [];
    }
    if (list.length) {
      output.push(
        "<ul>" +
          list.map((t) => "<li>" + inline(t) + "</li>").join("") +
          "</ul>",
      );
      list = [];
    }
  };
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n],
      heading = line.match(/^(#{1,6}) (.+)$/);
    if (heading) {
      flush();
      output.push(
        "<h" +
          heading[1].length +
          ">" +
          inline(heading[2]) +
          "</h" +
          heading[1].length +
          ">",
      );
    } else if (line.startsWith("- ")) {
      if (paragraph.length) flush();
      list.push(line.slice(2));
    } else if (line.startsWith("|")) {
      flush();
      const rows = [];
      while (n < lines.length && lines[n].startsWith("|")) {
        if (!/^\|[\s:|-]+\|$/.test(lines[n]))
          rows.push(lines[n].split("|").slice(1, -1));
        n++;
      }
      n--;
      output.push(
        '<div class="table"><table>' +
          rows
            .map(
              (row, r) =>
                "<tr>" +
                row
                  .map(
                    (cell) =>
                      "<" +
                      (r === 0 ? "th" : "td") +
                      ">" +
                      inline(cell.trim()) +
                      "</" +
                      (r === 0 ? "th" : "td") +
                      ">",
                  )
                  .join("") +
                "</tr>",
            )
            .join("") +
          "</table></div>",
      );
    } else if (!line.trim() || line === "---") flush();
    else {
      if (list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return output.join("\n");
}
const csvCell = (text) => {
  const raw = String(text ?? "");
  return (
    '"' + (/^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw).replace(/"/g, '""') + '"'
  );
};
export function exportNotebook(book, format, includeComments = true) {
  if (format === "xlsx") return citationsWorkbook(book);
  const comments = (f) =>
    includeComments
      ? commentsFor(f)
          .map(
            (c) =>
              `**${c.author}**${c.resolved ? " · Resolved" : ""}\n\n${c.text}${c.replies?.length ? "\n\n" + c.replies.map((r) => `Reply — ${r.author}: ${r.text}`).join("\n\n") : ""}`,
          )
          .join("\n\n")
      : "";
  const body =
    "# " +
    book.title +
    "\n\n" +
    (book.findings.length
      ? "## Summary\n\nLocal demo · Automatically extracted from saved records.\n\n" +
        generatedNotebookSummary(book) +
        "\n\n"
      : "") +
    ((book.nextSteps || []).length
      ? "## Next steps\n\n" +
        book.nextSteps
          .map((t) => `- ${t.done ? "[x]" : "[ ]"} ${t.text}`)
          .join("\n") +
        "\n\n"
      : "") +
    book.findings
      .map(
        (f) =>
          markdown(f).replace(/^# /, "## ") +
          (f.contentMarkdown !== undefined && f.result.sources.length
            ? "\n\n### Sources\n" +
              f.result.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")
            : "") +
          (comments(f) ? "\n\n### Comments\n\n" + comments(f) : ""),
      )
      .join("\n\n---\n\n");
  if (format === "csv")
    return {
      body:
        "\uFEFF" +
        [
          ["Block", "Title", "Author", "Year", "URL"],
          ...book.findings.flatMap((f) =>
            f.result.sources.map((s) => [
              f.question,
              s.title,
              s.author,
              s.year,
              s.url,
            ]),
          ),
        ]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n"),
      type: "text/csv;charset=utf-8",
      extension: "csv",
    };
  if (format === "json")
    return {
      body: snapshot(book, book.accessRole || "editor"),
      type: "application/json",
      extension: "json",
    };
  if (format === "html")
    return {
      body: `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escapeHtml(book.title)}</title><style>body{font:16px/1.6 system-ui;color:#243746;max-width:880px;margin:48px auto;padding:24px}p,li{overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid #dce3e9;font-size:12px}.table{overflow-x:auto}a{color:#0067a5}@media print{body{margin:0}}</style><p>Notebook snapshot · saved content${includeComments ? " and comments" : ""}</p>${readableHtml(body)}<h2>Original sources</h2>${book.findings
        .flatMap((f) => f.result.sources)
        .filter((s) => /^https?:\/\//i.test(s.url))
        .map(
          (s) =>
            `<p><a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a></p>`,
        )
        .join("")}</html>`,
      type: "text/html;charset=utf-8",
      extension: "html",
    };
  return { body, type: "text/markdown;charset=utf-8", extension: "md" };
}
export function downloadNotebook(title, file) {
  const url = URL.createObjectURL(new Blob([file.body], { type: file.type }));
  const a = document.createElement("a");
  a.href = url;
  a.download =
    (title.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "Notebook") +
    "." +
    file.extension;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
