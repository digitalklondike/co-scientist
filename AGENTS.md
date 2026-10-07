# Co-Scientist — project instructions

This file is the current, consolidated source of truth for the design and implementation decisions accepted with the user. It replaces the previous chronological list of experiments. Where older design notes or references disagree, follow this file and the user's latest explicit feedback. Record durable new decisions here after each correction; update the relevant rule instead of appending contradictory versions.

## Product scope and honesty

- Build a local interactive scientific research assistant, based on the client's video and the user's accepted refinements. Keep the white/blue scientific identity, English UI and Inter.
- The user's own editable scientific question is the primary entry point. Examples fill the question without automatically submitting it. Tool choice is automatic; do not introduce model or answer-length settings. Advanced demo plans use explicit confirmation buttons.
- Client clarification, 7 October 2026: home cards only prefill example prompts. The real system orchestrates agents by user intent, not by the clicked card or exact wording. Equivalent typed requests trigger the same workflow. Ambiguous mechanism questions may ask whether the user wants published evidence or new hypotheses; target profiles/dossiers require that intent to be expressed. Do not present these cards as agent selectors.
- Literature, hypothesis, comparison and target-profile responses are prepared examples. CSV statistics and charts are actual local calculations. Use the actual three-paper demo scope and resource counts; never invent a larger source library or connections to Bayer systems.
- Notebook discussions retrieve saved content locally. Clearly label Local demo / saved content only. Do not imply live AI, cloud persistence or product collaboration capabilities.
- Opening sources or a paper is discovery, not proof that evidence has been read or verified. Our onboarding is a UX proposal adapted from the interview and references, not a client-approved sequence.
- Preserve research records, saved answers, sources, notes and per-finding conversations on refresh. Start with an honest empty Notebook when nothing has been saved. Guidance resets on reload independently of persisted work.

## Shared component system

- Use the installed shadcn/ui source components in `src/components/ui`, Radix primitives, Tailwind v4 and the `@` alias. Compose Sidebar/Sheet, Tabs, Avatar, Button, Input, Textarea, Label, Badge, Dialog, Accordion, DropdownMenu, Tooltip, Card, Table, Select, Progress and Spinner rather than recreating their behaviour.
- Use Lucide icons consistently and the shared Co-Scientist logo/avatar for assistant identity. A generic chat icon must not replace the assistant logo.
- Reuse component variants, semantic colour tokens, radius tokens and shared spacing. Do not create a separate visual language for toasts, forms, menus or side panels.
- Keep `components.json` and the registered Studio components. Preserve the Studio license in `verification/shadcn-studio-LICENSE.txt` when those assets are used.
- Use `src/theme.css` for shared role tokens, typography and continuous scientific text rules. Compose layouts with Tailwind utilities. Do not restore legacy `styles.css` / `readability.css` or add corrective layers over an obsolete shell.
- Keep the light theme regardless of OS dark mode. No decorative panel/header borders, nested cards or independent shadow system. Essential dividers, field strokes and keyboard focus rings remain visible.

## Palette, typography and shapes

These colours are an adaptation of the client video, not an official Bayer brand specification. Use semantic tokens rather than repeating hex values in components.

| Role | Prototype value |
| --- | --- |
| Background / white work surface | #ffffff |
| Foreground | #243746 |
| Primary action / link | #0067a5 |
| Muted text | #526777 |
| Secondary tonal surface | #f2f5f7 |
| Accent surface | #d9e8f2 |
| Border | #dce3e9 |
| Field stroke | #c1cdd7 |

- Use a small type scale: 12px labels, actions and metadata; 16px reading text and standard text inputs; 24px/30px semibold section and answer headings; 32px/40px semibold page titles. Keep shared font and tight heading tracking. The left sidebar and shared search fields are the user-requested 14px exceptions; elsewhere do not introduce 14px overrides. `text-sm` is the project's 12px UI size.
- All left-sidebar text uses the shared `--text-navigation` token: 14px with a 20px line height, including brand/account text, New research, research-history search, Recent research, research titles, Show all research and related helper text/tooltips. Apply it through an explicitly typed font-size utility so component class merging does not mistake it for a colour. Apply the same size in the mobile drawer. New research and search use weight 500. New research uses the primary colour; the search placeholder and icon stay muted gray, with normal foreground for entered text. Search hover/focus changes the field stroke, not its text/icon colour.
- Text buttons use moderate `rounded-md` corners, not capsule pills. Icon-only controls are circular. Use the shared radius scale; do not invent per-component rounding.
- Material inspiration applies to tonal surfaces, hierarchy and spacing. It must not inflate cards or force Material's entire button shape system.
- Actions at the same level share a variant. Edit answer and Discuss finding use compact secondary Buttons with a light tonal background. Edited in Notebook is quiet plain text at the right, not another badge or button.
- On the tonal notebook header, Add research uses the shared secondary Button with a white background token so its surface remains visibly distinct. Retain the shared accent hover and focus states.
- Destructive menu labels and icons use the same destructive colour. Use the DropdownMenuItem destructive variant and ensure its icon inherits or explicitly uses that token.

## Workspace and navigation

- Use a soft gray canvas with a white rounded central workspace. Keep research navigation on the left and the account avatar at its bottom, without a divider above it. The account avatar uses a primary-tinted background and primary initial.
- Chat / Scenarios / Notebook tabs are equal-width columns, horizontally centred in the fixed workspace header. Desktop combined width is 360px; navigation toggle remains left and help/demo controls right. Below 640px put tabs in their own second header row to avoid overlaps at narrow widths.
- Use the registry-installed neutral shadcn Tabs with one white active surface. Disable the primitive's duplicate active background/shadow. Measure trigger geometry and observe resizing. Label/icon colour changes on hover; the tab background does not.
- Animate the active surface with the Studio/Motion selection pattern over 220ms. Keyboard selection and reduced-motion selection are immediate. Link trigger and panel IDs explicitly. Mobile tab targets are at least 44px tall; hide Notebook count below 640px.
- Keep recent research compact: five distinct question topics, preferring the active record for a repeated topic. This deduplicates navigation only; retain every individual research record in search and Show all research. Do not rename or delete records with repeated questions.
- Each submitted task has its own record ID. A pending task appears as the first normal chat row with its question, Spinner and tooltip, without replacing another stored record. Use single-line ellipsis and expose the full question on hover/focus and in its accessible name. Do not repeat category/date metadata under rows.
- Research-navigation rows use moderate `rounded-sm` corners (10px), not capsule-like `rounded-xl` or full rounding. Selected/pending rows have a white surface and foreground text, retained on hover. Inactive hover uses a primary tint. Preserve keyboard focus states.
- Research-history search uses the same SearchInput as scenario search and notebook-library search. Preserve the common field styling rather than adding sidebar-specific height, padding or typography overrides.
- Do not restore a duplicate left Sources panel or a permanent right Notebook rail. Sources belong to their answer; optional contextual panels open for a real task.
- Main navigation resets the document scroll after rendering. Returning to Chat starts at the top without a competing guide auto-scroll.

## Research scenarios

- Scenarios are editable starting prompts, not manual agent selectors. The request and attached data determine the workflow; clicking a card never submits a request. Preserve intent clarification for ambiguous evidence/hypothesis questions.
- After onboarding is skipped/completed, the desktop Home overview fits its composer, nine scenario cards and catalog button within the available viewport without scrolling. Vertically centre the complete composition in the available content area, with a clear 48px gap from the composer to the scenario section (32px on short desktops). Use a compact composer and omit the introductory supporting sentence below 900px viewport height. Do not achieve fit by clipping controls or hiding the scrollbar. Narrow screens, zoom and expanded editing states may reflow and scroll to preserve access.
- The bottom three home cards form a white-faded preview with a centred secondary Browse all scenarios button that opens Scenarios. The faded cards are inert and aria-hidden; all nine remain fully accessible in the catalog. When a scenario/context is selected or a file/clarification is open, prioritise the composer and its task controls instead of repeating the preview below them.
- Home and Scenarios use one ScenarioCard with identical anatomy, dimensions, padding and states at the same viewport: icon and title (up to two lines), a short outcome (up to two lines) when height permits, then Try this at the bottom left and an arrow at the bottom right. Preserve this footer placement; do not move the arrow into the title row. Share the same grid width and breakpoints; do not create a separate compact Home variant. Responsive density applies to both placements, and the full outcome stays in the accessible name. Use distinct meaningful Lucide icons. Icon colours encode topic consistently in both placements: Scientific evidence is sky blue, Hypotheses violet, Data & visualization emerald, Targets & mechanisms rose and Study planning amber. Keep the topic Select's small colour markers in the same hues; do not assign arbitrary colours per card.
- The demonstration catalog contains 20 scenarios; Home retains its original nine-card preview. Put the outlined search field and topic Select in one row, with the search taking the remaining width. Use five topics: Scientific evidence, Hypotheses, Data & visualization, Targets & mechanisms and Study planning, plus All topics. Topics organise prompts; they do not select agents. Search and topic filtering combine, with an accurate result count and a useful empty state that resets both filters.
- Use a previous answer lives in Scenarios, outside the compact Home overview, as a collapsed shared Accordion above the search row. Show the actual previous question in its trigger. Inside, explain that Summarize this answer / Review its limitations start a new question with that answer attached; for data, offer review of its saved CSV. Do not show an unexplained, dominant Continue your research section. Choosing an action attaches an explicit, removable research-context chip to the composer; keep that provenance with the resulting answer and notebook copy.
- Added demonstration scenarios may be prompt templates without implemented answers. Mark those explicitly in the draft hint, omit Use demo example when no corresponding example exists, and preserve the editable draft on submission with a clear limitation. Do not return a generic cardiac answer or column means as if they fulfilled an unimplemented experiment, data-quality or other workflow.
- This prototype retrieves actual passages from the selected answer, or reruns real calculations using its attached CSV. Snapshot the selected content at submission, retain its own sources, and do not substitute an unrelated prepared report. Clearly label saved-content retrieval; do not imply live AI or new evidence generation.

## Forms and interaction states

- Inputs and textareas retain a clear outline. Hover changes the stroke to primary with a short border-colour transition; it never changes the background. Disabled fields do not respond to hover. Keep focus-visible rings and accessible labels.
- All search fields use the shared SearchInput composed from Input, Lucide Search and the shared clear Button. Use one 44px height, 14px/20px medium text from `--text-search`, moderate corners, transparent background, persistent field stroke, muted-gray placeholder/icon and foreground entered text. Keep the 16px icon centred 12px from the left and text inset 36px. Show the same clear control for a nonempty query. Call sites may vary width and accessible labels, but must not override the field's visual styles. Reuse Input's hover/focus/disabled states.
- Shared Select triggers follow the same field-stroke behaviour, including a primary border while open. Their chevron changes to primary on hover/focus/open and rotates upward while open, with a short transition and reduced-motion support. Topic options use a quiet 6px colour dot without a surrounding coloured tile or halo; keep the category colours consistent with cards.
- The research composer outlines the entire form, including integrated guidance and footer, on hover/focus. Its inner textarea does not receive a second border.
- The composer groups editable input, CSV attachment, examples and Ask. Capabilities/available sources live in Help, outside the task path, and explain the real demo limitations.
- Place the discussion submit Button at the textarea's right edge. The order inside is Ask then the upward arrow. Use the same layout in the desktop panel and mobile Sheet.
- Keep one primary action per decision context. Shared mobile Button targets are at least 44px; do not confuse a status badge with an action.

## Research answer and progressive disclosure

- Preserve the chat anatomy: right-aligned tonal user question labelled Your question, then Co-Scientist identity and continuous scientific text. Do not replace the response with a grid of Evidence/Limitations cards, reading-time metadata or a second local tab system.
- Show the direct answer and key limitations immediately. Requested CSV charts remain visible as the result; only their calculation details collapse.
- Order the literature result as direct answer → Sources used / step 2 → detailed-analysis preview → save / step 3 → recommended follow-up questions. Keep export grouped under More.
- Detailed analysis starts as the beginning of the actual report with a white fade and a compact centred Read full analysis Button with label and chevron. No document icon, stretched full-width trigger, large empty button or Brief/Full tabs.
- Preserve actual report sections: overview, experimental systems table, human evidence, animal/in vivo evidence, in vitro evidence, endpoint interpretation, gaps and conclusion. Markdown export retains the structured report and actual citations.
- Expanding/collapsing must smoothly animate the same content container rather than swapping preview/full DOM. Use 500ms and cubic-bezier(.4,0,.2,1), with a fading preview mask. Chat uses the real Accordion; Notebook uses eased height motion. Reduced motion changes state immediately.
- Collapsed overflow is inert/aria-hidden and must not expose hidden links to focus. Expanded content is accessible. Source and analysis triggers highlight label/chevron rather than tinting an entire row.
- Sources used is a compact tonal `rounded-2xl` block with 20px horizontal padding. Do not add a second tonal card when ResearchGuide already wraps it.
- Expanded paper rows have equal 16px padding and white hover/focus backgrounds within the tonal sources surface. Place straight horizontal dividers on square list-item wrappers, separate from each rounded interactive row, with a small vertical inset so hover surfaces do not touch the lines. Never apply dividing borders to rounded links. Keep links, citations and study tags readable; do not squeeze horizontal hover padding.
- Preserve the source Accordion subtree when guidance completes so Radix can animate without remounting. No forced auto-scroll away from the expanded source list.

## Practical contextual onboarding

- Use one shared ResearchGuide integrated into the actual working controls. No floating coachmarks/tooltips, portal arrows, sticky lesson cards, independent sidebar checklist or static step navigation.
- Matching composer, sources and save surfaces use a compact tinted hint at the TOP, followed by the actual control. Use 12px step metadata, 16px instruction and an accessible Skip/Finish action; body/header padding is 16px mobile and 20px desktop.
- Step 1 asks the user's own scientific question; CSV tasks ask what columns to explore. Examples remain editable and non-submitting.
- Step 2 attaches to the real Sources used disclosure after the direct answer. Opening the disclosure completes discovery; original paper links stay available. Local CSV uses actual file calculation details. Never call this verification.
- Completed discovery retains its recognizable frame with a compact green header, check and 2 of 3 · Explore sources · Complete. Do not replace it with an unrelated unframed status line.
- Step 3 appears from the initial result, after the analysis preview, and contains a finding preview, preserved answer/source information, actual destination and the single save/open control. Saving is available before sources open and remains nonblocking. No required fourth notes step or repeated save buttons.
- Saved guidance offers the real Open in Notebook action and Finish. Completing/skipping ends guidance; reloading restarts it while retaining all saved work.
- Trial authorized 7 October 2026: show starting points with plain action titles and explain their expected outcomes in Scenarios and when home height permits. The home grid follows the nine-card preview rule above. Clicking fills an editable template and selects its topic placeholder; it does not submit or choose a hidden agent. Add a contextual hint plus Use demo example where a working prepared example exists (CSV examples explicitly attach sample data). Validate unfinished placeholders without losing the draft. This is a trial for review, not a confirmed final direction.
- Demonstrate clarification of ambiguous questions with published-evidence vs new-hypothesis choices before execution. Keep explicit requests direct and route typed equivalents identically to examples. The local rules are only a prototype; do not claim production intent recognition. Preserve unsupported topics and explain the available prepared scope rather than returning cardiac results as if they answered an unrelated topic.
- Preparation progress tracks elapsed demo time independently of named stages. Reset and clear timers on start/completion/cancellation. Compact stage rows reserve icon/badge space to avoid layout shifts; completed checks are green, current Spinner/progress blue. Cancel research uses a soft destructive background and destructive text.

## Notebook information architecture

- A notebook is a user-created collection of saved answers, sources and personal notes. It can contain findings from different research records and saved discussion responses; it is not a single research conversation.
- Preserve origin links/IDs so each finding can open its original research. Label Saved from research or Saved from a notebook conversation above each title. Do not imply a notebook's title is the origin of every contained answer.
- Notebook has two levels: searchable library → opened notebook document. The library uses full-width search beside New notebook and a compact single-column list. Do not restore a permanent findings rail, three-pane Notebook or selected-finding search layout.
- Library rows have equal 24px padding, 16px corners and a 40px tonal icon tile with moderate square corners. Main text has title and one preview line only. On the right show a white badge visibly labelled N saved answers (singular for 1), not a bare numeral or third text line.
- An opened notebook uses one aligned max-width document column. Saved answers remain on the common white surface, without separate tonal cards. The scrolling container spans the workspace width so its scrollbar sits at the outer right edge beneath the fixed app header.
- Give the notebook header a quiet tonal surface that extends beyond the text column by equal padding. Page title is 32px/40px; answer titles remain 24px/30px. Put the white saved-answer count tag beside the page title and explain that the collection contains answers, sources and personal notes. No divider under this header.
- All notebooks sits ABOVE and OUTSIDE the tonal header. Keep 16px internal horizontal padding and offset the Button 16px left so its arrow aligns with page/body text; do not remove padding to fix alignment.
- Separate saved-answer blocks with a subtle horizontal divider and 40px spacing. Sequential 01/02 markers sit in the left margin on desktop and inline on mobile, alongside the origin caption. This numbering must make block boundaries clear without creating cards.
- Keep each summary, Edit answer / Discuss finding secondary Buttons, sources and autosaved notes visible. Collapse only detailed analysis behind the faded Read full analysis pattern. Do not hide all actions/notes in a whole-answer expansion.
- Rename notebooks through real controls. Edit the saved Markdown with explicit Save/Cancel, preserving the original research. Notes save automatically. Keep empty states useful and retain data on refresh.

## Contextual panels and finding discussion

- Save to Notebook opens a destination selector even when there is only one notebook. After saving, transition the SAME contextual panel to the saved answer, sources and autosaved notes. Opening an already-saved result from Chat opens this panel; Open full notebook navigates to the full document and closes it. Avoid duplicate saves.
- Desktop contextual Notebook/discussion panels are optional separate white rounded cards OUTSIDE the central SidebarInset, with a gray canvas gap. Use a 380px right card and animated workspace resizing. At widths below 1024px use an accessible Sheet; do not add a desktop overlay or focus trap.
- Discuss finding opens a panel scoped to that finding. Each finding owns its persisted conversation; no independent context dropdown. Closing restores the document width. The message history scrolls independently and the composer stays visible below it.
- User messages are right-aligned tonal bubbles labelled You. Assistant messages use the shared 28px Co-Scientist logo/avatar and label, then readable response text. Distinguish roles clearly instead of rendering all messages as continuous identical text.
- Show an honest Searching saved answer pending state with animated dots and a subtle response entrance. Respect reduced motion, block duplicate submissions and clear pending timers when the conversation unmounts. Never simulate private reasoning traces or claim live AI.
- Auto-scroll the conversation only while following its latest messages; do not pull a reader away from earlier content.
- Save response is a visible outlined primary Save to notebook Button with bookmark icon. Completion is a readable tonal check + Saved to notebook state, not faded disabled text. Saving creates a new finding in the same collection and preserves its parent/message provenance.

## Removal and notifications

- Each finding has an accessible Actions menu beside Open research, with Remove from notebook. Remove the saved copy only; keep original research intact.
- Offer Undo in a persistent actionable toast. Restore the answer, sources, notes and thread at its original position without overwriting subsequent edits. If the removed finding is discussed, close its panel. Reconcile source-message saved state so a removed response can be saved again. Preserve useful empty notebooks.
- All transient notifications use Sonner. Reuse one NotificationToast rendered through Sonner custom and actual shared Badge / Button components. No handwritten Alert toast layer or unrelated Material snackbar theme.
- Adapt notification references to the product's own component language: white title header, neutral border, shared 12px corners and 16px padding; use 16px message/details text and 12px controls/metadata. Expanded descriptions have a distinct soft secondary-gray surface, with the timer continuing on that same lower surface. Short notifications and collapsed details retain a white surface without an empty description block. A 16px status icon sits in a quiet 28px tonal Badge; success is green, information primary blue, warning amber and error destructive red. Keep equal alignment in an explicit grid, shared secondary action Buttons and circular icon Buttons. Do not reproduce a reference's miniature typography, coloured edge stripe or separate footer band.
- Bottom-centre placement; desktop width up to 420px, with responsive wrapping and 44px touch controls on narrow screens. Timed toasts show quiet metadata and a secondary Keep open / Allow auto-close Button, followed by an inset primary-blue progress track that uses the same language as research progress. On an expanded gray description surface, use white tonal controls and track so they remain distinct. Hover, keyboard focus, expanded details and Keep open pause the timer; reduced motion uses discrete progress updates. Sonner owns placement/dismissal, while one component-owned countdown controls expiry so the visual timer cannot disagree with auto-close.
- Show an accessible disclosure chevron only when a real, nonempty additional description exists. Use the shared Accordion, with details collapsed initially and aligned with the message text. Never show an empty expansion affordance for a short notification or for an action alone. Undo and other notification actions stay visible until acted on or dismissed; keep them beside the message on desktop and below it on mobile, without a fake progress bar or redundant persistence footer. Keep meaningful status colours, accessible dismissal and keyboard focus. Earlier dark snackbar, oversized status tiles and crooked icon/action layouts are rejected.

## References and design practice

- Use references to solve the actual interaction: Elicit for research hierarchy, Dropbox Dash for a concrete task entry, Intercom for help beside the real action, NotebookLM for collections and optional contextual panels, Maze/MagicPath for compact success notifications. Material informs flat tonal hierarchy and spacing; it does not override the product components.
- Mobbin reference rationale is in `../platform-ux/onboarding-references/`. Historical tour references include Canva (https://mobbin.com/flows/d3237fe5-9e7c-47ec-89e6-56ccfd951dc1), Miro (https://mobbin.com/flows/8b9e6af8-0a9c-422f-9285-73e5c96183fb) and NotebookLM/Gemini Notebook (https://mobbin.com/flows/24e7f24a-146f-43da-a6cc-ee77e5232f09). They do not authorize restoring rejected floating tours.
- The user suggested https://www.beautifului.dev/ for chat/motion inspiration. Treat it as a reference, not permission to introduce an unrelated style or dependency.
- Before substantial visual work, use Product Design context gathering when the source is unclear. A selected mock is the layout/anatomy/density source of truth, subject to subsequent explicit corrections.
- Preserve alignment, hierarchy and equal padding before adding decorative styling. Reuse one component for repeated anatomy and update shared variants instead of scattering one-off overrides.
- Use Motion, Sonner and shadcn/tw-animate-css for motion; avoid bespoke keyframes. Animate actual changes, keep focus/keyboard operation stable and support reduced motion. The explicit 500ms analysis expansion is intentional.

## Engineering and verification

- Build UI in `src/`. Preserve `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs` and `tests/sites-worker.test.mjs` for Sites handoff.
- Graft is installed. Before source context reads, read `.agents/skills/graft/SKILL.md` and use graft grep/ask/skeleton/callers to locate relevant spans. Its local cache indexes `src`; no deep LLM pass is required. Avoid global agent configuration changes.
- Run the local server and open its preview when needed; do not give server-start instructions for work you can run. Keep the local preview available after handoff.
- Verify affected real flows and responsive layouts, including question → answer → sources → save → notebook → notes, per-finding discussion and remove/Undo when changed. Verify keyboard focus, reduced motion and narrow layouts. Preserve all existing local data during verification.
- Use meaningful tests for data behaviour; do not add implementation-mirroring tests for small reversible visual changes. Before build/handoff run `npm run build` and relevant existing tests (`node --test tests/*.test.mjs`). Sites packaging must produce `dist/client/index.html`, `dist/server/index.js` and `dist/.openai/hosting.json`.
- Do not commit environment secrets, node_modules, dist, Graft caches or temporary verification assets. Keep `.gitignore` protections.

## Agreed GitHub workflow

- Repository: https://github.com/digitalklondike/co-scientist (public). Shared integration branch is `master`; this working branch is `Nikita`. Do not assume its name is `main` or rename it without a request.
- Each contributor works/pushes in their own branch. Direct pushes require collaborator access; public visibility alone does not grant it.
- When the user asks to upload to the shared branch, first fetch its latest state, preserve local work, integrate and resolve conflicts, run relevant checks, then merge/upload. Others pull `master` and integrate it into their working branches before continuing.
- Separate branches reduce interference but cannot guarantee conflict-free merges. Do not overwrite others' work or force-push the shared branch. A request to edit documentation does not itself request a GitHub push.
