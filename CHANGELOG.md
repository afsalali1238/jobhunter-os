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

## v1.3 — 2026-07-05 (CV pipeline consolidation + PII cleanup)

Reviewed against three popular reference job-search repos; borrowed the ideas that fit a
files-only, no-backend system and skipped the ones that didn't (a local server/DB, a Go TUI,
a full vector-DB stack). Also found and removed real personal data that had been committed to
this public template repo.

- **One canonical CV pipeline, not two.** Removed `scripts/build_ats_docx.py` and the
  python-docx path entirely. `tailor-cv` now always uses `templates/CV_Template.html` +
  `scripts/convert_html_cvs.py` (headless Chrome print-to-PDF). Fewer moving parts, easier to
  reason about, matches the "limit features" direction.
- **`convert_html_cvs.py` rewritten from scratch** — it was hardcoded to scan its own script
  directory for files named `"CV — Afsal Ali ("`, which only worked for one person on one
  machine. Now accepts explicit file paths or `--dir`, defaults to `output/cvs/`, and detects
  Chrome/Chromium across Windows, macOS, and Linux instead of three Windows-only paths.
- **Added PDF layout verification.** The converter now reports the generated PDF's page count
  (via `pypdf`, with a graceful skip if it isn't installed) and flags anything over 2 pages
  instead of silently handing over an overflowing CV.
- **Added relevance-weighted trimming** to `tailor-cv`: when a CV overflows 2 pages, cut the
  lowest-relevance/least-unique bullet first (scored on JD-keyword relevance, uniqueness vs.
  other bullets, and recency) instead of just deleting the oldest role wholesale.
- **Removed the dead Export/Import code** from `dashboard/app.js` and `dashboard/index.html`
  — it had been superseded by the `leads/data.js` auto-load architecture and was only kept
  around (guarded) to stop a crash. Replaced with a single "Download a backup" button on
  `dashboard/how-to-use.html` that snapshots `window.JOBHUNTER_DATA` to a dated JSON file.
- **Removed real personal data from the repo.** `templates/CV_Template_Operations.html` and
  `templates/CV_Template_Category.html` had been created with real name, contact details, real
  employers, and sensitive personal details (nationality, DOB, visa status) instead of
  placeholders — deleted (they were untracked, so no git history exposure) and replaced with
  a single generic `templates/CV_Template.html` using `{{PLACEHOLDER}}` markers throughout.
- **Fixed stale `leads/scraped_leads.json` references** left over from the `leads/data.js`
  migration in `AGENTS.md`, `skills/source-jobs/SKILL.md`, and several `.claude/skills/` and
  `.cursor/rules/` mirrors that had drifted out of sync with the canonical `skills/` versions
  — resynced all mirrors from `skills/` as the source of truth.
- **Known issue, not fixed by this pass:** an earlier commit (since removed from this branch's
  history) contained a real name and real job-lead data with personal notes. That commit is no
  longer reachable from `main`, but GitHub can still serve orphaned commits directly by SHA for
  a period after a rewrite/reset. If this repo is public, treat that commit as still exposed
  until the repository is made private, recreated fresh, or GitHub support purges cached views.

## v1.4 — 2026-07-05 (genuine Antigravity native support)

Checked Antigravity's official docs (antigravity.google/docs/skills, /docs/rules-workflows)
rather than assuming — the repo's previous "Antigravity reads AGENTS.md and skills/ directly"
claim was an assumption, not something Antigravity's docs confirm. Antigravity actually has its
own native skill-discovery and rules system, and this repo wasn't using either.

- **Added real `.agents/skills/<name>/SKILL.md` for all 5 skills.** Antigravity's skills use
  the exact same open standard as Claude Code (YAML frontmatter: `name` optional, `description`
  required) — so these are byte-for-byte copies of `.claude/skills/`, no adaptation needed.
  Without this, Antigravity had no way to see the 5 skills as a discoverable list; it would
  only find them if a user manually said "read AGENTS.md and follow skills/" every session.
- **Added `.agents/rules/jobhunter.md`** — Antigravity's native workspace-rules location,
  carrying the same real-data-only rules and fit-score bands as `AGENTS.md`. Needs a one-time
  manual step (Customizations panel → Rules → set to Always On) since rule activation is a
  UI setting, not something a file alone can configure.
- **Removed `.agents/skills.json`** — a hand-rolled pointer file (`{"entries": [{"path":
  "../skills"}]}`) that was never a real Antigravity convention; Antigravity's docs don't
  recognize it. Superseded by the real `.agents/skills/` folder above.
- **`scripts/self_check.py` now also checks `.agents/skills/` for drift** against `skills/`,
  alongside the existing `.claude/skills/` and `.cursor/rules/` checks.
- **Corrected README/START-HERE's Antigravity claims** to describe the real mechanism instead
  of the assumed one.

## v1.5 — 2026-07-05 (two real bugs, caught by user review)

- **Fixed: Kanban card lost its Apply button on a "Manual Apply Required" state.**
  `renderTable()` correctly showed a Retry button in that state; `renderKanban()`'s card only
  checked `!job.applyStatus`, so once a job needed manual apply, the button vanished from the
  board entirely — the only way to retry was switching to Table view. Kanban now mirrors the
  same three states (none / Applied* / Manual*), showing a Retry button and a small status
  note on the card when manual apply is needed.
- **Fixed: `templates/CV_Template.html` used `display:flex; justify-content:space-between`**
  for the job title/dates and company/location lines. That renders beautifully on screen and
  in a browser-perfect PDF, but some older visual-based ATS parsers (older Greenhouse/Taleo)
  can smash or misorder text separated by a large flex-driven gap when extracting from the
  PDF's content stream. Replaced with a single inline line per row (`{{JOB_TITLE}} —
  {{DATES}}`), which reads correctly regardless of how a parser walks the page. Applied to the
  Experience rows and the Projects section, which used the same pattern.

## v1.6 — 2026-07-05 (real-world job-board blocking, closed the loop)

Prompted by an actual run: searching Pharmacist roles in Dubai hit LinkedIn/Bayt/Indeed
blocking automated readers on the individual job pages. The agent correctly refused to guess
a score — that part worked as designed — but it jumped straight to "paste it here" instead of
trying the browser it likely already had access to.

- **`source-jobs` step 5 now escalates to real browser navigation before giving up.** Order is
  now: fast read → if blocked/thin/a JS shell, navigate there with real browser tooling (Chrome
  extension / browser MCP / IDE browser) one posting at a time and read the rendered page →
  only if *both* fail (no browser tool this session, a login wall, a real CAPTCHA) mark
  `score: null` and ask the user to paste the JD or drop a PDF. Manual paste is now explicitly
  the last resort, not the first response to a block.
- Synced this change across `.claude/skills/`, `.cursor/rules/`, and `.agents/skills/`.
