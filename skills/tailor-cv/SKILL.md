---
name: tailor-cv
description: Rewrite the user's CV to highlight the specific experiences and keywords relevant to a target job description.
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
3. Rewrite the user's headline, summary, and bullet points to emphasize their experience that overlaps with the JD. 
   - **CRITICAL RULE**: Do NOT fabricate experience, dates, tools, or metrics. If they don't have it, don't write it. Only reframe what is already there.
   - If the JD needs something genuinely missing from the profile, leave it out and mention
     the gap to the user rather than quietly filling it in.
   - Use the language of the JD (e.g., if JD says "Client Success" and the profile says "Customer Success", use "Client Success").
4. Output the tailored CV in a clean Markdown format.
5. Save the tailored CV to the `output/cvs/` directory as `[Company]_[Role]_CV.md`.
6. Present the tailored CV to the user and ask if they'd like any revisions. If you had to skip anything the JD asked for, say so explicitly here.
