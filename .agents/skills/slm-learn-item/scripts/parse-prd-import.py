#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# ///
"""PRD import parser — parses a catalog PRD markdown file and outputs a dry-run manifest.

Supported PRD format:
  # Catalogue N — Title FR
  > Objectif : description...
  ## Niveau Débutant | Intermédiaire | Avancé
  ### Sub-section title
  1. Guide title FR
  2. Guide title FR
  ...

Run from the project root:
  python3 {skill-root}/scripts/parse-prd-import.py <prd-file> [--category <categoryKey>]

Arguments:
  prd-file             Path to the PRD markdown file (absolute or relative to cwd)
  --category           categoryKey to assign to all catalogs (e.g. ia-llm).
                       Required if it cannot be inferred from PRD content.

Exit codes:
  0 — success (JSON manifest printed to stdout; may contain errors/warnings)
  1 — IO or parse error preventing any output
"""
import argparse
import json
import os
import re
import sys
import unicodedata

base = "packages/parcels/learn/src/data/content"

DIFFICULTY_MAP = {
    # French
    "débutant": "beginner",
    "intermédiaire": "intermediate",
    "avancé": "advanced",
    # English
    "beginner": "beginner",
    "intermediate": "intermediate",
    "advanced": "advanced",
}

# Pattern that splits on catalog-level headings (FR: "# Catalogue N", EN: "# Catalog N")
_CATALOG_SPLIT_RE = re.compile(r"(?m)^(?=#\s+Catalog(?:ue)?\s+\d+)")
# Pattern that extracts the catalog title after the em-dash separator
_CATALOG_TITLE_RE = re.compile(r"^#\s+Catalog(?:ue)?\s+\d+\s+[—–-]+\s+(.+)$", re.MULTILINE)
# Pattern for the objective/description block (FR: "> Objectif :", EN: "> Objective:")
_OBJECTIF_RE = re.compile(r"^>\s*Objecti(?:f|ve)\s*:\s*(.+)$", re.MULTILINE)
# Pattern that splits within a catalog on difficulty-level headings
# Matches FR "## Niveau X" and EN "## Beginner|Intermediate|Advanced Level"
_LEVEL_SPLIT_RE = re.compile(
    r"(?m)^(?=##\s+(?:Niveau\s+|Beginner\b|Intermediate\b|Advanced\b))"
)
# Patterns to extract the difficulty keyword from a level heading
_LEVEL_FR_RE = re.compile(r"^##\s+Niveau\s+(\S+)", re.MULTILINE)
_LEVEL_EN_RE = re.compile(r"^##\s+(Beginner|Intermediate|Advanced)\b", re.MULTILINE)


def _detect_language(text: str) -> str:
    """Detect whether the PRD is written in English or French from its headings."""
    if _LEVEL_EN_RE.search(text) or re.search(r"^>\s*Objective:", text, re.MULTILINE):
        return "en"
    return "fr"


def slugify(text: str) -> str:
    """Convert a title to a deterministic kebab-case ASCII id."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"['`]", "", text)
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text.strip("-")


def parse_frontmatter(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return {}
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}
    fm: dict = {}
    for line in parts[1].split("\n"):
        idx = line.find(":")
        if idx != -1:
            k, v = line[:idx].strip(), line[idx + 1:].strip()
            if k:
                fm[k] = v
    return fm


def load_existing_ids() -> tuple[set, set]:
    """Return (existing_catalog_ids, existing_guide_ids) from the content directory."""
    catalog_ids: set = set()
    guide_ids: set = set()
    if not os.path.isdir(base):
        return catalog_ids, guide_ids
    for cat in os.listdir(base):
        cat_p = os.path.join(base, cat)
        if not os.path.isdir(cat_p):
            continue
        for catalog in os.listdir(cat_p):
            clog_p = os.path.join(cat_p, catalog)
            if not os.path.isdir(clog_p):
                continue
            catalog_ids.add(catalog)
            for f in os.listdir(clog_p):
                if f.endswith(".en.md"):
                    fm = parse_frontmatter(os.path.join(clog_p, f))
                    guide_ids.add(fm.get("id", f.replace(".en.md", "")))
    return catalog_ids, guide_ids


def parse_prd(text: str, category_key: str) -> list[dict]:
    """Parse PRD text and return a list of catalog dicts.

    Supports both French (# Catalogue N — …, ## Niveau Débutant, > Objectif :)
    and English (# Catalog N — …, ## Beginner Level, > Objective:) heading formats.
    The field names in the output use `title_fr` / `description_fr` as generic
    "source language" labels — the actual language is reported in `source_language`.
    """
    source_language = _detect_language(text)
    catalog_chunks = _CATALOG_SPLIT_RE.split(text)
    catalogs = []

    for chunk in catalog_chunks:
        chunk = chunk.strip()
        if not chunk:
            continue

        title_match = _CATALOG_TITLE_RE.match(chunk)
        if not title_match:
            continue
        title_fr = title_match.group(1).strip()

        desc_match = _OBJECTIF_RE.search(chunk)
        description_fr = desc_match.group(1).strip() if desc_match else None

        catalog_id = slugify(title_fr)

        level_chunks = _LEVEL_SPLIT_RE.split(chunk)
        guides = []
        seen_orders: set = set()
        prev_order = 0

        for lvl_chunk in level_chunks:
            lvl_match = _LEVEL_FR_RE.match(lvl_chunk)
            if lvl_match:
                difficulty_key = lvl_match.group(1).strip().lower()
            else:
                lvl_match = _LEVEL_EN_RE.match(lvl_chunk)
                if lvl_match:
                    difficulty_key = lvl_match.group(1).strip().lower()
                else:
                    continue
            difficulty = DIFFICULTY_MAP.get(difficulty_key)

            sub_section = None
            for line in lvl_chunk.split("\n"):
                sub_match = re.match(r"^###\s+(.+)$", line)
                if sub_match:
                    sub_section = sub_match.group(1).strip()
                    continue

                guide_match = re.match(r"^(\d+)\.\s+(.+)$", line)
                if guide_match:
                    order = int(guide_match.group(1))
                    title_fr_guide = guide_match.group(2).strip()
                    guide_id = slugify(title_fr_guide)
                    guides.append({
                        "order": order,
                        "proposed_id": guide_id,
                        "title_fr": title_fr_guide,
                        "difficulty": difficulty,
                        "sub_section": sub_section,
                    })
                    seen_orders.add(order)

                    if order != prev_order + 1 and prev_order != 0:
                        guides[-1]["_order_gap_warning"] = f"Order jumped from {prev_order} to {order}"
                    prev_order = order

        catalogs.append({
            "proposed_id": catalog_id,
            "title_fr": title_fr,
            "description_fr": description_fr,
            "category_key": category_key,
            "source_language": source_language,
            "guide_count": len(guides),
            "guides": guides,
        })

    return catalogs


def validate(catalogs: list[dict], existing_catalog_ids: set, existing_guide_ids: set) -> dict:
    errors = []
    warnings = []
    internal_catalog_collisions = []
    internal_guide_collisions = []
    existing_catalog_collisions = []
    existing_guide_collisions = []

    seen_catalog_ids: dict = {}
    seen_guide_ids: dict = {}

    for ci, catalog in enumerate(catalogs):
        cid = catalog["proposed_id"]
        label = catalog["title_fr"]

        if cid in seen_catalog_ids:
            internal_catalog_collisions.append({
                "id": cid,
                "conflict": [seen_catalog_ids[cid], label],
            })
        else:
            seen_catalog_ids[cid] = label

        if cid in existing_catalog_ids:
            existing_catalog_collisions.append(cid)

        if catalog["description_fr"] is None:
            errors.append(f"Catalog '{label}': missing '> Objectif :' block")

        if not catalog["guides"]:
            warnings.append(f"Catalog '{label}': no guides found")

        orders = [g["order"] for g in catalog["guides"]]
        if orders and sorted(orders) != list(range(1, len(orders) + 1)):
            warnings.append(
                f"Catalog '{label}': guide ordering is not contiguous 1…{len(orders)}. "
                f"Found: {sorted(orders)}"
            )

        for guide in catalog["guides"]:
            gid = guide["proposed_id"]
            if not gid:
                errors.append(
                    f"Catalog '{label}', order {guide['order']}: empty id generated from '{guide['title_fr']}'"
                )
                continue

            if guide["difficulty"] is None:
                errors.append(
                    f"Catalog '{label}', guide '{guide['title_fr']}': "
                    f"could not resolve difficulty (no parent '## Niveau' heading)"
                )

            if gid in seen_guide_ids:
                internal_guide_collisions.append({
                    "id": gid,
                    "conflict": [seen_guide_ids[gid], guide["title_fr"]],
                })
            else:
                seen_guide_ids[gid] = guide["title_fr"]

            if gid in existing_guide_ids:
                existing_guide_collisions.append({
                    "catalog": catalog["title_fr"],
                    "id": gid,
                    "title_fr": guide["title_fr"],
                })

            if guide.get("_order_gap_warning"):
                warnings.append(f"Catalog '{label}': {guide['_order_gap_warning']}")

    if internal_catalog_collisions:
        errors.append(
            f"Internal catalog id collisions: {internal_catalog_collisions}"
        )
    if existing_catalog_collisions:
        errors.append(
            f"Catalog ids already exist in content/: {existing_catalog_collisions}"
        )
    if internal_guide_collisions:
        warnings.append(
            f"Internal guide id collisions (will need suffix disambiguation): {internal_guide_collisions}"
        )
    if existing_guide_collisions:
        warnings.append(
            f"Guide ids already exist in content/ — agent must propose variants: "
            f"{[g['id'] for g in existing_guide_collisions]}"
        )

    return {
        "errors": errors,
        "warnings": warnings,
        "internal_catalog_collisions": internal_catalog_collisions,
        "internal_guide_collisions": internal_guide_collisions,
        "existing_catalog_collisions": existing_catalog_collisions,
        "existing_guide_collisions": existing_guide_collisions,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("prd_file", help="Path to the PRD markdown file")
    parser.add_argument(
        "--category",
        default="ia-llm",
        help="categoryKey for all catalogs (default: ia-llm)",
    )
    args = parser.parse_args()

    try:
        with open(args.prd_file, encoding="utf-8") as prd_f:
            prd_text = prd_f.read()
    except OSError as e:
        print(f"Error reading PRD file: {e}", file=sys.stderr)
        sys.exit(1)

    existing_catalog_ids, existing_guide_ids = load_existing_ids()
    catalogs = parse_prd(prd_text, args.category)

    if not catalogs:
        print(
            json.dumps({
                "catalogs": [],
                "validation": {
                    "errors": ["No '# Catalogue N — ...' headings found in PRD"],
                    "warnings": [],
                },
            }, indent=2, ensure_ascii=False)
        )
        return

    validation = validate(catalogs, existing_catalog_ids, existing_guide_ids)

    total_guides = sum(c["guide_count"] for c in catalogs)
    print(
        json.dumps({
            "catalogs": catalogs,
            "summary": {
                "catalog_count": len(catalogs),
                "total_guides": total_guides,
            },
            "validation": validation,
        }, indent=2, ensure_ascii=False)
    )


if __name__ == "__main__":
    main()
