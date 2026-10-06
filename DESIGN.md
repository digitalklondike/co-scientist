# Research assistant UI

The source is the client product shown in the video, plus the user's accepted conversational first task. This is a light scientific workspace with English UI and Inter. The onboarding is help at the real action, rather than a three-step course.

## Shared components

The complete UI now uses shadcn/ui source components, Radix base, installed through the official CLI: Sidebar/Sheet, Tabs, Avatar, Button, Textarea, Input, Label, Badge, Dialog, Accordion, DropdownMenu, Tooltip, Card, Alert, Table, Select and Progress. Composition uses Tailwind v4 utilities. The former styles.css and readability.css are no longer imported. src/theme.css contains role tokens, typography, base styles and continuous scientific text rules, with no corrective CSS for the old shell. Future components use components.json and the @ alias. Lucide icons are shared with the component library.

## Palette

The white/blue appearance is adapted visually from the client video. The client has not supplied official brand tokens; these hex values are the prototype theme, not a claim about Bayer's official brand specification.

| Role | Value |
| --- | --- |
| Background | #ffffff |
| Foreground | #243746 |
| Primary action / links | #0067a5 |
| Secondary text / placeholder | #526777 |
| Quiet surface | #f6f8fa |
| Selected surface | #edf5fa |
| Border | #dce3e9 |
| Field border | #c1cdd7 |

Measured WCAG contrast: body on white 12.28:1; secondary/placeholder on white 5.89:1; white on primary 6.03:1; welcome badge 6.74:1. Disabled controls are intentionally subdued. No dark appearance is offered; OS dark mode must not change field backgrounds.

## Density and hierarchy

UI/metadata/buttons: 12 px. Body/inputs: 16 px. Headings: 24 px; page title: 32 px where appropriate. Never 14 px. Source count uses the actual demo resources. Radius uses the shadcn scale with a 10 px base. Answer is continuous text, without a card border around it. User question has a quiet background and a Your question label. Sidebar rows are 36 px, with one-line ellipsis and the full question in a tooltip and accessible name. Only five unique recent questions are initially shown.

## Flow

Header navigation uses the registry-installed shadcn Tabs default variant: a neutral track, foreground labels/icons and a single white active surface. Motion slides this surface between measured trigger positions over 220ms, following Studio's selection pattern. Primitive selection backgrounds/shadows are disabled to avoid duplication. Reduced motion and keyboard selection are immediate. Tabs occupy equal grid columns, stay centered and have at least 44px touch height on mobile; the count is hidden below 360px. Each tab points to its associated panel. Shared mobile Button targets have a 44px minimum; sources expand before guided scrolling.

1. All three steps and saved confirmation use one ResearchGuide component with the same white shadcn Card, explicit step label, 16px heading, padding and maximum width. Step 1 asks for a research question; when a CSV is attached it asks which columns to explore. The composer keeps editable input, attachments, examples and Ask together. Sources and capabilities is available in Help, outside the onboarding path.
2. On the result screen, the common ResearchGuide above the user's question identifies Research onboarding / Step 2 of 3. It stays beneath the sticky app header while reading. Review papers/file details expands and moves immediately to Sources used, with room for both headers. Guidance does not interrupt scientific prose. A click never means evidence has been verified.
3. The same persistent guide switches to Step 3 of 3 / Optional and offers Save to Notebook or Finish guide. After saving, it confirms that answer and sources are saved and offers Open Notebook. There is no repeated panel beneath sources. Notes remain optional; there is no extra required note step.
4. Completing/skipping exposes Start onboarding on the home. Reload restores the demo introduction and preserves all research, notebooks and notes. Saving is never gated by opening sources. One notebook saves directly; zero/multiple notebooks use the existing destination dialog.

Research content remains prepared examples; CSV statistics are real local calculations. No live AI or client integrations are implied.

During demo preparation, the shadcn progress bar fills continuously over time. Named stages change separately; cancellation clears the timer and the next task starts from zero. Reduced-motion preferences suppress the visual transition.



## Contextual onboarding revision — 2026-10-06
The sticky guide Card described above is replaced by the shared ResearchGuide coachmark on registry-installed shadcn Popover. All stages share identical white appearance, padding, 12px step metadata and 16px title/body, with a Radix arrow pointing at their real action: question composer → Sources used → Save to Notebook. The actual controls perform the work; the hint has no duplicate Next/Review/Save button. Literature step 2 remains active until an original paper link is opened; local CSV advances after file calculation details are opened. Opening a link is not evidence verification. Saving is optional and available without the source step. After saving, the same coachmark confirms success next to Open in Notebook. Explicit dismissal/Escape ends guidance, while outside interaction leaves it available. It does not trap or steal focus. Collisions avoid the 64px app header and fit 320px screens; examples stay in the composer. Demo reload resets guidance and preserves work.

References: Canva https://mobbin.com/flows/d3237fe5-9e7c-47ec-89e6-56ccfd951dc1; Miro https://mobbin.com/flows/8b9e6af8-0a9c-422f-9285-73e5c96183fb; NotebookLM/Gemini Notebook https://mobbin.com/flows/24e7f24a-146f-43da-a6cc-ee77e5232f09. Layout/counter/anchoring are observed reference patterns. Progression after real actions is our proposed adaptation for this prototype.
