import test from "node:test";
import assert from "node:assert/strict";
const seed = [
  {
    id: "a",
    title: "Research",
    findings: [
      {
        id: "one",
        question: "Human cells",
        note: "Keep legacy observation",
        result: {
          summary: "Evidence",
          sources: [
            {
              title: "Study",
              url: "https://example.com",
              author: "Author",
              year: 2020,
            },
          ],
        },
      },
      {
        id: "two",
        question: "Mouse cells",
        result: { summary: "Mouse evidence", sources: [] },
      },
    ],
  },
];
const load = () => import("../src/notebook-flows.js");
test("multiple comments preserve legacy note and stay scoped; replies, resolution and deletion persist", async () => {
  const { changeNotebook, commentsFor } = await load();
  let books = changeNotebook(seed, "a", {
    type: "comment-add",
    findingId: "one",
    text: "Check human evidence",
    id: "c1",
    now: "2026-10-06T12:00:00Z",
  });
  assert.equal(commentsFor(books[0].findings[0]).length, 2);
  assert.equal(
    books[0].findings[0].comments[0].text,
    "Keep legacy observation",
  );
  books = changeNotebook(books, "a", {
    type: "comment-reply",
    findingId: "one",
    commentId: "c1",
    text: "Next step",
    id: "r1",
  });
  books = changeNotebook(books, "a", {
    type: "comment-resolve",
    findingId: "one",
    commentId: "c1",
    resolved: true,
  });
  assert.equal(books[0].findings[0].comments[1].replies[0].text, "Next step");
  assert.equal(books[0].findings[0].comments[1].resolved, true);
  assert.equal(commentsFor(books[0].findings[1]).length, 0);
  assert.equal(seed[0].findings[0].note, "Keep legacy observation");
  assert.throws(
    () =>
      changeNotebook(books, "a", {
        type: "comment-add",
        findingId: "one",
        text: "   ",
      }),
    /empty/,
  );
});
test("reordering keeps complete blocks and own blocks have no invented sources", async () => {
  const { changeNotebook } = await load();
  let books = changeNotebook(seed, "a", {
    type: "block-move",
    findingId: "two",
    direction: -1,
  });
  assert.equal(books[0].findings[1].note, "Keep legacy observation");
  books = changeNotebook(books, "a", {
    type: "block-add",
    title: "Experiment plan",
    text: "## Next step\nValidate separately.",
    afterId: "two",
    id: "own",
  });
  assert.deepEqual(
    books[0].findings.map((f) => f.id),
    ["two", "own", "one"],
  );
  assert.deepEqual(books[0].findings[1].result.sources, []);
});
test("permission preview and imported role actually constrain changes", async () => {
  const { changeNotebook, snapshot, importSnapshot } = await load();
  const imported = importSnapshot(snapshot(seed[0], "viewer"), "imported");
  assert.equal(imported.accessRole, "viewer");
  assert.throws(
    () =>
      changeNotebook([imported], "imported", {
        type: "block-add",
        title: "No",
        text: "No",
      }),
    /read-only/,
  );
  const commenter = { ...imported, accessRole: "commenter" };
  assert.doesNotThrow(() =>
    changeNotebook([commenter], "imported", {
      type: "comment-add",
      findingId: "one",
      text: "Feedback",
      id: "c",
    }),
  );
  assert.throws(
    () =>
      changeNotebook([commenter], "imported", { type: "rename", title: "No" }),
    /read-only/,
  );
  assert.throws(
    () =>
      importSnapshot(
        '{"format":"co-scientist-notebook","version":1,"book":{"title":"Bad","findings":[{}]}}',
      ),
    /Invalid/,
  );
});
test("failed storage writes never acknowledge a mutation; reload keeps complete data", async () => {
  const { persistNotebooks, changeNotebook } = await load();
  let disk = JSON.stringify(seed);
  const next = changeNotebook(seed, "a", { type: "rename", title: "Renamed" });
  assert.throws(
    () =>
      persistNotebooks(
        {
          setItem() {
            throw Error("Full");
          },
        },
        next,
      ),
    /Full/,
  );
  assert.equal(JSON.parse(disk)[0].title, "Research");
  persistNotebooks(
    {
      setItem(key, value) {
        assert.equal(key, "cosci-books-v2");
        disk = value;
      },
    },
    next,
  );
  assert.deepEqual(JSON.parse(disk), next);
});
test("exports separate comments, retain citations, escape HTML and neutralize spreadsheet formulas", async () => {
  const { exportNotebook } = await load();
  const book = { ...seed[0], title: "<script>bad</script>" };
  assert.match(exportNotebook(book, "md").body, /Comments/);
  assert.match(exportNotebook(book, "md").body, /https:\/\/example.com/);
  assert.ok(
    !exportNotebook(book, "html").body.includes("<script>bad</script>"),
  );
  const csvBook = {
    ...book,
    findings: [{ ...seed[0].findings[0], question: '=HYPERLINK("evil")' }],
  };
  assert.match(exportNotebook(csvBook, "csv").body, /'=HYPERLINK/);
});
test("citation workbook is a valid ZIP with three XML sheets and no formula cells", async () => {
  const { citationsWorkbook } = await import("../src/notebook-citations.js");
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { execFileSync } = await import("node:child_process");
  const dir = mkdtempSync(tmpdir() + "/cosci-xlsx-");
  try {
    const file = dir + "/citations.xlsx";
    writeFileSync(file, citationsWorkbook(seed[0]).body);
    assert.match(
      execFileSync("/usr/bin/unzip", ["-t", file], { encoding: "utf8" }),
      /No errors detected/,
    );
    const workbook = execFileSync(
      "/usr/bin/unzip",
      ["-p", file, "xl/workbook.xml"],
      { encoding: "utf8" },
    );
    for (const name of ["Literature", "Web", "Computational"])
      assert.ok(workbook.includes(`name="${name}"`));
    const sheet = execFileSync(
      "/usr/bin/unzip",
      ["-p", file, "xl/worksheets/sheet1.xml"],
      { encoding: "utf8" },
    );
    assert.ok(sheet.includes("https://example.com"));
    assert.ok(!sheet.includes("<f>"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("deletion undo preserves the complete edited comment and replies without overwriting later posts", async () => {
  const { changeNotebook, commentsFor } = await load();
  let books = changeNotebook(seed, "a", {
    type: "comment-add",
    findingId: "one",
    text: "First",
    id: "post",
  });
  books = changeNotebook(books, "a", {
    type: "comment-reply",
    findingId: "one",
    commentId: "post",
    text: "Reply",
    id: "reply",
  });
  books = changeNotebook(books, "a", {
    type: "comment-edit",
    findingId: "one",
    commentId: "post",
    text: "Edited",
  });
  books = changeNotebook(books, "a", {
    type: "comment-reply-edit",
    findingId: "one",
    commentId: "post",
    replyId: "reply",
    text: "Edited reply",
  });
  const removed = commentsFor(books[0].findings[0])[1];
  books = changeNotebook(books, "a", {
    type: "comment-delete",
    findingId: "one",
    commentId: "post",
  });
  books = changeNotebook(books, "a", {
    type: "comment-add",
    findingId: "one",
    text: "Later",
    id: "later",
  });
  books = changeNotebook(books, "a", {
    type: "comment-restore",
    findingId: "one",
    comment: removed,
    index: 1,
  });
  assert.deepEqual(
    commentsFor(books[0].findings[0]).map((c) => c.text),
    ["Keep legacy observation", "Edited", "Later"],
  );
  assert.equal(
    commentsFor(books[0].findings[0])[1].replies[0].text,
    "Edited reply",
  );
  assert.throws(
    () =>
      changeNotebook(books, "a", {
        type: "comment-restore",
        findingId: "one",
        comment: removed,
        index: 1,
      }),
    /already restored/,
  );
});
test("imported observations retain authorship and cannot be edited by the recipient", async () => {
  const { changeNotebook, importSnapshot, snapshot, commentsFor } =
    await load();
  const imported = importSnapshot(snapshot(seed[0], "commenter"), "copy");
  assert.equal(commentsFor(imported.findings[0])[0].author, "Original author");
  assert.throws(
    () =>
      changeNotebook([imported], "copy", {
        type: "comment-edit",
        findingId: "one",
        commentId: "legacy-one",
        text: "Overwrite",
      }),
    /Only the author/,
  );
});
