# 👋 Start Here — JobHunter OS

**You don't need to be technical. You need to do 3 things, then just talk.**

JobHunter OS is your personal AI job-hunting assistant. It finds jobs that fit you,
tailors your CV for each one, writes your outreach, and tracks everything on a clean
dashboard. An AI agent does the heavy lifting — you just chat with it.

---

## ✅ The only 3 steps you do yourself

### Step 1 — Get this folder onto your computer
- Click the green **`Code`** button at the top of the GitHub page → **Download ZIP**.
- Unzip it. (Right-click → Extract All.) Remember where you put it.

> No GitHub account needed. You're just downloading a folder.

### Step 2 — Open it in Cursor (free)
- Download Cursor here 👉 **https://cursor.com** — it's free, works on Windows & Mac.
- Install it, open it, then: **File → Open Folder…** and pick the folder you just unzipped.
- On the right side you'll see a **chat box**. That's where you talk to your assistant.

> 💡 Already use Claude (Cowork) or Antigravity? Those work too — see the bottom of this file.

### Step 3 — Type the magic words
In the chat box on the right, type exactly this and press Enter:

```
Let's get started
```

**That's it.** Your assistant will introduce itself and walk you through everything else —
setting up your profile, finding your first jobs, and opening your dashboard. You never
have to touch a settings file or write any code. Just answer its questions like a chat.

---

## 🗺️ What happens after you type "Let's get started"

Your assistant will:
1. Ask you to **upload your CV**, **paste your LinkedIn profile**, or share any other real
   material (portfolio, certs, whatever you've got) — it builds your profile from that, and
   only asks questions to fill in what's genuinely missing. It never invents experience.
2. Ask **where you're job hunting** — job sites are regional, so this decides which boards
   it searches (LinkedIn + Bayt/GulfTalent for the UAE, LinkedIn + Naukri for India, etc.).
3. Save everything into your private profile (stored only on *your* computer).
4. Offer to **find jobs** for you — say *"find me jobs"* anytime. It searches real job boards
   for real, live postings — falling back to actually browsing LinkedIn/regional sites if
   bulk search doesn't work — and never fabricates a listing or a link.
5. **Score jobs for real** — say *"how well do I fit this role?"*. It reads the actual job
   description, not just the title.
6. **Tailor your CV** for any job — say *"tailor my CV for the Careem role"*. Built only from
   what's genuinely in your profile.
7. **Write your outreach** — say *"write the cover letter and LinkedIn messages"*.
8. Show it all on your **dashboard** — double-click `dashboard/index.html` to open it.

You're always in control. Nothing is sent anywhere or posted on your behalf. And if your
assistant can't do something for real (no web access, can't reach a site), it'll tell you
instead of faking it.

---

## 💬 Handy things to say to your assistant

| You want to… | Just type… |
|---|---|
| Set everything up | `Let's get started` |
| Find new jobs | `Find me jobs` |
| Score how well a job fits you | `How well do I fit the Noon role?` |
| Tailor your CV | `Tailor my CV for [company]` |
| Write outreach | `Write the cover letter and DMs for [company]` |
| See your pipeline | Open `dashboard/index.html` |

---

## 🧩 Using a different AI tool? (optional)

The recommended path is **Cursor** because it's free and easy. But this works anywhere —
support for auto-discovering the skills just varies by tool:

- **Claude (Cowork):** Connect this folder, then type `Let's get started`. *Even simpler — no code editor, just chat.* Skills auto-load via `.claude/skills/`.
- **Cursor:** Skills auto-load via `.cursor/rules/`.
- **Antigravity or anything else:** Open the folder and type `Let's get started` — it reads `AGENTS.md` directly. If it doesn't pick the skills up on its own, just say "read AGENTS.md and follow the skills in `skills/`" once at the start.

All of them follow the same underlying instructions (`AGENTS.md` + `skills/`), so the
experience should feel the same either way — Claude and Cursor just get there automatically.
See `README.md` for a flowchart of how all the pieces connect, or double-click `dashboard/index.html` to see the UI.
