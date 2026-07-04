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

## Steps
1. Read `profile/experience-bank.md` to understand the user's actual background.
2. Analyze the provided JD to extract the core requirements (skills, years of experience, responsibilities).
3. Compare the user's experience strictly against the core requirements. Do not assume the user has experience if it is not explicitly listed in their experience bank.
4. Generate a "Fit Score" from 0 to 100 based on the overlap.
5. Provide a summary of the analysis to the user in a clear format:
   - **Fit Score**: [0-100]
   - **Strengths**: Where the user perfectly aligns with the JD.
   - **Gaps**: Requirements the user lacks or doesn't explicitly mention in their profile.
   - **Recommendation**: Whether they should apply, and what parts of their experience to highlight if they do.
