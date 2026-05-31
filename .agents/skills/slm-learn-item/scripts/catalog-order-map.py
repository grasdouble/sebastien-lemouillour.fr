#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# ///
"""Catalog order map — reads the current ordering of guides in a catalog and detects duplicate order values.
Run from the project root: python3 {skill-root}/scripts/catalog-order-map.py <categoryKey> <catalogId>

Exit codes:
  0 — success (JSON printed to stdout)
  1 — bad arguments or catalog path not found
  2 — IO or filesystem error
"""
import argparse
import json
import os
import sys


def parse_frontmatter(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as f:
            content = f.read()
    except OSError as e:
        print(f"Error reading {path}: {e}", file=sys.stderr)
        sys.exit(2)
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
    parser = argparse.ArgumentParser(
        description="Read the current ordering of guides in a catalog and detect duplicate order values.",
        epilog="Run from the project root.",
    )
    parser.add_argument("categoryKey", help="Category key (e.g. ia-llm, tooling, architecture)")
    parser.add_argument("catalogId", help="Catalog id (e.g. ia-llm-fundamentals)")
    args = parser.parse_args()

    catalog_path = f"packages/parcels/learn/src/data/content/{args.categoryKey}/{args.catalogId}"
    if not os.path.isdir(catalog_path):
        print(f"Error: catalog directory not found: {catalog_path}", file=sys.stderr)
        sys.exit(1)

    guides = []
    for f in sorted(os.listdir(catalog_path)):
        if not f.endswith(".en.md"):
            continue
        fm = parse_frontmatter(os.path.join(catalog_path, f))
        guides.append(
            {
                "id": fm.get("id", f.replace(".en.md", "")),
                "order": int(fm.get("order", 0)),
                "file": f,
            }
        )

    guides.sort(key=lambda g: g["order"])
    orders = [g["order"] for g in guides]
    dupes = sorted({o for o in orders if orders.count(o) > 1})
    print(
        json.dumps(
            {
                "current_order": guides,
                "duplicate_orders": dupes,
                "is_contiguous": orders == list(range(1, len(orders) + 1)),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

