---
name: generate-outreach
description: Write a cover letter and a 2-part LinkedIn DM sequence tailored to a specific job and hiring manager.
---
# Generate Outreach

## Trigger
When the user asks you to "write the outreach for [Company]", "draft a cover letter", or "write DMs for this role".

## Inputs
1. A job description or target company.
2. The user's experience from `profile/experience-bank.md`.
3. The user's preferred tone from `profile/preferences.md`.

## Steps
1. Read the user's experience and their preferred outreach tone.
2. Analyze the job to determine the most relevant angle for outreach.
3. Write a concise, impactful Cover Letter (under 250 words) that highlights 1-2 major relevant wins.
4. Write a 2-part LinkedIn DM sequence for the Hiring Manager:
   - **Message 1**: Connection request (under 300 characters). Mention the role and a quick hook.
   - **Message 2**: Follow-up message (if they accept). Deeper value prop and a soft Call to Action (CTA).
5. Output these clearly to the user.
6. Save the output to the `output/outreach/` directory as `[Company]_outreach.md`.
