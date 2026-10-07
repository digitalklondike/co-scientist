# Notebook UI system — 7 October 2026

## Reference and adaptation

Reviewed the [Studio component collection](https://shadcnstudio.com/components), [Base UI Button examples](https://shadcnstudio.com/docs/components/button?base=base) and their live preview, plus the Card, Badge, Button Group, Input, Dialog and Tooltip documentation. Studio offers variants rather than a single compulsory product layout. Its Button documentation recommends consistent action hierarchy, few variants, visible focus/disabled states and mobile touch targets.

The live button examples measured 36px default, 40px large, 32px small and 24px extra-small, with an 8px radius. Our adaptation uses the 40px size for toolbars and inputs, 32px for inline actions, and at least 44px on mobile. Existing moderate text-button corners and circular icon buttons remain as previously requested. We retain the installed Radix primitives: the reference also supports Radix, so no Base UI migration is needed.

The spacing scale below is our explicit product adaptation of Tailwind's 4px base and observed reference grouping. It is not claimed as a published Studio spacing specification.

## Roles and sizes

| Role | Notebook use | Treatment |
| --- | --- | --- |
| Primary | New notebook; Save; Post; Add block in its form; Download in its dialog | Client blue fill, white text |
| Tonal | Add research | Blue accent surface; stronger hover/pressed tint |
| Secondary | Comment index; Read full analysis; sources | Neutral filled surface |
| Outline | Add block in toolbar; Add comment; New folder | White surface with structural border |
| Ghost | Edit; Discuss; Open research; Back; Cancel | Quiet contextual action with visible hover/focus |
| Destructive | Delete confirmation; delete comment/reply | Soft red state, explicit label |
| Icon | Notebook/block/folder menus; discussion close | Named circular target; hover title |

Toolbar and form controls: 40px desktop. Inline text and small icons: 32px desktop. Mobile buttons, comment disclosure and text inputs: minimum 44px. Button icon/text gap: 8px. Standard horizontal padding: 16px; compact: 12px. Cards use a static full-row action instead of scaling their content when pressed. Other Notebook button presses use 0.96 scale, 150ms feedback, and reduced-motion suppression. Native focus rings remain.

## Spacing and hierarchy

| Distance | Use |
| --- | --- |
| 4px | Tight label/preview stack and minor metadata |
| 8px | Label to input; title to origin; related controls |
| 12px | Compact post contents, folder/list gaps |
| 16px | Content group internals; between independent toolbar groups; mobile surface padding |
| 24px | Page sections; desktop header/comments/dialog padding; library card padding |
| 32px | Desktop page inset |
| 40px | Separation and divider inset between saved blocks |

Both library and document use a max-w-4xl inner column. Notebook page title: 32/40px semibold. Saved block headings: 24px semibold. Reading content: 16px. Controls/metadata: 12px. The Notebook header surface extends beyond its aligned content by its padding. Origin metadata and title form one group; body, sources and comments retain separate spacing.

Share and Export are a named adjacent button group. Counts use one Badge composition. Existing Dialog, DropdownMenu, fields, Avatar, Sonner and Accordion remain; we add no decorative widgets unrelated to scientific work.

## Audit

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| Medium | Notebook toolbar and forms | 36/40/44px controls mixed in a single row | Shared scoped button/input sizes | Predictable alignment and touch targets |
| Medium | Finding titles on mobile | Open research constrained long titles to a narrow column | Title occupies full row; actions wrap below | Preserves reading hierarchy |
| Medium | Library rows | Icon-dependent button padding nested inside card padding; narrow text | Explicit zero inner padding; hide redundant mobile arrow | Equal insets and readable titles |
| Medium | Finding actions | Edit/Discuss filled like toolbar tools | Quiet ghost actions; primary commits remain blue | Clear action priority |
| Low | Comments/header/dialogs | 20px desktop padding mixed with 24px surfaces | 24px desktop surface padding | Shared spacing rhythm |
| Low | Count tags | Several handwritten styles | Shared Badge composition | Consistent metadata |

## Verification

Final build passed; 22 existing tests passed during this update. Browser checks cover library and document at desktop, 390px and 320px; mobile document and library have no horizontal overflow. Verified Add block dialog, disabled submit, focused input, comment composer/cancel, Notebook dropdown and Escape returning focus. Default tonal button is visible, desktop height 40px, mobile height 44px. No saved user data was changed during UI checks.

Hover/pressed/reduced-motion rules were inspected in source; no full slow-motion replay, RTL mirror, pseudo-localization, or 200% browser zoom audit was performed. This is an English, light-theme prototype. Approve for inspected layouts; those additional coverage items remain unverified.

## Refinement verified 7 October 2026

Notebook-only reading scale: S 14px/1.5 (table cells, references, hints), M 16px/1.7 (analysis), L 18px/1.65 (direct answer). Regular 400 and medium 500; research titles 24px/600. Chat Markdown retains its previous classes. Spacing uses 4px increments: overview 8px inset, item rows 32px desktop/44px touch, research cards 16px mobile/24px desktop inset and 24px between cards. Info callouts retain important instructions in the document; tooltips supplement icon controls.

Sources reviewed:
- https://www.notion.com/help/writing-and-editing-basics — block handles, contextual actions, callouts, to-do lists and document sections.
- https://shadcnstudio.com/docs/components/checkbox — Checkbox 4 uses a simple checkbox with strike-through for completed text. Adapted to installed Radix primitives.
- https://shadcnstudio.com/docs/components/tooltip — delayed, focus-accessible contextual information.
- https://shadcnstudio.com/docs/components/sortable — separate drag handles; applied to Notebook library and research contents. Alt+Up/Down provides a keyboard alternative; existing action-menu move controls remain available.

Chart example aggregates publication years from the block's actual saved sources. It is labeled as a source-count example and contains no invented effectiveness values. Table scrolling stays inside its bordered container on mobile.

Browser QA used a separate temporary Notebook: added two results without closing the picker, reordered with keyboard and pointer, checked a task, selected a chart bar, verified persisted order after reload, tested title sorting and 390px mobile width without page overflow. Test Notebook deleted with recoverable Undo. Existing notebooks, comments, sources and next steps preserved.

## Latest density correction — 7 October 2026

Supersedes the previous Info callout appearance: Notebook hints now use plain muted 14px body text, with no fill, border, padding or Info icon. The empty conclusion instruction uses 16px body text. Comment sections omit repeated local-demo metadata. Overview control row measures 48px on desktop (40px controls plus 4px inset), with 44px touch controls. Research cards retain their borders with 12px separation; their drag handles are removed. Contents is the dedicated research reorder surface; existing action-menu up/down alternatives remain.

Contents uses a floating drag preview, a subdued placeholder and 300ms no-bounce Motion layout transitions for neighboring items. Actual data is committed once on drop, not during preview. Global pointer-up handling survives DOM relocation of the captured handle. Escape and pointer cancellation restore the original order; reduced-motion settings disable layout transitions. Shared library manual sorting remains functional. Browser checks confirm pointer reorder, keyboard restoration of the original user order, missing card handles and removed comment metadata.
