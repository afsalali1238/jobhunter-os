---
name: tailor-cv
description: Rewrite the user's CV to highlight the specific experiences and keywords relevant to a target job description, and produce it as a genuinely ATS-safe PDF (not just a nicely formatted document — one that actually parses cleanly in applicant tracking systems).
---
# Tailor CV

## Trigger
When the user asks you to "tailor my CV for [Company/Role]", "write a CV for this job", or provides a Job Description (JD) to use for a CV.

## Inputs
1. A job description provided by the user (or the name of a scouted job).
2. The user's experience and skills strictly from `profile/experience-bank.md`.

## Steps
1. Read `profile/experience-bank.md` to get the baseline experience — this should be built
   from the user's real CV/LinkedIn material (see the `onboarding` skill). If it still looks
   like the blank template or is clearly thin, stop and tell the user their profile needs to
   be filled in properly first — don't tailor from an empty or near-empty base.
2. Get the real JD — open the actual link, or use the text the user pasted/the job noted in
   `leads/data.js`. Analyze it to find key terminology, required skills, and core responsibilities.
3. Rewrite the headline, summary, and bullet points to emphasize experience that overlaps with the JD.
   - **CRITICAL RULE**: Do NOT fabricate experience, dates, tools, or metrics. If they don't have it, don't write it. Only reframe what is already there.
   - If the JD needs something genuinely missing from the profile, leave it out and mention
     the gap to the user rather than quietly filling it in.
   - **Mirror the JD's exact terminology** (e.g. if the JD says "Client Success" and the
     profile says "Customer Success", use "Client Success") — this isn't just style, it's how
     ATS keyword matching actually works. Pull the 8-12 highest-signal keywords/phrases from
     the JD (tools, certifications, methodologies, job-title language) and confirm each one
     you used is genuinely backed by the profile before including it.
4. Save the working copy as clean Markdown to `output/cvs/[Company]_[Role]_CV.md` — this is
   your editable draft and what you show the user first for feedback.
5. Once the user is happy with the content, produce the **submission-ready PDF** — this is
   the file they should actually upload to applications, and it needs to be genuinely ATS-safe,
   not just nicely formatted.
   - **Copy the template, don't hand-roll a layout.** Copy `templates/CV_Template.html` to
     `output/cvs/[Company]_[Role]_CV.html`, then replace every `{{PLACEHOLDER}}` with the
     content you wrote in step 3/4 — nothing new, nothing invented. Duplicate the
     `<section class="job">` block once per role (reverse-chronological, most recent first)
     and delete unused ones. The template already enforces every ATS rule below (single
     column, standard fonts, exact section headings, no tables/graphics) — don't restructure it.
     The template's "Projects" section is optional — only keep it if `experience-bank.md`'s
     "Wins & Proof" has something real that doesn't already fit under a role above (a side
     project, an award); delete the section otherwise rather than padding the CV.
   - Convert to PDF:
     ```
     python3 scripts/convert_html_cvs.py output/cvs/[Company]_[Role]_CV.html
     ```
     This uses headless Chrome to print the file and reports the resulting page count.
     Requires Chrome/Chromium installed locally (most machines already have it). If it can't
     find Chrome, tell the user plainly and offer the HTML file for them to open and
     "Print > Save as PDF" manually instead of silently failing.
   - **PDF layout verification**: Read the page-count line the script prints.
     - **1-2 pages** → good, proceed to step 6.
     - **3+ pages** → do NOT hand this to the user yet. Go to the **relevance-weighted
       trimming** step below, cut content, and re-run the conversion. Repeat until it's
       1-2 pages.
6. **If it overflows 2 pages — relevance-weighted trimming.** Don't just delete the oldest
   role or the last bullet. Score every bullet across the whole CV on:
   - **Relevance** — does it use JD keywords / match a JD requirement?
   - **Uniqueness** — does it show something no other bullet already covers?
   - **Recency** — more recent roles get a small preference over older ones, all else equal.
   Cut the lowest-scoring bullet first, re-check the page count, and repeat one bullet at a
   time rather than deleting a whole section in one pass — you want the smallest cut that
   gets back to 2 pages, not the fastest one.
7. Present the file(s) to the user, confirm the `.pdf` is what they should actually upload to
   job applications, and ask if they'd like any revisions. If you had to skip anything the JD
   asked for, or trim anything to fit 2 pages, say so explicitly here.
8. **Update the dashboard**: Open `leads/data.js` and find the job you just tailored the CV for. Update its `"cvPath"` property to point to the newly generated PDF (e.g., `"cvPath": "output/cvs/[Company]_[Role]_CV.pdf"`). This enables the "View CV" button on the dashboard.

## ATS-safe formatting rules (what `templates/CV_Template.html` enforces)
A CV that *looks* professional but confuses an ATS parser is worse than a plain one — the
recruiter never sees it. These are already built into the template; if you ever build the
HTML a different way, apply every rule below yourself:

- **Single column, linear layout.** No multi-column sections, no side-bar for skills/contact,
  no tables used for layout (a real table for e.g. a skills matrix will scramble reading
  order in many parsers — use a plain bullet or comma-separated list instead).
- **No text boxes, no headers/footers for content.** Contact info (name, phone, email,
  location, LinkedIn URL) goes as plain text at the top of the document body — many ATS
  parsers skip header/footer regions entirely, silently dropping contact details.
- **No graphics, icons, photos, logos, or decorative lines/borders.** They add nothing an ATS
  can read and can break parsing.
- **Standard, exact section headings** — use these words, not creative variants: `Summary`,
  `Experience`, `Skills`, `Education`, `Certifications`. ATS systems pattern-match on common
  headings; "My Journey" or "What I Bring" won't be recognized.
- **Standard fonts only** — Arial, Helvetica, or Times New Roman. Body text 10.5-11pt, name
  14-16pt. No script/decorative fonts, no Google Fonts import (some ATS text-extraction tools
  choke on embedded web fonts when printing to PDF).
- **Consistent bullet character** (a plain `-` rendered as `<li>`) throughout, never mixed.
- **Consistent date format** — `Mon YYYY – Mon YYYY` (e.g. `Jan 2021 – Mar 2024`) for every
  role, not a mix of formats.
- **Reverse-chronological order**, most recent role first.
- **1-2 pages.** Cut content (see relevance-weighted trimming above) before compressing the
  font size below 10.5pt or margins below ~15mm.
- **Plain filename**, no spaces or special characters beyond underscores (already the
  `[Company]_[Role]_CV.pdf` convention above).
- Before presenting, do a final self-check: could every line be read correctly if the whole
  document were flattened to plain text top-to-bottom? If a table, column, or text box would
  make that ambiguous, restructure it.

## Optional: print-ready extras
If the user wants a browser-preview copy too, the same `output/cvs/[Company]_[Role]_CV.html`
file already serves that purpose — no separate file needed.
