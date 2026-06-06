#!/usr/bin/env python3
"""
Changeset analysis script for slm-changeset-auditor.

Performs mechanical analysis tasks:
- Lists files modified on the current branch vs target branch
- Groups modified files by package
- Parses existing changeset files
- Identifies package coverage gaps
- Detects duplicate/overlapping changesets

Output: JSON structured data for LLM analysis.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional


def run_git_command(args: List[str]) -> str:
    """Run a git command and return output.
    
    Raises subprocess.CalledProcessError with stderr if git command fails.
    """
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        error_msg = f"Git command failed: git {' '.join(args)}\nStderr: {e.stderr}"
        print(error_msg, file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("Error: git command not found. Ensure git is installed and on PATH.", file=sys.stderr)
        sys.exit(1)


def get_current_branch() -> str:
    """Get the name of the current git branch."""
    return run_git_command(["branch", "--show-current"])


def get_modified_files(target_branch: str = "main") -> List[str]:
    """Get list of files modified compared to target branch."""
    output = run_git_command(["diff", target_branch, "--name-only"])
    return [f for f in output.split("\n") if f]


def get_package_name(file_path: str, project_root: Path) -> Tuple[str, Optional[str]]:
    """Extract package name from a file path.
    
    Looks for package.json in the file's directory or parent directories,
    including the project root itself.
    
    Returns:
        (package_name, error_message)
        - package_name: the 'name' field from package.json, or directory name
        - error_message: if JSON parsing failed, the error message (else None)
    """
    file_full_path = project_root / file_path
    current_dir = file_full_path.parent if file_full_path.is_file() else file_full_path
    
    error_msg: Optional[str] = None
    
    # Walk up directories including project_root
    while True:
        package_json = current_dir / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    return data.get('name', current_dir.name), None
            except json.JSONDecodeError as e:
                error_msg = f"Failed to parse {package_json}: {e}"
                # Don't return yet — keep walking in case a parent has valid JSON
            except IOError as e:
                error_msg = f"Permission denied reading {package_json}: {e}"
                # Don't return yet — keep walking
        
        # Stop if we reach the root
        if current_dir == project_root:
            break
        current_dir = current_dir.parent
    
    # If no package.json found, use directory name or fallback
    if file_path.startswith("packages/"):
        parts = file_path.split("/")
        if len(parts) >= 2:
            return f"packages/{parts[1]}", error_msg
    
    return "root", error_msg


def group_files_by_package(files: List[str], project_root: Path) -> Tuple[Dict[str, List[str]], List[str]]:
    """Group modified files by their package.
    
    Returns:
        (packages_dict, warnings_list)
    """
    packages: Dict[str, List[str]] = {}
    warnings: List[str] = []
    
    # Cache for directory → package lookups
    package_cache: Dict[str, str] = {}
    
    for file_path in files:
        # Skip non-package files
        if file_path in ["pnpm-lock.yaml", "pnpm-workspace.yaml"]:
            continue
        
        package_name, error = get_package_name(file_path, project_root)
        if error:
            warnings.append(error)
        
        if package_name not in packages:
            packages[package_name] = []
        packages[package_name].append(file_path)
    
    return packages, warnings


def parse_changeset_file(changeset_path: Path) -> Dict:
    """Parse a changeset markdown file.
    
    Returns:
        {
            'filename': str,
            'packages': [{'name': str, 'bump': str}, ...],
            'description': str,
            'prefix': str (feat, fix, etc.),
            'content': str (full content),
            'error': str (if parsing failed, error message)
        }
    
    Robust parsing: if file is malformed, returns best-effort result with error flag.
    """
    try:
        with open(changeset_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except (IOError, OSError) as e:
        return {
            'filename': changeset_path.name,
            'packages': [],
            'description': '',
            'prefix': '',
            'content': '',
            'error': f'Failed to read file: {e}'
        }
    
    # Extract frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not frontmatter_match:
        return {
            'filename': changeset_path.name,
            'packages': [],
            'description': content.strip(),
            'prefix': '',
            'content': content,
            'error': 'No frontmatter found (expected --- ... ---)'
        }
    
    frontmatter = frontmatter_match.group(1)
    description = frontmatter_match.group(2).strip()
    
    # Parse package entries from frontmatter
    packages = []
    parse_errors = []
    for line in frontmatter.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if line.startswith("'") and ":" in line:
            # Format: '@grasdouble/package-name': minor
            match = re.match(r"'([^']+)':\s*(\w+)", line)
            if match:
                bump_level = match.group(2)
                # Validate bump level
                if bump_level not in ('major', 'minor', 'patch'):
                    parse_errors.append(f'Invalid bump level "{bump_level}" (line: {line})')
                else:
                    packages.append({
                        'name': match.group(1),
                        'bump': bump_level
                    })
            else:
                parse_errors.append(f'Malformed package entry: {line}')
    
    # Extract conventional commit prefix from description
    prefix = ''
    if description:
        first_line = description.split('\n')[0]
        prefix_match = re.match(r'^(feat|fix|chore|refactor|perf|docs|style|test):', first_line)
        if prefix_match:
            prefix = prefix_match.group(1)
    
    result = {
        'filename': changeset_path.name,
        'packages': packages,
        'description': description,
        'prefix': prefix,
        'content': content
    }
    
    if parse_errors:
        result['error'] = '; '.join(parse_errors)
    
    return result


def get_changesets(project_root: Path) -> Tuple[List[Dict], List[str]]:
    """Get all changeset files in .changeset/ directory.
    
    Returns:
        (changesets_list, errors_list)
        
    Errors logged separately so analysis can proceed despite malformed files.
    """
    changeset_dir = project_root / ".changeset"
    errors = []
    
    if not changeset_dir.exists():
        return [], []
    
    if not changeset_dir.is_dir():
        errors.append(f"Expected {changeset_dir} to be a directory, but it is not")
        return [], errors
    
    if not os.access(changeset_dir, os.R_OK):
        errors.append(f"Permission denied reading {changeset_dir}")
        return [], errors
    
    changesets = []
    try:
        for file_path in changeset_dir.glob("*.md"):
            # Skip README and config files
            if file_path.name in ["README.md", "config.json"]:
                continue
            changeset = parse_changeset_file(file_path)
            if 'error' in changeset:
                errors.append(f"{file_path.name}: {changeset['error']}")
            changesets.append(changeset)
    except (OSError, IOError) as e:
        errors.append(f"Failed to scan {changeset_dir}: {e}")
    
    return changesets, errors


def find_coverage_gaps(modified_packages: Set[str], changeset_packages: Set[str]) -> Set[str]:
    """Find packages with changes but no changeset entry."""
    # Filter out non-package entries
    real_packages = {p for p in modified_packages if p != "root" and not p.endswith(".yaml")}
    return real_packages - changeset_packages


def find_duplicate_changesets(changesets: List[Dict]) -> Dict:
    """Find exact duplicates and overlapping changesets.
    
    Returns:
        {
            'exact_duplicates': [{'packages': [...], 'changesets': [...]}, ...],
            'overlapping': [{'package': str, 'changesets': [...]}, ...]
        }
    """
    results = {
        'exact_duplicates': [],
        'overlapping': []
    }
    
    # Track exact duplicates (same package set)
    package_sets: Dict[Tuple, List[str]] = {}
    for changeset in changesets:
        package_names = tuple(sorted([p['name'] for p in changeset['packages']]))
        if package_names not in package_sets:
            package_sets[package_names] = []
        package_sets[package_names].append(changeset['filename'])
    
    results['exact_duplicates'] = [
        {
            'packages': list(package_set),
            'changesets': filenames
        }
        for package_set, filenames in package_sets.items()
        if len(filenames) > 1
    ]
    
    # Track overlapping changesets (shared packages across different sets)
    pkg_to_changesets: Dict[str, List[str]] = {}
    for changeset in changesets:
        for pkg in changeset['packages']:
            pkg_name = pkg['name']
            if pkg_name not in pkg_to_changesets:
                pkg_to_changesets[pkg_name] = []
            if changeset['filename'] not in pkg_to_changesets[pkg_name]:
                pkg_to_changesets[pkg_name].append(changeset['filename'])
    
    # Find overlaps (package in multiple changesets that are NOT exact duplicates)
    exact_duplicate_sets = {tuple(sorted(d['changesets'])) for d in results['exact_duplicates']}
    for pkg_name, filenames in pkg_to_changesets.items():
        if len(filenames) > 1:
            # Check if this is an exact duplicate
            sorted_files = tuple(sorted(filenames))
            if sorted_files not in exact_duplicate_sets:
                results['overlapping'].append({
                    'package': pkg_name,
                    'changesets': filenames
                })
    
    return results


def main():
    """Main analysis function.
    
    Validates all inputs and returns structured JSON with error tracking.
    """
    # Parse arguments
    target_branch = sys.argv[1] if len(sys.argv) > 1 else "main"
    
    # Validate target branch format
    if not target_branch or not re.match(r'^[a-zA-Z0-9._/-]+$', target_branch):
        print(json.dumps({
            'error': f'Invalid target branch: {target_branch}',
            'valid_format': 'alphanumeric, dots, underscores, slashes only'
        }, indent=2), file=sys.stdout)
        sys.exit(1)
    
    # Get project root (git root)
    try:
        git_root = run_git_command(["rev-parse", "--show-toplevel"])
        project_root = Path(git_root)
    except SystemExit:
        sys.exit(1)
    
    # Get current branch
    try:
        current_branch = get_current_branch()
    except SystemExit:
        sys.exit(1)
    
    # Get modified files
    try:
        modified_files = get_modified_files(target_branch)
    except SystemExit:
        sys.exit(1)
    
    # Group by package (returns warnings too)
    packages_with_changes, package_warnings = group_files_by_package(modified_files, project_root)
    
    # Get changesets (with error tracking)
    changesets, changeset_errors = get_changesets(project_root)
    
    # Extract all packages mentioned in changesets
    changeset_package_names = set()
    for changeset in changesets:
        for package in changeset['packages']:
            changeset_package_names.add(package['name'])
    
    # Find coverage gaps
    modified_package_names = set(packages_with_changes.keys())
    coverage_gaps = find_coverage_gaps(modified_package_names, changeset_package_names)
    
    # Find duplicate and overlapping changesets
    duplicates = find_duplicate_changesets(changesets)
    
    # Combine all warnings
    all_warnings = []
    if package_warnings:
        all_warnings.extend(package_warnings)
    if changeset_errors:
        all_warnings.extend(changeset_errors)
    
    # Build output with error tracking
    output = {
        'current_branch': current_branch,
        'target_branch': target_branch,
        'modified_files_count': len(modified_files),
        'packages_with_changes': {
            name: {
                'file_count': len(files),
                'files': files
            }
            for name, files in packages_with_changes.items()
        },
        'changesets': changesets,
        'changeset_count': len(changesets),
        'coverage_gaps': list(coverage_gaps),
        'duplicate_changesets': duplicates['exact_duplicates'],
        'overlapping_changesets': duplicates['overlapping'],
        'warnings': all_warnings if all_warnings else None
    }
    
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
