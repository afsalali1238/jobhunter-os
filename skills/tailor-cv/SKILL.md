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
1. Read `profile/experience-bank.md` to get the baseline experience.
2. Analyze the JD to find key terminology, required skills, and core responsibilities.
3. Rewrite the user's headline, summary, and bullet points to emphasize their experience that overlaps with the JD. 
   - **CRITICAL RULE**: Do NOT fabricate experience, dates, tools, or metrics. If they don't have it, don't write it. Only reframe what is already there.
   - Use the language of the JD (e.g., if JD says "Client Success" and the profile says "Customer Success", use "Client Success").
4. Output the tailored CV in a clean Markdown format.
5. Save the tailored CV to the `output/cvs/` directory as `[Company]_[Role]_CV.md`.
6. Present the tailored CV to the user and ask if they'd like any revisions.
