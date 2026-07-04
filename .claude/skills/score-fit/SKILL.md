---
name: score-fit
description: Score a job description against the user's experience bank to determine their fit (0-100).
---
# Score Job Fit

## Trigger
When the user asks "How well do I fit the [Company] role?", "Score this job", or provides a Job Description (JD) to evaluate.

## Inputs
1. A job description provided by the user (either pasted or a link).
2. The user's experience and skills from `profile/experience-bank.md`.

## The real-JD rule
Never score from a job title, company name, or search-result snippet alone. If you're given
a link, actually open and read it before scoring. If the link is behind a login wall, blocked,
or you otherwise can't access the real content, tell the user that plainly and ask them to
paste the JD text instead — don't produce a number from a guess.

## Steps
1. Read `profile/experience-bank.md` to understand the user's actual background.
2. Get the real JD text — open the link and read the actual page, or use the text the user
   pasted. Analyze it to extract the core requirements (skills, years of experience, responsibilities).
3. Compare the user's experience strictly against the core requirements. Do not assume the user has experience if it is not explicitly listed in their experience bank.
4. Generate a "Fit Score" from 0 to 100 based on the overlap.
5. Provide a summary of the analysis to the user in a clear format:
   - **Fit Score**: [0-100]
   - **Band**: ≥80 HOT · 70-79 Strong · 60-69 Consider · <60 Low (matches the dashboard's badge colors).
   - **Strengths**: Where the user perfectly aligns with the JD.
   - **Gaps**: Requirements the user lacks or doesn't explicitly mention in their profile.
   - **Recommendation**: Whether they should apply, and what parts of their experience to highlight if they do.
6. If this job already exists as a lead (check `leads/scraped_leads.json` or ask the user), update its `score` field to match and tell them to re-import so the dashboard badge reflects it. If it's new, offer to add it as a lead with this score.
