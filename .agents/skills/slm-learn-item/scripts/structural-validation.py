#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# ///
"""Structural validation — deterministic checks on all guides: frontmatter parity, date validity, duplicate URLs, banned phrases.
Run from the project root: python3 {skill-root}/scripts/structural-validation.py

Exit codes:
  0 — success (JSON printed to stdout; may contain non-empty issue lists)
  1 — IO or filesystem error (missing required files or directories)
"""
import json
import os
import re
import sys

base = "packages/parcels/learn/src/data/content"
BANNED = [
    "straightforward",
    "Let's dive in",
    "In conclusion",
    "It's worth noting that",
    "Now that",
    "In summary",
]
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FM_FIELDS = ["id", "order", "difficulty", "publishedAt", "updatedAt"]
URL_RE = re.compile(r"https?://[^\s)\]\"']+")


def parse_fm_and_body(path: str) -> tuple[dict, str]:
    try:
        content = open(path, encoding="utf-8").read()
    except OSError as e:
        print(f"Error reading {path}: {e}", file=sys.stderr)
        sys.exit(1)
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content
    fm: dict = {}
    for line in parts[1].split("\n"):
        idx = line.find(":")
        if idx != -1:
            k, v = line[:idx].strip(), line[idx + 1 :].strip()
            if k:
                fm[k] = v
    return fm, parts[2]


def main() -> None:
    if not os.path.isdir(base):
        print(f"Error: content directory not found: {base}", file=sys.stderr)
        sys.exit(1)

    issues = []

    for cat in sorted(os.listdir(base)):
        cat_p = os.path.join(base, cat)
        if not os.path.isdir(cat_p):
            continue
        for catalog in sorted(os.listdir(cat_p)):
            clog_p = os.path.join(cat_p, catalog)
            if not os.path.isdir(clog_p):
                continue
            for f in sorted(os.listdir(clog_p)):
                if not f.endswith(".en.md"):
                    continue
                gid = f.replace(".en.md", "")
                en_p = os.path.join(clog_p, f)
                fr_p = os.path.join(clog_p, gid + ".fr.md")

                if not os.path.exists(fr_p):
                    issues.append({"id": gid, "type": "missing_fr_file"})
                    continue

                en_fm, en_body = parse_fm_and_body(en_p)
                fr_fm, _ = parse_fm_and_body(fr_p)

                for key in FM_FIELDS:
                    if en_fm.get(key) != fr_fm.get(key):
                        issues.append(
                            {
                                "id": gid,
                                "type": "fm_mismatch",
                                "field": key,
                                "en": en_fm.get(key),
                                "fr": fr_fm.get(key),
                            }
                        )

                for fm, lang in [(en_fm, "en"), (fr_fm, "fr")]:
                    for field in ["publishedAt", "updatedAt"]:
                        val = fm.get(field, "")
                        if not DATE_RE.match(val):
                            issues.append(
                                {
                                    "id": gid,
                                    "type": "invalid_date",
                                    "field": field,
                                    "lang": lang,
                                    "value": val,
                                }
                            )
                    if fm.get("updatedAt", "9") < fm.get("publishedAt", "0"):
                        issues.append({"id": gid, "type": "updated_before_published", "lang": lang})

                seen_urls: set = set()
                dupes = []
                for url in URL_RE.findall(en_body):
                    if url in seen_urls:
                        dupes.append(url)
                    seen_urls.add(url)
                if dupes:
                    issues.append({"id": gid, "type": "duplicate_urls", "urls": list(set(dupes))})

                for phrase in BANNED:
                    if phrase in en_body:
                        issues.append({"id": gid, "type": "banned_phrase", "phrase": phrase})

    print(json.dumps({"structural_issues": issues}, indent=2))


if __name__ == "__main__":
    main()

