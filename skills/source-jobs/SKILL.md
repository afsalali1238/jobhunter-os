---
name: source-jobs
description: Use web tools to find roles matching the user's target-roles and save them to leads/scraped_leads.json.
---
# Source Jobs

## Trigger
When the user asks you to "find me jobs", "source jobs", or something similar.

## Inputs
Read `profile/target-roles.md` to understand the titles, locations, and deal-breakers the user is looking for.

## Steps
1. Use your web search or browsing tools to search LinkedIn, Indeed, or Google Jobs for the titles and locations in `target-roles.md`.
2. Evaluate the job description to ensure it doesn't contain any of the user's "deal-breakers".
3. Collect the following details for each valid job: `company`, `title`, `url`.
4. Create a JSON payload that matches the dashboard import format.
5. Save this JSON payload to `leads/scraped_leads.json`.
6. Inform the user you have found the jobs and ask them to use the "Import" button on their `dashboard/index.html` to add them to their pipeline.

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
      "status": "Scouted",
      "applyStatus": null,
      "addedDate": "MM/DD/YYYY"
    }
  ]
}
```
*(Ensure `id` is unique for each job, like a numeric timestamp string).*
