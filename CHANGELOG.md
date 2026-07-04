# Changelog

## v1.0 — 2026-07-04

Initial public release, extracted and generalized from a personal Career-OS module.

- Core skills: `onboarding`, `source-jobs`, `score-fit`, `tailor-cv`, `generate-outreach`.
- Offline HTML dashboard (`dashboard/`) with Kanban + table views, JSON import.
- Excel companion (`excel/JobHunter_Pipeline.xlsx`) with live formulas and charts.
- Multi-IDE support: `AGENTS.md` (canonical), `.claude/`, `.cursor/rules/`, `.agents/`.
- README with banner, demo GIF, Mermaid flowchart, dashboard preview.

## v1.1 — 2026-07-04 (fix pass, post expert review)

Addressed every P0/P1/P2 item from `REVIEW.md`:

- **Removed** the orphaned `scripts/generate_outreach.py` + `requirements.txt` — dead code
  that contradicted the "no dependencies, your AI IDE is the engine" pitch.
- **Wired Excel into sourcing.** `source-jobs` now writes new leads into
  `excel/JobHunter_Pipeline.xlsx`'s Pipeline table (in addition to
  `leads/scraped_leads.json`) when the user prefers Excel, instead of leaving that promise
  unfulfilled.
- **Added bulk-scoring guidance.** `source-jobs` now caps a batch (default 15, from
  `profile/target-roles.md`), ranks by title/company relevance for sort order only, and is
  explicit that only the capped set gets a real, opened-JD score — with honest disclosure of
  what wasn't covered.
- **Rewrote onboarding** to require real source material first (CV upload / LinkedIn
  paste/export / other docs) before falling back to an interview, ask region before roles
  since job boards are geography-specific, and flag CV/LinkedIn conflicts instead of picking
  one silently.
- **Made `tailor-cv` genuinely ATS-safe.** Explicit formatting rules (single column, no
  tables/text-boxes/graphics, standard section headings and fonts, consistent bullets/dates,
  keyword-mirroring from the JD) and dual output: an editable Markdown draft plus a real
  submission-ready `.docx`.
- **Hardened the dashboard** against imported lead data: `safeUrl()` restricts links to
  `http(s)://` only, `escapeHtml()` escapes all rendered job fields before they hit the DOM.
- **Emptied the Excel starter file** so it matches the HTML dashboard's honest empty-start
  state, instead of shipping 10 sample rows that could read as fabricated/demo data.
- **Added native Claude Code/Cowork skill discovery** — mirrored the 5 skills into
  `.claude/skills/<name>/SKILL.md` so they're auto-discovered, not just referenced from a
  thin `CLAUDE.md` pointer file.
- **Centralized the Fit Score band cutoffs** as a single source of truth in `AGENTS.md`,
  with `dashboard/app.js`, the Excel `Band` formulas, and the skill docs all pointing back
  to it.
