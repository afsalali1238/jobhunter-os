"""
Convert CV HTML file(s) to PDF using headless Chrome, and report page count so
the agent can catch 2-page overflow before handing the file to the user.

Usage:
    python3 scripts/convert_html_cvs.py path/to/CV.html [more.html ...]
    python3 scripts/convert_html_cvs.py --dir output/cvs

With no arguments, defaults to converting every *.html file in output/cvs/.

Page-count check requires `pypdf` (pip install pypdf --break-system-packages).
If it isn't installed, conversion still runs — the page count just isn't
reported, and a one-line note explains why.
"""
import argparse
import glob
import os
import shutil
import subprocess
import sys


def find_chrome():
    """Locate a Chrome/Chromium executable across Windows, macOS, and Linux."""
    candidates = []

    # Windows
    for envvar in ("ProgramFiles", "ProgramFiles(x86)", "LocalAppData"):
        base = os.environ.get(envvar)
        if base:
            candidates.append(os.path.join(base, "Google", "Chrome", "Application", "chrome.exe"))
    candidates += [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]

    # macOS
    candidates += [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]

    for path in candidates:
        if path and os.path.exists(path):
            return path

    # Linux / anywhere on PATH
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"):
        found = shutil.which(name)
        if found:
            return found

    return None


def count_pdf_pages(pdf_path):
    """Return page count via pypdf, or None if pypdf isn't installed."""
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader  # older fallback name
        except ImportError:
            return None
    try:
        return len(PdfReader(pdf_path).pages)
    except Exception:
        return None


def convert_one(chrome_path, html_path):
    html_path = os.path.abspath(html_path)
    if not os.path.exists(html_path):
        print(f"  [ERROR] Not found: {html_path}")
        return False

    pdf_path = os.path.splitext(html_path)[0] + ".pdf"
    file_url = "file:///" + html_path.replace("\\", "/")

    print(f"  Converting: {os.path.basename(html_path)}")
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        f"--print-to-pdf={pdf_path}",
        "--print-to-pdf-no-header",
        "--no-pdf-header-footer",
        file_url,
    ]
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except Exception as e:
        print(f"  [ERROR] Chrome failed on {os.path.basename(html_path)}: {e}")
        return False

    if not os.path.exists(pdf_path):
        print(f"  [ERROR] No PDF produced for {os.path.basename(html_path)}")
        return False

    size_kb = os.path.getsize(pdf_path) // 1024
    pages = count_pdf_pages(pdf_path)
    if pages is None:
        print(f"  [OK] Saved: {os.path.basename(pdf_path)} ({size_kb}KB) - page count unknown (pip install pypdf to check)")
    elif pages > 2:
        print(f"  [WARNING] Saved: {os.path.basename(pdf_path)} ({size_kb}KB) - {pages} PAGES, over the 2-page limit. Trim content (see relevance-weighted trimming in tailor-cv/SKILL.md) and re-run.")
    else:
        plural = 's' if pages != 1 else ''
        print(f"  [OK] Saved: {os.path.basename(pdf_path)} ({size_kb}KB) - {pages} page{plural}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Convert CV HTML file(s) to PDF via headless Chrome.")
    parser.add_argument("files", nargs="*", help="Specific HTML file(s) to convert.")
    parser.add_argument("--dir", default=None, help="Convert every *.html file in this directory (default: output/cvs/ if no files given).")
    args = parser.parse_args()

    chrome_path = find_chrome()
    if not chrome_path:
        print("Error: Chrome/Chromium executable not found. Install Chrome, or open the HTML file(s) and use Print > Save as PDF manually.")
        sys.exit(1)

    if args.files:
        targets = args.files
    else:
        scan_dir = args.dir or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output", "cvs")
        targets = sorted(glob.glob(os.path.join(scan_dir, "*.html")))
        if not targets:
            print(f"No .html files found in {scan_dir}. Pass file paths explicitly, or use --dir.")
            sys.exit(1)

    print(f"Found {len(targets)} file(s). Converting...")
    ok_count = sum(convert_one(chrome_path, f) for f in targets)
    print(f"Done: {ok_count}/{len(targets)} converted.")


if __name__ == "__main__":
    main()
