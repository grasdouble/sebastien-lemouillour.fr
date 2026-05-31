"""Tests for inventory-snapshot.py using fixture-based temp directories.

Run from the skill root:
    python3 -m pytest scripts/tests/ -v
or:
    python3 -m unittest scripts/tests/test_inventory_snapshot -v
"""
import importlib.util
import json
import os
import tempfile
import textwrap
import unittest

SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..")


def load_module(name: str):
    """Load a script module by file path without executing its __main__ block."""
    spec = importlib.util.spec_from_file_location(name, os.path.join(SCRIPTS_DIR, f"{name}.py"))
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


def write_guide(root: str, cat: str, catalog: str, filename: str, frontmatter: str) -> None:
    folder = os.path.join(root, "packages/parcels/learn/src/data/content", cat, catalog)
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, filename), "w", encoding="utf-8") as f:
        f.write(frontmatter + "\n\n## Body\n")


GOOD_FM = textwrap.dedent("""\
    ---
    id: my-guide
    order: 1
    difficulty: beginner
    tags: [IA]
    publishedAt: 2025-01-01
    updatedAt: 2025-01-01
    ---
""")

NO_FM = "## No frontmatter here\n"


class TestInventorySnapshot(unittest.TestCase):
    def setUp(self) -> None:
        self._cwd = os.getcwd()
        self._tmp = tempfile.mkdtemp()
        os.chdir(self._tmp)

    def tearDown(self) -> None:
        os.chdir(self._cwd)
        import shutil

        shutil.rmtree(self._tmp)

    def _run_main(self) -> dict:
        import io
        from unittest.mock import patch

        buf = io.StringIO()
        mod = load_module("inventory-snapshot")
        with patch("sys.stdout", buf):
            mod.main()
        return json.loads(buf.getvalue())

    def test_empty_content_dir_returns_empty_guides(self) -> None:
        os.makedirs("packages/parcels/learn/src/data/content", exist_ok=True)
        result = self._run_main()
        self.assertEqual(result["guides"], [])

    def test_guide_with_valid_frontmatter_is_parsed(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "my-guide.en.md", GOOD_FM)
        result = self._run_main()
        guides = result["guides"]
        self.assertEqual(len(guides), 1)
        g = guides[0]
        self.assertEqual(g["id"], "my-guide")
        self.assertEqual(g["categoryKey"], "ia-llm")
        self.assertEqual(g["catalogId"], "ia-llm-fundamentals")
        self.assertEqual(g["order"], 1)
        self.assertEqual(g["difficulty"], "beginner")
        self.assertEqual(g["publishedAt"], "2025-01-01")
        self.assertEqual(g["updatedAt"], "2025-01-01")

    def test_guide_without_frontmatter_uses_filename_as_id(self) -> None:
        write_guide(self._tmp, "tooling", "tooling-essentials", "vite-guide.en.md", NO_FM)
        result = self._run_main()
        guides = result["guides"]
        self.assertEqual(len(guides), 1)
        self.assertEqual(guides[0]["id"], "vite-guide")
        self.assertIsNone(guides[0]["order"])

    def test_fr_files_are_ignored(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "my-guide.en.md", GOOD_FM)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "my-guide.fr.md", GOOD_FM)
        result = self._run_main()
        self.assertEqual(len(result["guides"]), 1)

    def test_missing_content_dir_exits_1(self) -> None:
        with self.assertRaises(SystemExit) as ctx:
            load_module("inventory-snapshot").main()
        self.assertEqual(ctx.exception.code, 1)

    def test_multiple_guides_across_catalogs(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.en.md", GOOD_FM)
        write_guide(self._tmp, "tooling", "tooling-essentials", "guide-b.en.md", GOOD_FM)
        result = self._run_main()
        self.assertEqual(len(result["guides"]), 2)
        cats = {g["categoryKey"] for g in result["guides"]}
        self.assertIn("ia-llm", cats)
        self.assertIn("tooling", cats)


if __name__ == "__main__":
    unittest.main()
