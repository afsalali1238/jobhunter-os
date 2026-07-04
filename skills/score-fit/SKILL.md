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
4. **Score using the rubric below** — don't just eyeball the overlap. Score each dimension
   separately, then sum for the total Fit Score (0-100).

### Scoring rubric (100 points total)
Score each dimension, then sum:
| Dimension | Max Points | How to evaluate |
|---|---|---|
| Core skills match | 30 | How many of the JD's required hard skills / tools does the user have? |
| Experience level & years | 20 | Does seniority and years of experience match what the JD asks? |
| Responsibilities overlap | 20 | Has the user done the same or very similar work as described in the JD? |
| Industry / domain fit | 15 | Has the user worked in the same or adjacent industry? |
| Education & certifications | 10 | Does the user meet the education and certification requirements? |
| Location & logistics | 5 | Is the user in the right location, willing to relocate, or is it remote-compatible? |

> **Note:** For partial matches, award partial points (e.g., if a user meets half the required years of experience, award 10/20 points). Show the per-dimension breakdown to the user alongside the total so they can see exactly where points were gained or lost. This makes the score actionable, not just a number.

5. Provide a summary of the analysis to the user in a clear format:
   - **Fit Score**: [0-100]
   - **Band**: ≥80 HOT · 70-79 Strong · 60-69 Consider · <60 Low (matches the dashboard's badge colors).
   - **Strengths**: Where the user perfectly aligns with the JD.
   - **Gaps**: Requirements the user lacks or doesn't explicitly mention in their profile.
   - **Recommendation**: Whether they should apply, and what parts of their experience to highlight if they do.
6. If this job already exists as a lead (check `leads/scraped_leads.json` or ask the user), update its `score` field to match and tell them to re-import so the dashboard badge reflects it. If it's new, offer to add it as a lead with this score.
7. **If the user works from the Excel companion** (`excel/JobHunter_Pipeline.xlsx`) instead of
   the HTML dashboard, also update that job's row there — run the same helper script the
   `source-jobs` skill uses, with the new score:
   ```
   python3 excel/add_lead.py --file excel/JobHunter_Pipeline.xlsx \
     --company "<company>" --role "<role>" --url "<the job's real URL>" --score <new score> --status "<current status>"
   ```
   Matching on URL means this updates the existing row in place rather than creating a
   duplicate. Skip this step if the user only tracks jobs in the HTML dashboard.
