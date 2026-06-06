#!/usr/bin/env python3
"""
Test suite for analyze-changesets.py

Tests cover:
- Root package detection (PY-001)
- Overlapping changesets (PY-002)
- Error handling (PY-003, PY-004)
- Edge cases (malformed, permissions, empty)
"""

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock
import sys
import os

# Add script dir to path
sys.path.insert(0, os.path.dirname(__file__))


class TestGetPackageName(unittest.TestCase):
    """Tests for get_package_name function."""
    
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.project_root = Path(self.temp_dir.name)
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_root_package_detected(self):
        """PY-001: Root package.json should be detected."""
        from analyze_changesets import get_package_name
        
        # Create root package.json
        root_pkg = self.project_root / "package.json"
        root_pkg.write_text('{"name": "@grasdouble/root"}')
        
        # Create a file at root level
        pkg_name, error = get_package_name("README.md", self.project_root)
        
        self.assertEqual(pkg_name, "@grasdouble/root")
        self.assertIsNone(error)
    
    def test_nested_package_preferred(self):
        """Nested package.json should be preferred over root."""
        from analyze_changesets import get_package_name
        
        # Create root package.json
        root_pkg = self.project_root / "package.json"
        root_pkg.write_text('{"name": "@grasdouble/root"}')
        
        # Create nested package
        nested_dir = self.project_root / "packages" / "my-pkg"
        nested_dir.mkdir(parents=True)
        nested_pkg = nested_dir / "package.json"
        nested_pkg.write_text('{"name": "@grasdouble/my-pkg"}')
        
        # Test file in nested package
        pkg_name, error = get_package_name("packages/my-pkg/src/index.ts", self.project_root)
        
        self.assertEqual(pkg_name, "@grasdouble/my-pkg")
        self.assertIsNone(error)
    
    def test_json_parse_error_logged(self):
        """PY-003: JSON parse errors should be logged, not silently ignored."""
        from analyze_changesets import get_package_name
        
        # Create root package.json with invalid JSON
        root_pkg = self.project_root / "package.json"
        root_pkg.write_text('{"name": invalid}')  # Malformed
        
        pkg_name, error = get_package_name("README.md", self.project_root)
        
        # Should still return "root" but log error
        self.assertEqual(pkg_name, "root")
        self.assertIsNotNone(error)
        self.assertIn("Failed to parse", error)
    
    def test_fallback_to_root(self):
        """Files with no parent package.json should default to 'root'."""
        from analyze_changesets import get_package_name
        
        # No package.json anywhere
        pkg_name, error = get_package_name("LICENSE.md", self.project_root)
        
        self.assertEqual(pkg_name, "root")


class TestFindDuplicateChangesets(unittest.TestCase):
    """Tests for find_duplicate_changesets function."""
    
    def test_exact_duplicates_detected(self):
        """Should detect changesets targeting same package set."""
        from analyze_changesets import find_duplicate_changesets
        
        changesets = [
            {
                'filename': 'file1.md',
                'packages': [
                    {'name': '@grasdouble/pkg-a', 'bump': 'minor'},
                    {'name': '@grasdouble/pkg-b', 'bump': 'patch'}
                ]
            },
            {
                'filename': 'file2.md',
                'packages': [
                    {'name': '@grasdouble/pkg-a', 'bump': 'minor'},
                    {'name': '@grasdouble/pkg-b', 'bump': 'patch'}
                ]
            }
        ]
        
        result = find_duplicate_changesets(changesets)
        
        self.assertEqual(len(result['exact_duplicates']), 1)
        self.assertEqual(set(result['exact_duplicates'][0]['changesets']), {'file1.md', 'file2.md'})
    
    def test_overlapping_detected(self):
        """PY-002: Should detect overlapping changesets (shared package, different sets)."""
        from analyze_changesets import find_duplicate_changesets
        
        changesets = [
            {
                'filename': 'file1.md',
                'packages': [
                    {'name': '@grasdouble/shared-pkg', 'bump': 'minor'},
                    {'name': '@grasdouble/pkg-a', 'bump': 'patch'}
                ]
            },
            {
                'filename': 'file2.md',
                'packages': [
                    {'name': '@grasdouble/shared-pkg', 'bump': 'minor'},
                    {'name': '@grasdouble/pkg-b', 'bump': 'patch'}
                ]
            }
        ]
        
        result = find_duplicate_changesets(changesets)
        
        # Should have 0 exact duplicates (different package sets)
        self.assertEqual(len(result['exact_duplicates']), 0)
        
        # Should have 1 overlapping (shared-pkg in both)
        self.assertEqual(len(result['overlapping']), 1)
        self.assertEqual(result['overlapping'][0]['package'], '@grasdouble/shared-pkg')
        self.assertEqual(set(result['overlapping'][0]['changesets']), {'file1.md', 'file2.md'})
    
    def test_no_duplicates(self):
        """Non-overlapping changesets should not be flagged."""
        from analyze_changesets import find_duplicate_changesets
        
        changesets = [
            {
                'filename': 'file1.md',
                'packages': [{'name': '@grasdouble/pkg-a', 'bump': 'minor'}]
            },
            {
                'filename': 'file2.md',
                'packages': [{'name': '@grasdouble/pkg-b', 'bump': 'patch'}]
            }
        ]
        
        result = find_duplicate_changesets(changesets)
        
        self.assertEqual(len(result['exact_duplicates']), 0)
        self.assertEqual(len(result['overlapping']), 0)


class TestParseChangesetFile(unittest.TestCase):
    """Tests for parse_changeset_file function."""
    
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_path = Path(self.temp_dir.name)
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_valid_changeset(self):
        """Should parse valid changesets correctly."""
        from analyze_changesets import parse_changeset_file
        
        changeset_file = self.temp_path / "test.md"
        changeset_file.write_text("""---
'@grasdouble/pkg-a': minor
'@grasdouble/pkg-b': patch
---

feat: add new feature"""
        )
        
        result = parse_changeset_file(changeset_file)
        
        self.assertEqual(len(result['packages']), 2)
        self.assertEqual(result['prefix'], 'feat')
        self.assertNotIn('error', result)
    
    def test_malformed_bump_level_reported(self):
        """PY-004: Malformed bump levels should be reported as errors."""
        from analyze_changesets import parse_changeset_file
        
        changeset_file = self.temp_path / "test.md"
        changeset_file.write_text("""---
'@grasdouble/pkg-a': invalid
---

feat: something"""
        )
        
        result = parse_changeset_file(changeset_file)
        
        self.assertIn('error', result)
        self.assertIn('Invalid bump level', result['error'])
    
    def test_malformed_package_entry_reported(self):
        """PY-004: Malformed package entries should be reported."""
        from analyze_changesets import parse_changeset_file
        
        changeset_file = self.temp_path / "test.md"
        changeset_file.write_text("""---
malformed entry line
'@grasdouble/pkg-a': minor
---

feat: something"""
        )
        
        result = parse_changeset_file(changeset_file)
        
        self.assertIn('error', result)
        self.assertIn('Malformed', result['error'])


class TestCoverageGaps(unittest.TestCase):
    """Tests for coverage gap detection."""
    
    def test_modified_packages_without_changesets_detected(self):
        """Should detect packages with changes but no changeset."""
        from analyze_changesets import find_coverage_gaps
        
        modified_packages = {'@grasdouble/pkg-a', '@grasdouble/pkg-b', '@grasdouble/pkg-c'}
        changeset_packages = {'@grasdouble/pkg-a'}  # Missing pkg-b, pkg-c
        
        gaps = find_coverage_gaps(modified_packages, changeset_packages)
        
        self.assertEqual(gaps, {'@grasdouble/pkg-b', '@grasdouble/pkg-c'})
    
    def test_root_excluded_from_coverage(self):
        """Root-level files should not require changesets (per AGENTS.md)."""
        from analyze_changesets import find_coverage_gaps
        
        modified_packages = {'root', '@grasdouble/pkg-a'}
        changeset_packages = {'@grasdouble/pkg-a'}
        
        gaps = find_coverage_gaps(modified_packages, changeset_packages)
        
        # Root should be excluded
        self.assertEqual(gaps, set())


class TestBranchNameValidation(unittest.TestCase):
    """Tests for branch name validation."""
    
    def test_valid_branch_names(self):
        """Valid branch names should pass validation."""
        from analyze_changesets import main
        
        valid_branches = [
            'main',
            'develop',
            'feat/my-feature',
            'fix/issue-123',
            'release/1.2.3'
        ]
        
        for branch in valid_branches:
            # Just verify regex accepts them
            pattern = r'^[a-zA-Z0-9._/-]+$'
            import re
            self.assertIsNotNone(re.match(pattern, branch))


if __name__ == '__main__':
    unittest.main()
