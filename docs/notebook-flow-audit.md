# Notebook flow audit — 6 October 2026

Scope: Violetta’s Notebook workspace. Research chat remains in the persistent left sidebar. No GitHub pushes. Client facts come from the recorded demo; proposed usability improvements are explicitly distinguished below.

## Inventory and changes

| Flow | Client evidence | Before this pass | Result |
| --- | --- | --- | --- |
| Save research into a new/existing notebook | 07:47–08:07 | Implemented | Retained, original research stays separate |
| Rename notebook | 07:57 | Implemented | Retained, persistence acknowledged after writing |
| Edit/delete sections in Markdown | 08:15–08:28 | Implemented | Explicit Save/Cancel, recovery draft and navigation protection added |
| Follow-up conversation beside selected content | 08:11–08:15 | Implemented | Retained scoped conversations and save-response action |
| Notebook persistence | 08:34–08:38 | Local device implementation | Retained local storage, transactional writes for new actions |
| Folders, notebook search | Recorded Notebook interface | Search by title only; no folders | Folder create/rename/delete, move notebooks, full-content search in library |
| Add Block | Recorded Notebook interface | Missing | Titled Markdown block, insert after a selected block, own origin and no invented sources |
| Change block order | Grip visible in demo; actual drag behaviour unverified | Missing | Keyboard-accessible Move up/Move down; retains full block data |
| Search within an opened notebook | Usability proposal | Missing | Searches titles, saved content and comments; result jumps to its block |
| Notebook sharing/read or write | 15:48–16:06 | Missing | Viewer/Commenter/Editor preview and portable snapshot import/export; no live invitations |
| Export Notebook | Recorded Notebook interface | Markdown only | Markdown, HTML/print to PDF, citations XLSX/CSV, complete JSON snapshot |
| Citation export | 07:31–07:40 shows Excel with literature/web/computational tabs | Missing in Notebook | Real XLSX with Literature/Web/Computational sheets, plus CSV; empty evidence categories remain empty |
| Personal notes/comments | Separate comment feature not verified in client | One editable note per saved answer | Distinct tonal Comments surface, multiple posts, reply, resolve/reopen, edit/delete own comments, Undo, draft recovery |
| Find discussion across 10 topics | Usability proposal | Missing | Total count and open/resolved/all discussion index with jump to block |
| Duplicate/delete notebook | Usability proposal | Missing | Collection actions, explicit deletion dialog, Undo, source research preserved |

## Decisions and research

- [Notion comments](https://www.notion.com/help/comments-mentions-and-reminders): block context, separate discussions, resolved history and a page-level index. Adaptation: one section below each saved block and a notebook-wide index, rather than fragile selected-text anchors in editable Markdown.
- [Google Docs comments](https://support.google.com/docs/answer/65129?hl=en): explicit posting, replies, filtering and resolve/reopen. Recovery drafts are distinct from posted comments; saved output excludes unfinished text.
- [Google Drive sharing](https://support.google.com/docs/answer/2494822?hl=en): Viewer/Commenter/Editor actions differ. The prototype constrains controls and imported mutations by role. Portable JSON role flags are a workflow demo, not secure authorization. A production version needs authenticated membership, server-side authorization and shared storage.
- [Notion blocks](https://www.notion.com/help/writing-and-editing-basics): add content and move blocks. The prototype uses explicit insertion and accessible up/down actions rather than relying on dragging alone.
- [Notion exports](https://www.notion.com/en-gb/help/export-your-content): different formats serve editing, reading and backup. Source links and saved comments survive exports; JSON also retains discussion data.
- [Material cards](https://developer.android.com/develop/ui/compose/components/card): coherent content grouped on filled/outlined surfaces. Comments use the existing secondary surface, a structural border, blue icon, count and white individual posts; scientific prose stays on the white document.

## Limits

This is a local clickable prototype. There is no live AI, database connection, cloud synchronization, email invitation, remote revocation, notification delivery or simultaneous editing. File sharing creates a separate copy. PDF uses the browser’s print flow. Citation CSV contains the sources actually present, without inventing web/computational evidence. The video’s visible controls do not prove text-anchored commenting, comment roles, drag-reordering or version history existed in the client.

## Verification

- Production Vite build and Sites packaging succeed; all 22 repository tests pass.
- Browser: own-block creation, explicit comment posting, replies, editing, resolve/reopen, draft Save and leave, delete-reply Undo, folder creation/move/filter, block reordering, reply-text search and comment index.
- Browser import: a Viewer snapshot opens as a separate local copy; content editing and comment posting are unavailable, previous author is retained.
- Responsive check: 390 × 844 viewport, no document-level horizontal overflow; desktop comment surface visually inspected. 200% zoom and RTL were not tested.
- XLSX: external ZIP integrity check and openpyxl read-back confirm the three sheet names, original citation URLs, frozen header and styled cells. Native Excel UI was not tested.
- Export generation is tested; native browser download completion was not confirmed in the in-app browser. Snapshot import was checked with a local fixture.
- Temporary verification notebooks and folder were removed; original user research and collections were retained. Preview remains available locally.

## Implemented refinement — 7 October 2026

Scope: Notebook only; Chat screens, onboarding, sidebar content and conversation behaviour are unchanged.

The scenario audit supports formatting assistance and bounded local version history: researchers need to revise a saved synthesis without losing the evidence or discussions. The implementation preserves Markdown instead of introducing a second editor format. Five previous saved versions can be previewed and restored; restoring retains the current version in history.

Add research in the opened Notebook header now offers existing completed results and the existing new-research entry. Selecting an existing result stores a separate timestamped copy and prevents duplicate IDs in this Notebook. Old blocks with no recorded saved date explicitly show date unavailable.

Notebook and library search now cover full saved Markdown, source metadata, comments and replies. In-document matches show excerpts, highlighted text and match type. A comment/reply result opens the relevant discussion. Contents is an optional disclosure in the document, preserving the left chat sidebar.

Structured references belong in result.sources and citation exports, rather than remaining plain Markdown links. User-added references validate HTTP(S) URLs, prevent duplicate URLs and can be removed without deleting original scientific citations. Researchers can explicitly mark key evidence. This is a selection, not evidence verification.

An open-thread count distinguishes unfinished discussions from total posts. Optional next steps are a local checklist, not assignments or notifications. Review overview shows an explicitly chosen conclusion, selected key sources (all saved sources until selected) and open discussions. It works with the existing Viewer preview; a separate reviewer mode would duplicate permissions and navigation.

Validation: automated state tests cover restoration without data loss, five-version bounds, duplicate research, URL validation, role restrictions, precise reply matching, snapshot round-trip and task/reference export. Browser checks cover creation, adding existing research and a personal block, formatting preview, version restoration, manual source, key evidence, checklist, open-comment search/jump, Viewer restrictions and reload persistence. Responsive checks are performed against the local prototype; temporary QA data is removed afterwards.
