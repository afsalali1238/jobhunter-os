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

## v1.2 — 2026-07-04 (self-critique fix pass)

A second, harder self-review surfaced issues the v1.1 pass missed — mostly things that
sounded right in the docs but didn't have real mechanics behind them yet:

- **Excel writing is now a real, tested script**, not a freehand instruction. `excel/add_lead.py`
  appends or upserts a lead (matched by normalized URL) into the Pipeline table, computes the
  Band text itself (there's no Band *formula* in this sheet — it's plain text colored by
  conditional formatting; earlier skill wording incorrectly implied otherwise), and expands the
  table range. Verified: append + upsert + zero formula errors on recalc.
- **`score-fit` now also updates the Excel row** when re-scoring an existing lead, using the
  same script — previously only `source-jobs` touched Excel, so a re-score never propagated
  there.
- **Bundled a deterministic ATS-docx builder**, `scripts/build_ats_docx.py`. `tailor-cv` had
  regressed to suggesting an HTML-print-to-PDF fallback and "paste into Word" instead of a real
  ATS-safe `.docx` — restored the `.docx` as the primary deliverable (enforced single-column,
  standard fonts/headings, no tables/graphics/headers), with the HTML version demoted to an
  optional extra. Verified: generates a valid `.docx` that LibreOffice opens and converts cleanly.
- **Fixed the dashboard's disconnected onboarding.** `dashboard/index.html`'s first-run modal
  asked for name/roles as its own separate "profile," unconnected to `profile/experience-bank.md`.
  Added an "Import your leads file instead" option on that screen, and `onboarding` now writes a
  real `profile` object into `leads/scraped_leads.json` so importing it completes setup
  automatically instead of asking the user to retype their name.
- **Fixed URL de-duplication** to ignore tracking query strings/fragments (`?utm_source=...`) so
  the same posting re-listed with a different tracker isn't treated as a new lead — in both the
  dashboard (`normalizeUrl()`) and `excel/add_lead.py` (`normalize_url()`).
- **Fixed the onboarding skip-logic gap** — returning users were checked against only
  `experience-bank.md` before jumping straight to the end, silently skipping the region/board
  and preferences stages if those were still blank. Now checks all three profile files.
- **Added real Cursor rule mirrors.** `.cursor/rules/*.mdc` previously just pointed at
  `AGENTS.md`; now each of the 5 skills has its own inlined rule file, matching what
  `.claude/skills/` already had for Claude Code/Cowork.
- **Corrected the README/START-HERE multi-IDE claim** — it previously said Cursor and
  Antigravity "work perfectly" alongside Claude, which overstated Antigravity's (unverified,
  pointer-file-only) support. Now states support tiers honestly.
