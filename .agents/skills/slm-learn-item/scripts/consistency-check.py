#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# ///
"""Category and locale consistency check — cross-references CATEGORY_KEYS, CATALOG_ORDER, content folders, and i18n files.
Run from the project root: python3 {skill-root}/scripts/consistency-check.py

Exit codes:
  0 — success (JSON printed to stdout; may contain non-empty issue lists)
  1 — IO or filesystem error (missing required files)
"""
import json
import os
import re
import sys

base = "packages/parcels/learn/src/data/content"
ts_path = "packages/parcels/learn/src/data/learn.ts"
en_path = "packages/parcels/learn/src/i18n/locales/en.json"
fr_path = "packages/parcels/learn/src/i18n/locales/fr.json"


def read_file(path: str) -> str:
    try:
        return open(path, encoding="utf-8").read()
    except OSError as e:
        print(f"Error reading {path}: {e}", file=sys.stderr)
        sys.exit(1)


def load_json(path: str) -> dict:
    try:
        return json.loads(read_file(path))
    except json.JSONDecodeError as e:
        print(f"Error parsing {path}: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    if not os.path.isdir(base):
        print(f"Error: content directory not found: {base}", file=sys.stderr)
        sys.exit(1)

    ts_src = read_file(ts_path)
    en = load_json(en_path)
    fr = load_json(fr_path)

    m_cats = re.search(r"CATEGORY_KEYS[^=]*=\s*\[([^\]]+)\]", ts_src, re.DOTALL)
    ts_cats = set(re.findall(r'["\']([^"\']+)["\']', m_cats.group(1))) if m_cats else set()

    m_order = re.search(r"CATALOG_ORDER[^=]*=\s*\[([^\]]+)\]", ts_src, re.DOTALL)
    ts_catalog_order = set(re.findall(r'["\']([^"\']+)["\']', m_order.group(1))) if m_order else set()

    folder_cats = {d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d))}
    folder_catalogs: set = set()
    for cat in os.listdir(base):
        cat_p = os.path.join(base, cat)
        if os.path.isdir(cat_p):
            for catalog in os.listdir(cat_p):
                if os.path.isdir(os.path.join(cat_p, catalog)):
                    folder_catalogs.add(catalog)

    en_cats = set(en.get("categories", {}).keys())
    fr_cats = set(fr.get("categories", {}).keys())
    en_catalog_items = set(en.get("catalogs", {}).get("items", {}).keys())
    fr_catalog_items = set(fr.get("catalogs", {}).get("items", {}).keys())

    guide_ids: set = set()
    for cat in os.listdir(base):
        cat_path = os.path.join(base, cat)
        if not os.path.isdir(cat_path):
            continue
        for catalog in os.listdir(cat_path):
            p = os.path.join(cat_path, catalog)
            if os.path.isdir(p):
                for f in os.listdir(p):
                    if f.endswith(".en.md"):
                        guide_ids.add(f.replace(".en.md", ""))

    en_items = set(en.get("items", {}).keys())
    fr_items = set(fr.get("items", {}).keys())

    all_known_catalogs = folder_catalogs | ts_catalog_order
    print(
        json.dumps(
            {
                "categories": {
                    "in_folders_not_in_ts": sorted(folder_cats - ts_cats),
                    "in_ts_not_in_folders": sorted(ts_cats - folder_cats),
                    "missing_en": sorted(ts_cats - en_cats),
                    "missing_fr": sorted(ts_cats - fr_cats),
                    "en_fr_drift": sorted(en_cats.symmetric_difference(fr_cats)),
                },
                "catalogs": {
                    "in_folders_not_in_catalog_order": sorted(folder_catalogs - ts_catalog_order),
                    "in_catalog_order_not_in_folders": sorted(ts_catalog_order - folder_catalogs),
                    "missing_en_i18n": sorted(all_known_catalogs - en_catalog_items),
                    "missing_fr_i18n": sorted(all_known_catalogs - fr_catalog_items),
                    "orphaned_en_i18n": sorted(en_catalog_items - all_known_catalogs),
                    "orphaned_fr_i18n": sorted(fr_catalog_items - all_known_catalogs),
                    "en_fr_drift": sorted(en_catalog_items.symmetric_difference(fr_catalog_items)),
                },
                "items": {
                    "in_files_not_in_en": sorted(guide_ids - en_items),
                    "in_files_not_in_fr": sorted(guide_ids - fr_items),
                    "orphaned_en_keys": sorted(en_items - guide_ids),
                    "orphaned_fr_keys": sorted(fr_items - guide_ids),
                    "en_fr_drift": sorted(en_items.symmetric_difference(fr_items)),
                },
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

