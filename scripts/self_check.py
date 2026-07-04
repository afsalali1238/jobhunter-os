"""
JobHunter OS - self check.

Runs a handful of cheap, deterministic checks that have each caught a real bug during
development: Python syntax errors, a JS syntax error that silently blanked the whole
dashboard, stale file-path references left behind after a migration, and skill files
drifting out of sync across the three IDEs this repo supports.

This does NOT test the AI-driven parts (whether a skill's instructions are followed
correctly) - only the deterministic scaffolding around them. Run it after editing
anything in scripts/, dashboard/, or skills/ before committing.

Usage:
    python3 scripts/self_check.py
"""
import filecmp
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

failures = []
warnings = []


def check(label, ok, is_warning=False):
    status = "OK" if ok else ("WARN" if is_warning else "FAIL")
    print(f"[{status}] {label}")
    if not ok:
        (warnings if is_warning else failures).append(label)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


# --- 1. Python syntax across every .py file in the repo ---
py_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", "__pycache__", "node_modules")]
    for f in filenames:
        if f.endswith(".py"):
            py_files.append(os.path.join(dirpath, f))

py_ok = True
for f in py_files:
    result = run([sys.executable, "-m", "py_compile", f])
    if result.returncode != 0:
        py_ok = False
        print(result.stderr.strip())
check(f"Python syntax ({len(py_files)} file(s))", py_ok)


# --- 2. JS syntax for the dashboard (skipped gracefully if node isn't installed) ---
app_js = os.path.join(ROOT, "dashboard", "app.js")
node_path = shutil.which("node")
if node_path:
    result = run([node_path, "--check", app_js])
    check("dashboard/app.js syntax (node --check)", result.returncode == 0)
    if result.returncode != 0:
        print(result.stderr.strip())
else:
    check("dashboard/app.js syntax", True, is_warning=True)
    print("  node not found on PATH - install Node.js to enable this check, or open the dashboard in a browser and check the console for errors.")


# --- 3. add_lead.py dry run against a throwaway copy of the real workbook ---
xlsx_path = os.path.join(ROOT, "excel", "JobHunter_Pipeline.xlsx")
add_lead_path = os.path.join(ROOT, "excel", "add_lead.py")
if os.path.exists(xlsx_path) and os.path.exists(add_lead_path):
    with tempfile.TemporaryDirectory() as tmp:
        tmp_xlsx = os.path.join(tmp, "test_pipeline.xlsx")
        shutil.copy(xlsx_path, tmp_xlsx)
        result = run([
            sys.executable, add_lead_path,
            "--file", tmp_xlsx,
            "--company", "SelfCheck Co", "--role", "Test Role",
            "--url", "https://example.com/self-check-job",
            "--score", "77", "--status", "Scouted",
        ])
        check("excel/add_lead.py dry run (temp copy only, real file untouched)", result.returncode == 0)
        if result.returncode != 0:
            print(result.stderr.strip())
else:
    check("excel/add_lead.py dry run", True, is_warning=True)
    print("  excel/JobHunter_Pipeline.xlsx or add_lead.py not found - skipped.")


# --- 4. Stale references left over from past migrations ---
STALE_PATTERNS = ["scraped_leads.json", "build_ats_docx", "python-docx"]
SCAN_EXT = (".md", ".mdc", ".py", ".html", ".js")
SELF_PATH = os.path.join("scripts", "self_check.py")
stale_hits = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", "__pycache__", "node_modules")]
    for f in filenames:
        if not f.endswith(SCAN_EXT):
            continue
        path = os.path.join(dirpath, f)
        rel_path = os.path.relpath(path, ROOT)
        if rel_path == "CHANGELOG.md":
            continue  # historical record - old references there are expected and fine
        if rel_path == SELF_PATH:
            continue  # this file lists the patterns literally, that's not a stale reference
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
        except OSError:
            continue
        for pattern in STALE_PATTERNS:
            if pattern in content:
                stale_hits.append(f"{rel_path} -> '{pattern}'")

check(f"No stale references ({', '.join(STALE_PATTERNS)})", not stale_hits)
for hit in stale_hits:
    print(f"  {hit}")


# --- 5. Skill mirrors in sync across skills/, .claude/skills/, .cursor/rules/, .agents/skills/ ---
skills_dir = os.path.join(ROOT, "skills")
claude_dir = os.path.join(ROOT, ".claude", "skills")
cursor_dir = os.path.join(ROOT, ".cursor", "rules")
agents_dir = os.path.join(ROOT, ".agents", "skills")


def body_after_frontmatter(path):
    with open(path, "r", encoding="utf-8") as fh:
        lines = fh.readlines()
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                return "".join(lines[i + 1:])
    return "".join(lines)


mirror_drift = []
if os.path.isdir(skills_dir):
    for name in sorted(os.listdir(skills_dir)):
        canonical = os.path.join(skills_dir, name, "SKILL.md")
        if not os.path.isfile(canonical):
            continue

        claude_mirror = os.path.join(claude_dir, name, "SKILL.md")
        if os.path.isfile(claude_mirror):
            if not filecmp.cmp(canonical, claude_mirror, shallow=False):
                mirror_drift.append(f".claude/skills/{name}/SKILL.md differs from skills/{name}/SKILL.md")

        cursor_mirror = os.path.join(cursor_dir, f"{name}.mdc")
        if os.path.isfile(cursor_mirror):
            # .mdc has its own frontmatter (description/globs/alwaysApply) instead of
            # name/description, so only compare the body after each file's frontmatter block.
            if body_after_frontmatter(canonical) != body_after_frontmatter(cursor_mirror):
                mirror_drift.append(f".cursor/rules/{name}.mdc body differs from skills/{name}/SKILL.md")

        agents_mirror = os.path.join(agents_dir, name, "SKILL.md")
        if os.path.isfile(agents_mirror):
            # Antigravity uses the same open SKILL.md standard (name/description frontmatter)
            # as skills/ and .claude/skills/, so this should be a byte-for-byte copy.
            if not filecmp.cmp(canonical, agents_mirror, shallow=False):
                mirror_drift.append(f".agents/skills/{name}/SKILL.md differs from skills/{name}/SKILL.md")

check("Skill mirrors in sync (skills/ is the source of truth)", not mirror_drift)
for drift in mirror_drift:
    print(f"  {drift}")


# --- Summary ---
print()
if failures:
    print(f"SELF-CHECK FAILED: {len(failures)} issue(s) must be fixed before committing.")
    sys.exit(1)
elif warnings:
    print(f"Self-check passed with {len(warnings)} warning(s) (see above) - not blocking, but worth a look.")
    sys.exit(0)
else:
    print("Self-check passed.")
    sys.exit(0)
