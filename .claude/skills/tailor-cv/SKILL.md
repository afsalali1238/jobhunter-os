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
     certifications — 