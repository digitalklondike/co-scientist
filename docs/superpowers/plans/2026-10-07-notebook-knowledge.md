# Notebook knowledge workflow Implementation Plan

> Execution: inline, following executing-plans and verification-before-completion. User approved the previously presented feature scope and waived further confirmations.

**Goal:** Apply the approved Notion/Wikipedia workflow improvements to the existing local Notebook.
**Architecture:** Preserve Markdown and existing transactional mutations. Add scoped knowledge helpers and components; extend Notebook rendering only. No dependency install or remote mutation.
**Tech Stack:** React, existing Radix/shadcn, Motion, localStorage, node:test.
**Spec:** Approved design in preceding conversation: navigation, citations, version comparisons, templates, contextual steps, relations and UI simplification.

## Constraints
- Chat, its left sidebar and NotebookConversation remain unchanged.
- Latest minimal hints, 48px desktop overview, 12px research card gap and Contents-only research dragging remain.
- Roles apply to mutations. Local storage and portable snapshots remain honest local functionality.
- Preserve source research, comments and existing user data. No GitHub pushes.

## Tasks
- [x] Add tested pure helpers for heading anchors, local links, templates and version differences; extend task/link mutations with validation and source snapshots.
- [x] Add sticky Contents navigation, current section marker, block folding, deep links and scoped reading-position restoration.
- [x] Add explicit citation insertion/preview and text/source version comparison accessible from block actions.
- [x] Add Notebook templates, related Notebook picker/backlinks and contextual next steps from blocks/comments.
- [x] Simplify empty comments, opt-in chart and labels; retain recovery navigation guards.
- [x] Run meaningful state tests, production build and browser QA on temporary notebooks; verify persistence and mobile layout, preserve preview.

## Review focus
Malformed or deleted deep-link targets, duplicate section headings, missing historic source metadata, read-only actions and removed context targets must fail gracefully. Citation insertion never infers support for a statement. Restore retains current sources/comments; show that explicitly.

## Verification
34 state/worker tests pass; Vite production build and Sites packaging pass. Browser QA used a temporary Literature review notebook: inserted/previewed citation; compared/restored and reversed text restoration with sources retained; created context tasks from block and resolved comment; unfolded and revealed the resolved comment; linked notebooks and verified incoming backlink; copied/opened local block URL across reload; navigated to inner sections from folded research. Mobile 390px has no document overflow. Temporary notebook removed with recoverable UI deletion; original notebooks preserved.
Fresh read-only review identified historical-source import validation, missing context links and reveal-event timing; all corrected. Browser caught unstable heading indices and duplicate sibling keys; corrected using parsed line positions and unique navigation keys. Navigation reveals analysis without height animation to preserve anchor accuracy (188px measured top). Screenshots: verification/notebook-version-comparison.png and notebook-knowledge-navigation.png.
