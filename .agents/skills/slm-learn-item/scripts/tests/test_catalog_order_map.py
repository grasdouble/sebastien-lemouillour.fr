"""Tests for catalog-order-map.py using fixture-based temp directories.

Run from the skill root:
    python3 -m pytest scripts/tests/ -v
or:
    python3 -m unittest scripts/tests/test_catalog_order_map -v
"""
import importlib.util
import io
import json
import os
import sys
import tempfile
import textwrap
import unittest
from unittest.mock import patch

SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..")


def load_module(name: str):
    spec = importlib.util.spec_from_file_location(name, os.path.join(SCRIPTS_DIR, f"{name}.py"))
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


def write_guide(root: str, cat: str, catalog: str, filename: str, order: int, guide_id: str) -> None:
    folder = os.path.join(root, "packages/parcels/learn/src/data/content", cat, catalog)
    os.makedirs(folder, exist_ok=True)
    fm = textwrap.dedent(f"""\
        ---
        id: {guide_id}
        order: {order}
        difficulty: beginner
        publishedAt: 2025-01-01
        updatedAt: 2025-01-01
        ---
    """)
    open(os.path.join(folder, filename), "w").write(fm + "\n## Body\n")


class TestCatalogOrderMap(unittest.TestCase):
    def setUp(self) -> None:
        self._cwd = os.getcwd()
        self._tmp = tempfile.mkdtemp()
        os.chdir(self._tmp)

    def tearDown(self) -> None:
        os.chdir(self._cwd)
        import shutil

        shutil.rmtree(self._tmp)

    def _run(self, cat: str, catalog: str) -> dict:
        buf = io.StringIO()
        mod = load_module("catalog-order-map")
        with patch("sys.argv", ["catalog-order-map.py", cat, catalog]), patch("sys.stdout", buf):
            mod.main()
        return json.loads(buf.getvalue())

    def test_contiguous_order_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.en.md", 1, "guide-a")
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-b.en.md", 2, "guide-b")
        result = self._run("ia-llm", "ia-llm-fundamentals")
        self.assertTrue(result["is_contiguous"])
        self.assertEqual(result["duplicate_orders"], [])
        self.assertEqual(len(result["current_order"]), 2)

    def test_non_contiguous_order_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.en.md", 1, "guide-a")
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-b.en.md", 3, "guide-b")
        result = self._run("ia-llm", "ia-llm-fundamentals")
        self.assertFalse(result["is_contiguous"])

    def test_duplicate_orders_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.en.md", 1, "guide-a")
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-b.en.md", 1, "guide-b")
        result = self._run("ia-llm", "ia-llm-fundamentals")
        self.assertIn(1, result["duplicate_orders"])

    def test_missing_catalog_exits_1(self) -> None:
        os.makedirs("packages/parcels/learn/src/data/content", exist_ok=True)
        with self.assertRaises(SystemExit) as ctx:
            mod = load_module("catalog-order-map")
            with patch("sys.argv", ["catalog-order-map.py", "ia-llm", "nonexistent"]):
                mod.main()
        self.assertEqual(ctx.exception.code, 1)

    def test_fr_files_ignored(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.en.md", 1, "guide-a")
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.fr.md", 99, "guide-a")
        result = self._run("ia-llm", "ia-llm-fundamentals")
        self.assertEqual(len(result["current_order"]), 1)

    def test_guides_sorted_by_order_in_output(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-b.en.md", 2, "guide-b")
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "guide-a.en.md", 1, "guide-a")
        result = self._run("ia-llm", "ia-llm-fundamentals")
        orders = [g["order"] for g in result["current_order"]]
        self.assertEqual(orders, sorted(orders))


if __name__ == "__main__":
    unittest.main()
