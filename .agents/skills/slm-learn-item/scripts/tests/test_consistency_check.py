"""Tests for consistency-check.py using fixture-based temp directories.

Run from the skill root:
    python3 -m pytest scripts/tests/ -v
or:
    python3 -m unittest scripts/tests/test_consistency_check -v
"""
import importlib.util
import io
import json
import os
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


def build_fixture(root: str, *, catalog_order: list[str], category_keys: list[str],
                  catalogs: list[tuple[str, str]], guides: list[tuple[str, str, str]],
                  en_extra: dict | None = None, fr_extra: dict | None = None) -> None:
    """Build a minimal fixture tree under root."""
    # learn.ts
    ts_dir = os.path.join(root, "packages/parcels/learn/src/data")
    os.makedirs(ts_dir, exist_ok=True)
    cats_str = ", ".join(f"'{c}'" for c in category_keys)
    order_str = ", ".join(f"'{c}'" for c in catalog_order)
    with open(os.path.join(ts_dir, "learn.ts"), "w") as f:
        f.write(
            f"export const CATEGORY_KEYS: readonly string[] = [{cats_str}];\n"
            f"export const CATALOG_ORDER: readonly string[] = [{order_str}];\n"
        )

    # i18n
    i18n_dir = os.path.join(root, "packages/parcels/learn/src/i18n/locales")
    os.makedirs(i18n_dir, exist_ok=True)

    en_catalog_items = {cid: {"title": f"T {cid}", "description": "D"} for _, cid in catalogs}
    fr_catalog_items = {cid: {"title": f"T {cid}", "description": "D"} for _, cid in catalogs}
    en_items = {gid: {"title": f"T {gid}", "description": "D"} for _, _, gid in guides}
    fr_items = {gid: {"title": f"T {gid}", "description": "D"} for _, _, gid in guides}
    en_cats = {ck: ck.upper() for ck in category_keys}
    fr_cats = {ck: ck.upper() for ck in category_keys}

    en_data: dict = {"categories": en_cats, "catalogs": {"items": en_catalog_items}, "items": en_items}
    fr_data: dict = {"categories": fr_cats, "catalogs": {"items": fr_catalog_items}, "items": fr_items}
    if en_extra:
        _deep_update(en_data, en_extra)
    if fr_extra:
        _deep_update(fr_data, fr_extra)

    with open(os.path.join(i18n_dir, "en.json"), "w") as f:
        json.dump(en_data, f, indent=2)
    with open(os.path.join(i18n_dir, "fr.json"), "w") as f:
        json.dump(fr_data, f, indent=2)

    # Always create base content directory
    os.makedirs(os.path.join(root, "packages/parcels/learn/src/data/content"), exist_ok=True)

    # content folders + guide files
    for cat, catalog, gid in guides:
        folder = os.path.join(root, "packages/parcels/learn/src/data/content", cat, catalog)
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, f"{gid}.en.md"), "w") as f:
            f.write("---\nid: {}\n---\n".format(gid))
        with open(os.path.join(folder, f"{gid}.fr.md"), "w") as f:
            f.write("---\nid: {}\n---\n".format(gid))


def _deep_update(base: dict, overrides: dict) -> None:
    for k, v in overrides.items():
        if isinstance(v, dict) and isinstance(base.get(k), dict):
            _deep_update(base[k], v)
        else:
            base[k] = v


class TestConsistencyCheck(unittest.TestCase):
    def setUp(self) -> None:
        self._cwd = os.getcwd()
        self._tmp = tempfile.mkdtemp()
        os.chdir(self._tmp)

    def tearDown(self) -> None:
        os.chdir(self._cwd)
        import shutil

        shutil.rmtree(self._tmp)

    def _run(self) -> dict:
        buf = io.StringIO()
        mod = load_module("consistency-check")
        with patch("sys.stdout", buf):
            mod.main()
        return json.loads(buf.getvalue())

    def _clean_fixture(self) -> None:
        build_fixture(
            self._tmp,
            catalog_order=["ia-llm-fundamentals"],
            category_keys=["ia-llm"],
            catalogs=[("ia-llm", "ia-llm-fundamentals")],
            guides=[("ia-llm", "ia-llm-fundamentals", "my-guide")],
        )

    def test_clean_fixture_has_no_issues(self) -> None:
        self._clean_fixture()
        result = self._run()
        for section in result.values():
            for key, val in section.items():
                self.assertEqual(val, [], f"Unexpected issue in {key}: {val}")

    def test_catalog_in_folder_not_in_catalog_order(self) -> None:
        build_fixture(
            self._tmp,
            catalog_order=[],  # missing the catalog
            category_keys=["ia-llm"],
            catalogs=[("ia-llm", "ia-llm-fundamentals")],
            guides=[("ia-llm", "ia-llm-fundamentals", "my-guide")],  # creates the folder
        )
        result = self._run()
        self.assertIn("ia-llm-fundamentals", result["catalogs"]["in_folders_not_in_catalog_order"])

    def test_catalog_in_order_not_in_folders(self) -> None:
        build_fixture(
            self._tmp,
            catalog_order=["ghost-catalog"],
            category_keys=["ia-llm"],
            catalogs=[],   # no i18n for ghost-catalog
            guides=[],     # no content folder for ghost-catalog
        )
        result = self._run()
        self.assertIn("ghost-catalog", result["catalogs"]["in_catalog_order_not_in_folders"])

    def test_guide_missing_from_en_i18n(self) -> None:
        build_fixture(
            self._tmp,
            catalog_order=["ia-llm-fundamentals"],
            category_keys=["ia-llm"],
            catalogs=[("ia-llm", "ia-llm-fundamentals")],
            guides=[("ia-llm", "ia-llm-fundamentals", "orphan-guide")],
            en_extra={"items": {}},  # clear items in EN
        )
        # Rebuild cleanly but remove the guide from en.json manually
        i18n_path = os.path.join(self._tmp, "packages/parcels/learn/src/i18n/locales/en.json")
        data = json.load(open(i18n_path))
        data["items"] = {}
        json.dump(data, open(i18n_path, "w"))
        result = self._run()
        self.assertIn("orphan-guide", result["items"]["in_files_not_in_en"])

    def test_missing_ts_file_exits_1(self) -> None:
        os.makedirs("packages/parcels/learn/src/data/content", exist_ok=True)
        # no learn.ts, no i18n files → should exit 1
        with self.assertRaises(SystemExit) as ctx:
            load_module("consistency-check").main()
        self.assertEqual(ctx.exception.code, 1)

    def test_exit_code_0_on_findings(self) -> None:
        """Consistency issues found should not make the script exit non-zero."""
        build_fixture(
            self._tmp,
            catalog_order=["ia-llm-fundamentals"],
            category_keys=["ia-llm"],
            catalogs=[("ia-llm", "ia-llm-fundamentals")],
            guides=[],  # no content guides → in_files_not_in_en/fr will be empty, but it's a valid run
        )
        try:
            result = self._run()
            self.assertIsInstance(result, dict)
        except SystemExit as e:
            self.fail(f"Unexpected SystemExit({e.code}) on findings")


if __name__ == "__main__":
    unittest.main()
