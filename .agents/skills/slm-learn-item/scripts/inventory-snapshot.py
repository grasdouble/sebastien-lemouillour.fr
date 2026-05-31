#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# ///
"""Inventory snapshot — outputs all guides with their category, catalog, order, difficulty, and dates.
Run from the project root: python3 {skill-root}/scripts/inventory-snapshot.py

Exit codes:
  0 — success (JSON printed to stdout)
  1 — IO or filesystem error
"""
import json
import os
import sys

base = "packages/parcels/learn/src/data/content"


def parse_frontmatter(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as f:
            content = f.read()
    except OSError as e:
        print(f"Error reading {path}: {e}", file=sys.stderr)
        sys.exit(1)
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}
    fm: dict = {}
    for line in parts[1].split("\n"):
        idx = line.find(":")
        if idx != -1:
            k, v = line[:idx].strip(), line[idx + 1 :].strip()
            if k:
                fm[k] = v
    return fm


def main() -> None:
    if not os.path.isdir(base):
        print(f"Error: content directory not found: {base}", file=sys.stderr)
        sys.exit(1)

    guides = []
    for cat in sorted(os.listdir(base)):
        cat_p = os.path.join(base, cat)
        if not os.path.isdir(cat_p):
            continue
        for catalog in sorted(os.listdir(cat_p)):
            clog_p = os.path.join(base, cat, catalog)
            if not os.path.isdir(clog_p):
                continue
            for f in sorted(os.listdir(clog_p)):
                if not f.endswith(".en.md"):
                    continue
                fm = parse_frontmatter(os.path.join(clog_p, f))
                raw_order = fm.get("order")
                guides.append(
                    {
                        "id": fm.get("id", f.replace(".en.md", "")),
                        "categoryKey": cat,
                        "catalogId": catalog,
                        "order": int(raw_order) if raw_order is not None else None,
                        "difficulty": fm.get("difficulty"),
                        "publishedAt": fm.get("publishedAt"),
                        "updatedAt": fm.get("updatedAt"),
                    }
                )

    print(json.dumps({"guides": guides}, indent=2))


if __name__ == "__main__":
    main()

