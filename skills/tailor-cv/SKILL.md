---
name: tailor-cv
description: Rewrite the user's CV to highlight the specific experiences and keywords relevant to a target job description, and produce it as a genuinely ATS-safe .docx (not just a nicely formatted document — one that actually parses cleanly in applicant tracking systems).
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
   `leads/scraped_leads.json`. Analyze it to find key terminology, required skills, and core responsibilities.
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
5. Once the user is happy with the content, produce the **submission-ready `.docx`** — this is
   the file they should actually upload to applications, and it needs to be genuinely ATS-safe,
   not just nicely formatted.
   - **Use the bundled script, don't hand-roll python-docx layout code.** Write a small JSON
     file matching the schema documented at the top of `scripts/build_ats_docx.py` (name,
     contact line, headline, summary, experience with bullets, skills, education,
     certifications — all pulled only from what you already wrote in step 3/4, nothing new),
     then run:
     ```
     python3 scripts/build_ats_docx.py --input <tmp_cv_data.json> --output output/cvs/[Company]_[Role]_CV.docx --pdf
     ```
     The script always emits single-column layout, standard fonts/headings, and no
     tables/graphics/headers-footers — the ATS rules below are enforced by the script itself,
     not left to chance. Requires `pip install python-docx --break-system-packages` if not
     already available in this environment; if you have a dedicated `docx` skill/tool in your
     IDE instead, you can use that as an alternative — the ATS rules still apply.
   - If neither python-docx nor a docx tool is available, tell the user plainly and fall back
     to offering the Markdown file plus a print-ready HTML version (see step 7) rather than
     silently skipping the docx.
6. Present the file(s) to the user, confirm the `.pdf` and `.docx` are what they should actually upload to
   job applications, and ask if they'd like any revisions. If you had to skip anything the JD
   asked for, say so explicitly here.
7. **Update the dashboard**: Open `leads/data.js` and find the job you just tailored the CV for. Update its `"cvPath"` property to point to the newly generated PDF (e.g., `"cvPath": "output/cvs/[Company]_[Role]_CV.pdf"`). This enables the "View CV" button on the dashboard.
8. Optionally, also offer a clean, print-ready HTML version (inline CSS, no external
   dependencies) saved as `output/cvs/[Company]_[Role]_CV.html` for browser preview or
   printing to PDF — a nice-to-have alongside the `.docx`, not a replacement for it, since a
   browser "print to PDF" is not guaranteed to parse as cleanly in an ATS as a real `.docx`.
## ATS-safe formatting rules (what `scripts/build_ats_docx.py` enforces)
A CV that *looks* professional but confuses an ATS parser is worse than a plain one — the
recruiter never sees it. These are already built into the script; if you ever generate the
`.docx` a different way (a docx skill/tool, or by hand), apply every rule below yourself:

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
- **Standard fonts only** — Calibri, Arial, or Times New Roman. Body text 10.5-11pt, name
  14-16pt. No script/decorative fonts.
- **Consistent bullet character** (a plain `-`) throughout, never mixed.
- **Consistent date format** — `Mon YYYY – Mon YYYY` (e.g. `Jan 2021 – Mar 2024`) for every
  role, not a mix of formats.
- **Reverse-chronological order**, most recent role first.
- **1-2 pages.** Cut content before compressing the font size below 10.5pt or margins below
  ~0.7".
- **Plain filename**, no spaces or special characters beyond underscores (already the
  `[Company]_[Role]_CV.docx` convention above).
- Before presenting, do a final self-check: could every line be read correctly if the whole
  document were flattened to plain text top-to-bottom? If a table, column, or text box would
  make that ambiguous, restructure it.
