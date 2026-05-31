"""Tests for structural-validation.py using fixture-based temp directories.

Run from the skill root:
    python3 -m pytest scripts/tests/ -v
or:
    python3 -m unittest scripts/tests/test_structural_validation -v
"""
import importlib.util
import io
import json
import os
import tempfile
import unittest
from unittest.mock import patch

SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..")


def load_module(name: str):
    spec = importlib.util.spec_from_file_location(name, os.path.join(SCRIPTS_DIR, f"{name}.py"))
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


def write_guide(root: str, cat: str, catalog: str, lang: str, guide_id: str, fm_overrides: dict | None = None, body: str = "") -> None:
    folder = os.path.join(root, "packages/parcels/learn/src/data/content", cat, catalog)
    os.makedirs(folder, exist_ok=True)
    defaults = {
        "id": guide_id,
        "order": "1",
        "difficulty": "beginner",
        "publishedAt": "2025-01-01",
        "updatedAt": "2025-01-01",
    }
    if fm_overrides:
        defaults.update(fm_overrides)
    lines = ["---"] + [f"{k}: {v}" for k, v in defaults.items()] + ["---", "", body or "## Body content", ""]
    with open(os.path.join(folder, f"{guide_id}.{lang}.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


class TestStructuralValidation(unittest.TestCase):
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
        mod = load_module("structural-validation")
        with patch("sys.stdout", buf):
            mod.main()
        return json.loads(buf.getvalue())

    def test_clean_guide_has_no_issues(self) -> None:
        clean_body = (
            "Use [tool one](https://example.com/one) for setup. "
            "Configure [tool two](https://example.com/two) next. "
            "See [official docs](https://example.com/docs) for details."
        )
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=clean_body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=clean_body)
        result = self._run()
        self.assertEqual(result["structural_issues"], [])

    def test_missing_fr_file_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide")
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("missing_fr_file", types)

    def test_frontmatter_mismatch_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide")
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", {"difficulty": "advanced"})
        result = self._run()
        mismatches = [i for i in result["structural_issues"] if i["type"] == "fm_mismatch"]
        self.assertTrue(any(m["field"] == "difficulty" for m in mismatches))

    def test_invalid_date_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", {"publishedAt": "not-a-date"})
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", {"publishedAt": "not-a-date"})
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("invalid_date", types)

    def test_updated_before_published_detected(self) -> None:
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide",
                    {"publishedAt": "2025-06-01", "updatedAt": "2025-01-01"})
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide",
                    {"publishedAt": "2025-06-01", "updatedAt": "2025-01-01"})
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("updated_before_published", types)

    def test_duplicate_url_detected(self) -> None:
        body = "See [docs](https://example.com) and also [more](https://example.com) for details."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide")
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("duplicate_urls", types)

    def test_banned_phrase_detected(self) -> None:
        body = "This is straightforward to configure."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide")
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("banned_phrase", types)

    def test_banned_phrase_at_end_of_day(self) -> None:
        body = "At the end of the day, it depends on your use case."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide")
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("banned_phrase", types)

    def test_missing_content_dir_exits_1(self) -> None:
        with self.assertRaises(SystemExit) as ctx:
            load_module("structural-validation").main()
        self.assertEqual(ctx.exception.code, 1)

    def test_exit_code_0_on_findings(self) -> None:
        """Issues found should not make the script exit with non-zero — findings are not failures."""
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide")
        # no FR file → issue found, but process must exit 0
        try:
            result = self._run()
            self.assertIn("missing_fr_file", [i["type"] for i in result["structural_issues"]])
        except SystemExit as e:
            self.fail(f"Unexpected SystemExit({e.code}) on findings")

    def test_under_linked_detected(self) -> None:
        body = "A guide with no external links at all."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("under_linked", types)

    def test_over_linked_detected(self) -> None:
        links = " ".join(f"[tool{i}](https://example.com/{i})" for i in range(8))
        body = f"This guide has many links: {links}."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("over_linked", types)

    def test_too_many_links_detected(self) -> None:
        links = " ".join(f"[tool{i}](https://example.com/{i})" for i in range(11))
        body = f"Excessive links: {links}."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("too_many_links", types)

    def test_resources_no_links_detected(self) -> None:
        three_links = "[a](https://a.com) [b](https://b.com) [c](https://c.com)"
        body = f"Intro with {three_links}.\n\n## Resources\n\nSee the official documentation for more info."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("resources_no_links", types)

    def test_resources_with_links_is_clean(self) -> None:
        body = (
            "[a](https://a.com) [b](https://b.com) [c](https://c.com).\n\n"
            "## Resources\n\n- [Official docs](https://docs.example.com)"
        )
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertNotIn("resources_no_links", types)

    def test_long_anchor_text_detected(self) -> None:
        three_links = "[a](https://a.com) [b](https://b.com) [c](https://c.com)"
        body = (
            f"Read {three_links} and also "
            "[OpenAI recommends evals to track behavior as prompts and models change](https://example.com)."
        )
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertIn("long_anchor_text", types)

    def test_short_anchor_text_is_clean(self) -> None:
        body = "[a](https://a.com) [b](https://b.com) [tool docs](https://c.com)."
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "en", "my-guide", body=body)
        write_guide(self._tmp, "ia-llm", "ia-llm-fundamentals", "fr", "my-guide", body=body)
        result = self._run()
        types = [i["type"] for i in result["structural_issues"]]
        self.assertNotIn("long_anchor_text", types)


if __name__ == "__main__":
    unittest.main()
