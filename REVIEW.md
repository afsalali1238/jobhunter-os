# JobHunter OS — Expert Review

Reviewed: 2026-07-04. Scope: full repo as it stands (skills, dashboard, Excel companion,
docs, IDE adapters). Ratings are /10. P0 = fix before calling this trustworthy, P1 =
matters for quality, P2 = polish.

---

## Overall: **7/10**

The core promise — real jobs, real scores, real CVs, never fabricated — is now genuinely
built into the instructions at every layer (AGENTS.md, all 5 skills). That's the hardest
part to get right and it's done well. What holds this back from 8+: two concrete "promise
gaps" where docs claim something the skills don't actually do, an orphaned script that
contradicts the whole pitch, and — most importantly — none of this has ever been run
end-to-end in a real IDE. It's well-reasoned instructions, unverified in practice.

| # | Aspect | Rating | Verdict |
|---|--------|:------:|---------|
| 1 | Anti-fabrication rules (skills + AGENTS.md) | **8/10** | Real defense in depth — every skill independently enforces "real JD, real link, ask if unsure" |
| 2 | Onboarding flow design | **8/10** | Right order (real material → gaps → region → roles); no fallback for failed CV parsing (scanned PDFs etc.) |
| 3 | Sourcing architecture (search → browser fallback) | **7/10** | Sound design, but region→job-board list is static knowledge, not verified live, and "open every JD before scoring" has no guidance for large result sets |
| 4 | Dashboard (HTML) | **8/10** | Clean, scoring + Apply now wired in, zero fabricated seed data. No URL sanitization on imported links; data only lives in localStorage with no backup nudge |
| 5 | Excel companion | **6/10** | Well-built (formulas not hardcoded, zero errors), but **no skill actually writes to it** — the README's "ask your agent to write here instead" is currently a promise the skills can't keep |
| 6 | Code hygiene | **5/10** | `scripts/generate_outreach.py` + `requirements.txt` are orphaned — a Gemini-API CLI script that nothing references, contradicting the "no dependencies, your AI IDE is the engine" pitch |
| 7 | Multi-IDE support | **5/10** | `.claude/`, `.cursor/`, `.agents/` are thin pointer files hoping the model reads `AGENTS.md` as convention — not a verified/native skill-discovery mechanism in any of the three IDEs |
| 8 | Visual polish / branding | **9/10** | Banner, demo GIF, Mermaid diagram, dashboard mockup are genuinely strong for a lead magnet |
| 9 | Documentation clarity | **8/10** | README/START-HERE read well and set honest expectations; a couple of claims (Excel write-in) outrun what's actually wired |
| 10 | End-to-end verification | **3/10** | Nothing has been run in Cursor/Claude/Antigravity to confirm onboarding → sourcing → tailoring → dashboard actually works as written. Everything checked so far is structural (JS syntax, xlsx formulas), not behavioral |

---

## What's genuinely good

- **The non-fabrication rule is load-bearing, not decorative.** It's stated once at the top
  (AGENTS.md) and then re-stated in the specific place each skill could cut a corner
  (source-jobs, score-fit, tailor-cv). That redundancy is the right call for something this
  easy to fake.
- **The onboarding sequencing is well thought out** — asking for real source material before
  asking questions, and asking region before roles, mirrors how a competent recruiter would
  actually onboard someone. Most people miss the region-first insight.
- **The score-band system is coherent everywhere it appears** — same cutoffs (≥80 HOT /
  70-79 Strong / 60-69 Consider / <60 Low), same colors, in the dashboard, the Excel file,
  and the skill docs.
- **The Excel file itself is properly built** — real formulas (`COUNTIFS`, not hardcoded
  numbers), verified zero formula errors, charts that update as rows are added.
- **Visual identity is well above what a template repo usually gets** — the hand-drawn
  banner and demo GIF do real work making this look finished rather than scaffolded.

## What's bad — fix these

**P0 — undermines the core promise or leaves a gap the user will hit immediately**

1. **Excel isn't actually wired in.** `source-jobs/SKILL.md` only writes
   `leads/scraped_leads.json`. Either add an explicit step letting the agent write new leads
   into `excel/JobHunter_Pipeline.xlsx`'s Pipeline table when the user prefers Excel, or
   soften the README line so it stops promising something that doesn't exist yet.
2. **`scripts/generate_outreach.py` + `requirements.txt` are dead weight that contradicts the
   pitch.** The whole positioning is "no dependencies, your AI IDE is the engine" — then
   there's a Python script needing `google-genai` and a `GEMINI_API_KEY` that no skill or doc
   ever tells the user to run. Either delete it or clearly badge it as an optional,
   unsupported power-user path, separate from the main flow.
3. **No guidance for bulk scoring cost.** The rule "never score from a title alone, always
   open the real JD" is correct, but if a search returns 40 postings, nothing tells the agent
   how to handle that (score the top N by title-fit heuristically as a *sort order only*,
   then fully open just those before finalizing? Cap results per search? Tell the user
   up front it'll take a while?). Right now the agent has no instructions for that trade-off
   and might either stall or quietly under-deliver.
4. **Zero live verification.** Nobody has actually opened this in Cursor/Claude/Antigravity
   and typed "let's get started." Everything checked so far is static (syntax, formulas).
   Before calling this ready, run the actual onboarding → source → score → tailor loop once
   for real and fix what breaks.

**P1 — quality gaps**

5. **IDE skill-discovery is unverified.** `.claude/CLAUDE.md`, `.cursor/rules/jobhunter.mdc`,
   and `.agents/skills.json` all just point at `AGENTS.md`/`skills/` and hope the model reads
   them as a convention. That's not the same as Claude Code's native
   `.claude/skills/<name>/SKILL.md` auto-discovery. Worth testing in each IDE specifically —
   this repo's core value prop depends on it actually working.
6. **Static, unverifiable regional job-board list.** The onboarding skill's board
   recommendations (Bayt, GulfTalent, Naukri, SEEK, Reed...) come from training knowledge,
   not a live check — sites rebrand or shut down. Fine as a starting suggestion, but the skill
   should tell the agent to confirm the sites still exist/work rather than assume.
7. **No URL sanitization mentioned** before the dashboard renders `<a href="${job.url}">` —
   low risk since data is user-generated and local, but a stray `javascript:` URL from a bad
   scrape would execute. Worth a one-line skill note: only accept `http(s)://` URLs.

**P2 — polish**

8. Score-band cutoffs are hardcoded independently in `dashboard/app.js`, the Excel formulas,
   and each skill doc — no single source of truth. Fine today since they're consistent, but
   a future edit to one place and not the others would silently desync them.
9. No CHANGELOG despite the banner's "V1" badge.
10. Excel ships pre-filled with 10 sample rows; the HTML dashboard ships empty. Both are
    labeled, but the asymmetry could read as inconsistent to a new user comparing the two.

---

## Suggested order of work

1. P0-4 (run it for real, once, in at least one IDE) — this is the only way to know if
   everything above is actually true or if new problems are hiding underneath.
2. P0-2 (cut the orphaned script) — fastest fix, removes a real contradiction.
3. P0-1 (wire Excel in or soften the claim) — pick one, both are quick.
4. P0-3 (add bulk-scoring guidance to source-jobs) — prevents a bad first impression on
   anyone whose search returns more than a handful of results.
5. P1-5 (verify IDE skill discovery) — do this alongside step 1.
6. P1-6, P1-7, then P2s as time allows.

After P0s, this is an honest 8+/10 — a template that says what it does and does what it says.
