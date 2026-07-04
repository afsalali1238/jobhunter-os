---
name: source-jobs
description: Use real web search / browser tools to find ACTUAL live job postings — with real, working links — matching the user's target-roles, and save them to leads/scraped_leads.json. Never fabricates listings.
---
# Source Jobs

## Trigger
When the user asks you to "find me jobs", "source jobs", or something similar.

## The one non-negotiable rule
**Every job in the output must be a real, currently-live posting you actually found this
session, with the real URL of that posting (or, where a portal genuinely has no direct
per-job link, the real URL of the filtered search results you used to find it).** Do not
invent a company, title, score, or link — not even a "plausible-looking" placeholder, and
not even as a demo. If you cannot find real postings right now, say so to the user plainly
and explain why (no web tool available, sites blocked, region unclear) instead of producing
anything. This matters more than looking productive.

## Inputs
Read `profile/target-roles.md` for the **region**, the agreed **job boards**, titles,
seniority, and deal-breakers. If the region or board list is missing, stop and ask the user
before searching — don't guess a country or default to generic US sites for someone job
hunting elsewhere.

## Steps

### 1. Try broad search first
If you have a web search tool, use it to query each agreed job board plus LinkedIn and
Google Jobs for the target titles + region (e.g. `site:linkedin.com/jobs "Category Manager"
Dubai`, or the board's own search syntax). This is the fastest way to surface real, indexed
postings with real URLs.

### 2. Fall back to the browser when search isn't enough
Bulk/API-style search won't always work — some boards block indexing, require JS to render
results, or need you to actually apply filters. When that happens, use whatever real browser
tool you have access to in this environment (e.g. a Chrome extension / browser MCP, or your
IDE's built-in browser tooling) to:
1. Navigate to the actual job board (LinkedIn Jobs, or the regional site agreed in
   `target-roles.md`).
2. Enter the real search — the target title + region — using the site's own search box and
   filters, the same way a person would.
3. Read the actual results on the page (scroll if needed) and extract the real company,
   title, and the real link for each posting.
If you don't have web search *or* browser access at all in this session, tell the user
directly: *"I don't have web or browser access right now, so I can't pull real listings —
you'll need to enable a browsing tool in your IDE, or paste job links you've already found
and I'll score/tailor for those instead."*

### 3. Filter for real fit
Evaluate each real posting against the user's deal-breakers in `target-roles.md`. Drop
anything that fails a hard deal-breaker.

### 4. Cap the batch before you start opening JDs
Check `target-roles.md`'s "how many jobs to find per search" (default to 15 if it's blank,
and tell the user you're defaulting). This cap exists because step 5 requires actually
reading each JD, which doesn't scale to unlimited postings in one turn. If your search
surfaced more real candidates than the cap:
1. Rank them by **title/company relevance only** (does the title match a target role? is the
   company in a target industry?) — this ranking is for **sort order, never a final score**.
2. Take the top N (N = the cap) into the real-JD-reading step below.
3. Tell the user honestly: *"Your search on [boards] turned up ~40 postings — I've opened
   and scored the top 15 by title match. Want me to go through more?"* Never quietly drop
   the rest without saying so.

### 5. Score for real — open the actual JD
For each posting that made the cut, open the actual job description (the real page/link) and
run the same evaluation as the **score-fit** skill against `profile/experience-bank.md`.
**Do not score from the title or a search snippet alone** — that's a guess wearing a number,
and the user relies on this score to decide where to spend their time. If you genuinely run
out of turn budget partway through, save the remainder with `"score": null` rather than
inventing a number, and tell the user exactly which ones still need a real read.

### 6. Build the output
Collect `company`, `title`, the real `url`, and the real `score` (or `null`) for each posting
into the JSON payload below, and save it to `leads/scraped_leads.json`.

**If the user has told you they prefer the Excel companion** (`excel/JobHunter_Pipeline.xlsx`)
over the HTML dashboard, also append each new lead as a new row at the bottom of the
`PipelineTable` on the **Pipeline** sheet, in the same column order (Company, Role, Fit
Score, Band, Status, Applied Date, Job URL) — leave the Band column's formula intact (copy
it down from the row above, don't hardcode the band text) so it keeps calculating. Do this
in addition to `leads/scraped_leads.json`, not instead of it, unless the user says they only
want Excel.

### 7. Hand off honestly
Tell the user how many real postings you found and from where (e.g. "12 real postings from
LinkedIn and Bayt — opened and scored 9 of them, 3 still need a manual look"). Ask them to
use the "Import" button on `dashboard/index.html` (or check the Excel file, if that's what
they're using). Surface the top 2-3 scored HOT so they know where to start, and flag anything
you're unsure about (ambiguous seniority, a posting that might be a duplicate of one already
in their tracker, a site you couldn't fully access) rather than silently deciding for them.

## Output Format (`leads/scraped_leads.json`)
You must output a JSON file containing the jobs in this exact structure:

```json
{
  "profile": null,
  "jobs": [
    {
      "id": "1710000000000",
      "company": "Example Corp",
      "title": "Software Engineer",
      "url": "https://linkedin.com/jobs/view/12345",
      "score": 82,
      "status": "Scouted",
      "applyStatus": null,
      "addedDate": "MM/DD/YYYY"
    }
  ]
}
```
*(This is a schema example, not sample data to copy — "Example Corp" and that URL are placeholders showing the shape. Every real job you write here must be one you actually found this session. Ensure `id` is unique for each job, like a numeric timestamp string. `score` is 0-100 — the dashboard bands it automatically: ≥80 HOT, 70-79 Strong, 60-69 Consider, <60 Low. Set `null` only if you genuinely haven't opened the JD yet.)*
