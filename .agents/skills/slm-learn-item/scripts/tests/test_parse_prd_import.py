"""Tests for parse-prd-import.py.

Run from the skill root:
    python3 -m pytest scripts/tests/ -v
or:
    python3 -m unittest scripts/tests/test_parse_prd_import -v
"""
import importlib.util
import json
import os
import re
import sys
import tempfile
import textwrap
import unittest

SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..")


def load_module(name: str):
    """Load a script module by file path without executing its __main__ block."""
    spec = importlib.util.spec_from_file_location(
        name, os.path.join(SCRIPTS_DIR, f"{name}.py")
    )
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


# ── French-format fixtures ────────────────────────────────────────────────────

SIMPLE_PRD = textwrap.dedent("""\
    # Catalogue 1 — Comprendre les LLM

    > Objectif : comprendre ce qu'est un LLM.

    ## Niveau Débutant

    ### Les bases de l'IA

    1. Qu'est-ce que l'Intelligence Artificielle ?
    2. IA, Machine Learning et Deep Learning

    ## Niveau Intermédiaire

    ### Architecture des modèles

    3. Les Transformers

    ## Niveau Avancé

    ### Alignement des modèles

    4. RLHF
""")

TWO_CATALOG_PRD = textwrap.dedent("""\
    # Catalogue 1 — Premier catalogue

    > Objectif : premier objectif.

    ## Niveau Débutant

    ### Bases

    1. Guide un
    2. Guide deux

    ---

    # Catalogue 2 — Second catalogue

    > Objectif : second objectif.

    ## Niveau Intermédiaire

    ### Avancé

    1. Guide trois
""")

MISSING_OBJECTIF_PRD = textwrap.dedent("""\
    # Catalogue 1 — Sans objectif

    ## Niveau Débutant

    ### Bases

    1. Un guide
""")

NON_CONTIGUOUS_PRD = textwrap.dedent("""\
    # Catalogue 1 — Gaps

    > Objectif : tester les gaps.

    ## Niveau Débutant

    ### Section

    1. Guide un
    3. Guide trois
""")


class TestSlugify(unittest.TestCase):
    def setUp(self) -> None:
        m = load_module("parse-prd-import")
        self.slugify = m.slugify

    def test_basic_ascii(self) -> None:
        assert self.slugify("Hello World") == "hello-world"

    def test_french_accents(self) -> None:
        assert self.slugify("Qu'est-ce que l'IA ?") == "quest-ce-que-lia"

    def test_special_characters(self) -> None:
        assert self.slugify("LLM & RAG") == "llm-rag"

    def test_numbers_kept(self) -> None:
        result = self.slugify("Top-K et Top-P")
        assert "top" in result and "k" in result

    def test_consecutive_hyphens_collapsed(self) -> None:
        result = self.slugify("RLHF !")
        assert "--" not in result

    def test_trailing_leading_hyphens_stripped(self) -> None:
        result = self.slugify("  --- test ---  ")
        assert not result.startswith("-")
        assert not result.endswith("-")


class TestParsePrd(unittest.TestCase):
    def setUp(self) -> None:
        self.m = load_module("parse-prd-import")

    def test_single_catalog_title_extracted(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        assert len(catalogs) == 1
        assert catalogs[0]["title_fr"] == "Comprendre les LLM"

    def test_single_catalog_description_extracted(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        assert catalogs[0]["description_fr"] == "comprendre ce qu'est un LLM."

    def test_single_catalog_guide_count(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        assert catalogs[0]["guide_count"] == 4

    def test_guide_difficulty_mapping(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        guides = catalogs[0]["guides"]
        assert guides[0]["difficulty"] == "beginner"
        assert guides[2]["difficulty"] == "intermediate"
        assert guides[3]["difficulty"] == "advanced"

    def test_guide_order_preserved(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        orders = [g["order"] for g in catalogs[0]["guides"]]
        assert orders == [1, 2, 3, 4]

    def test_guide_sub_section_assigned(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        assert catalogs[0]["guides"][0]["sub_section"] == "Les bases de l'IA"

    def test_guide_title_fr_preserved(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        assert catalogs[0]["guides"][0]["title_fr"] == "Qu'est-ce que l'Intelligence Artificielle ?"

    def test_guide_proposed_id_is_kebab(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        gid = catalogs[0]["guides"][0]["proposed_id"]
        assert re.match(r"^[a-z0-9-]+$", gid), f"Not kebab-case: {gid!r}"

    def test_two_catalogs(self) -> None:
        catalogs = self.m.parse_prd(TWO_CATALOG_PRD, "ia-llm")
        assert len(catalogs) == 2
        assert catalogs[0]["title_fr"] == "Premier catalogue"
        assert catalogs[1]["title_fr"] == "Second catalogue"

    def test_two_catalogs_order_restarts(self) -> None:
        catalogs = self.m.parse_prd(TWO_CATALOG_PRD, "ia-llm")
        assert [g["order"] for g in catalogs[0]["guides"]] == [1, 2]
        assert [g["order"] for g in catalogs[1]["guides"]] == [1]

    def test_missing_objectif_returns_none(self) -> None:
        catalogs = self.m.parse_prd(MISSING_OBJECTIF_PRD, "ia-llm")
        assert catalogs[0]["description_fr"] is None

    def test_category_key_propagated(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "tooling")
        assert catalogs[0]["category_key"] == "tooling"

    def test_empty_prd_returns_empty(self) -> None:
        catalogs = self.m.parse_prd("# Just a heading\n\nNo catalogue.", "ia-llm")
        assert len(catalogs) == 0


class TestValidate(unittest.TestCase):
    def setUp(self) -> None:
        self.m = load_module("parse-prd-import")

    def _make_catalog(self, cid: str, title: str, guides: list[dict], *, desc: str | None = "desc") -> dict:
        return {
            "proposed_id": cid,
            "title_fr": title,
            "description_fr": desc,
            "category_key": "ia-llm",
            "guide_count": len(guides),
            "guides": guides,
        }

    def _make_guide(self, gid: str, order: int, difficulty: str = "beginner") -> dict:
        return {
            "order": order,
            "proposed_id": gid,
            "title_fr": f"Guide {gid}",
            "difficulty": difficulty,
            "sub_section": "Section",
        }

    def test_clean_input_no_errors(self) -> None:
        catalogs = [
            self._make_catalog("cat-a", "Cat A", [self._make_guide("guide-1", 1)]),
        ]
        v = self.m.validate(catalogs, set(), set())
        assert v["errors"] == []
        assert v["internal_catalog_collisions"] == []
        assert v["existing_catalog_collisions"] == []

    def test_missing_objectif_is_error(self) -> None:
        catalogs = [self._make_catalog("cat-a", "Cat A", [self._make_guide("guide-1", 1)], desc=None)]
        v = self.m.validate(catalogs, set(), set())
        assert any("Objectif" in e for e in v["errors"])

    def test_internal_catalog_collision_is_error(self) -> None:
        catalogs = [
            self._make_catalog("cat-a", "Cat A", [self._make_guide("guide-1", 1)]),
            self._make_catalog("cat-a", "Cat A Duplicate", [self._make_guide("guide-2", 1)]),
        ]
        v = self.m.validate(catalogs, set(), set())
        assert len(v["internal_catalog_collisions"]) == 1

    def test_existing_catalog_collision_is_error(self) -> None:
        catalogs = [self._make_catalog("cat-a", "Cat A", [self._make_guide("guide-1", 1)])]
        v = self.m.validate(catalogs, {"cat-a"}, set())
        assert "cat-a" in v["existing_catalog_collisions"]

    def test_internal_guide_collision_is_warning(self) -> None:
        catalogs = [
            self._make_catalog("cat-a", "Cat A", [
                self._make_guide("same-id", 1),
                self._make_guide("same-id", 2),
            ]),
        ]
        v = self.m.validate(catalogs, set(), set())
        assert len(v["internal_guide_collisions"]) == 1
        assert v["errors"] == []

    def test_existing_guide_collision_is_warning(self) -> None:
        catalogs = [self._make_catalog("cat-a", "Cat A", [self._make_guide("guide-1", 1)])]
        v = self.m.validate(catalogs, set(), {"guide-1"})
        assert any("guide-1" in w for w in [str(c) for c in v["existing_guide_collisions"]])

    def test_non_contiguous_ordering_is_warning(self) -> None:
        guides = [self._make_guide("guide-1", 1), self._make_guide("guide-3", 3)]
        catalogs = [self._make_catalog("cat-a", "Cat A", guides)]
        v = self.m.validate(catalogs, set(), set())
        assert any("contiguous" in w for w in v["warnings"])

    def test_no_guides_is_warning(self) -> None:
        catalogs = [self._make_catalog("cat-a", "Cat A", [])]
        v = self.m.validate(catalogs, set(), set())
        assert any("no guides" in w for w in v["warnings"])

    def test_none_difficulty_is_error(self) -> None:
        guide = self._make_guide("guide-1", 1)
        guide["difficulty"] = None
        catalogs = [self._make_catalog("cat-a", "Cat A", [guide])]
        v = self.m.validate(catalogs, set(), set())
        assert any("difficulty" in e for e in v["errors"])


# ── English-format tests ──────────────────────────────────────────────────────

SIMPLE_PRD_EN = textwrap.dedent("""\
    # Catalog 1 — Understanding LLMs

    > Objective: understand what an LLM is, how it works, and its limitations.

    ## Beginner Level

    ### AI Fundamentals

    1. What is Artificial Intelligence?
    2. AI, Machine Learning, and Deep Learning

    ## Intermediate Level

    ### Model Architecture

    3. Transformers

    ## Advanced Level

    ### Model Alignment

    4. RLHF
""")

TWO_CATALOG_PRD_EN = textwrap.dedent("""\
    # Catalog 1 — First Catalog

    > Objective: first objective.

    ## Beginner Level

    ### Basics

    1. Guide one
    2. Guide two

    # Catalog 2 — Second Catalog

    > Objective: second objective.

    ## Intermediate Level

    ### Intermediate Basics

    1. Guide three
""")


class TestParsePrdEnglish(unittest.TestCase):
    def setUp(self) -> None:
        self.m = load_module("parse-prd-import")

    def test_en_catalog_title_extracted(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert len(catalogs) == 1
        assert catalogs[0]["title_fr"] == "Understanding LLMs"

    def test_en_objective_extracted(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert "understand what an LLM is" in catalogs[0]["description_fr"]

    def test_en_guide_count(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert catalogs[0]["guide_count"] == 4

    def test_en_difficulty_mapping_beginner(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert catalogs[0]["guides"][0]["difficulty"] == "beginner"
        assert catalogs[0]["guides"][1]["difficulty"] == "beginner"

    def test_en_difficulty_mapping_intermediate(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert catalogs[0]["guides"][2]["difficulty"] == "intermediate"

    def test_en_difficulty_mapping_advanced(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert catalogs[0]["guides"][3]["difficulty"] == "advanced"

    def test_en_guide_order_preserved(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert [g["order"] for g in catalogs[0]["guides"]] == [1, 2, 3, 4]

    def test_en_guide_title_preserved(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert catalogs[0]["guides"][0]["title_fr"] == "What is Artificial Intelligence?"

    def test_en_proposed_id_is_kebab(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        gid = catalogs[0]["guides"][0]["proposed_id"]
        assert re.match(r"^[a-z0-9-]+$", gid), f"Not kebab-case: {gid!r}"

    def test_en_source_language_detected(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD_EN, "ia-llm")
        assert catalogs[0]["source_language"] == "en"

    def test_fr_source_language_detected(self) -> None:
        catalogs = self.m.parse_prd(SIMPLE_PRD, "ia-llm")
        assert catalogs[0]["source_language"] == "fr"

    def test_en_two_catalogs(self) -> None:
        catalogs = self.m.parse_prd(TWO_CATALOG_PRD_EN, "ia-llm")
        assert len(catalogs) == 2
        assert catalogs[0]["title_fr"] == "First Catalog"
        assert catalogs[1]["title_fr"] == "Second Catalog"

    def test_en_catalog_without_number_word_not_matched(self) -> None:
        """A '# Some Title' without 'Catalog N' should not be parsed."""
        prd = "# Some Random Heading\n\n> Objective: test.\n\n## Beginner Level\n\n1. Guide\n"
        catalogs = self.m.parse_prd(prd, "ia-llm")
        assert len(catalogs) == 0


if __name__ == "__main__":
    unittest.main()
