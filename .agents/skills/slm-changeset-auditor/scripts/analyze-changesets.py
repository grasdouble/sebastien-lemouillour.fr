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
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple


def run_git_command(args: List[str]) -> str:
    """Run a git command and return output."""
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}", file=sys.stderr)
        sys.exit(1)


def get_current_branch() -> str:
    """Get the name of the current git branch."""
    return run_git_command(["branch", "--show-current"])


def get_modified_files(target_branch: str = "main") -> List[str]:
    """Get list of files modified compared to target branch."""
    output = run_git_command(["diff", target_branch, "--name-only"])
    return [f for f in output.split("\n") if f]


def get_package_name(file_path: str, project_root: Path) -> str:
    """Extract package name from a file path.
    
    Looks for package.json in the file's directory or parent directories.
    Returns the 'name' field from package.json, or the directory name if no package.json.
    """
    file_full_path = project_root / file_path
    current_dir = file_full_path.parent if file_full_path.is_file() else file_full_path
    
    while current_dir != project_root:
        package_json = current_dir / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    return data.get('name', current_dir.name)
            except (json.JSONDecodeError, IOError):
                pass
        current_dir = current_dir.parent
    
    # If no package.json found, use directory name
    if file_path.startswith("packages/"):
        parts = file_path.split("/")
        if len(parts) >= 2:
            return f"packages/{parts[1]}"
    
    return "root"


def group_files_by_package(files: List[str], project_root: Path) -> Dict[str, List[str]]:
    """Group modified files by their package."""
    packages: Dict[str, List[str]] = {}
    
    for file_path in files:
        # Skip non-package files
        if file_path in ["pnpm-lock.yaml", "pnpm-workspace.yaml"]:
            continue
            
        package_name = get_package_name(file_path, project_root)
        if package_name not in packages:
            packages[package_name] = []
        packages[package_name].append(file_path)
    
    return packages


def parse_changeset_file(changeset_path: Path) -> Dict:
    """Parse a changeset markdown file.
    
    Returns:
        {
            'filename': str,
            'packages': [{'name': str, 'bump': str}, ...],
            'description': str,
            'prefix': str (feat, fix, etc.),
            'content': str (full content)
        }
    """
    with open(changeset_path, 'r') as f:
        content = f.read()
    
    # Extract frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not frontmatter_match:
        return {
            'filename': changeset_path.name,
            'packages': [],
            'description': content.strip(),
            'prefix': '',
            'content': content
        }
    
    frontmatter = frontmatter_match.group(1)
    description = frontmatter_match.group(2).strip()
    
    # Parse package entries from frontmatter
    packages = []
    for line in frontmatter.split('\n'):
        line = line.strip()
        if line.startswith("'") and ":" in line:
            # Format: '@grasdouble/package-name': minor
            match = re.match(r"'([^']+)':\s*(\w+)", line)
            if match:
                packages.append({
                    'name': match.group(1),
                    'bump': match.group(2)
                })
    
    # Extract conventional commit prefix from description
    prefix = ''
    if description:
        first_line = description.split('\n')[0]
        prefix_match = re.match(r'^(feat|fix|chore|refactor|perf|docs|style|test):', first_line)
        if prefix_match:
            prefix = prefix_match.group(1)
    
    return {
        'filename': changeset_path.name,
        'packages': packages,
        'description': description,
        'prefix': prefix,
        'content': content
    }


def get_changesets(project_root: Path) -> List[Dict]:
    """Get all changeset files in .changeset/ directory."""
    changeset_dir = project_root / ".changeset"
    if not changeset_dir.exists():
        return []
    
    changesets = []
    for file_path in changeset_dir.glob("*.md"):
        # Skip README and config files
        if file_path.name in ["README.md", "config.json"]:
            continue
        changesets.append(parse_changeset_file(file_path))
    
    return changesets


def find_coverage_gaps(modified_packages: Set[str], changeset_packages: Set[str]) -> Set[str]:
    """Find packages with changes but no changeset entry."""
    # Filter out non-package entries
    real_packages = {p for p in modified_packages if p != "root" and not p.endswith(".yaml")}
    return real_packages - changeset_packages


def find_duplicate_changesets(changesets: List[Dict]) -> List[Dict]:
    """Find changesets that target the exact same set of packages."""
    package_sets: Dict[Tuple, List[str]] = {}
    
    for changeset in changesets:
        package_names = tuple(sorted([p['name'] for p in changeset['packages']]))
        if package_names not in package_sets:
            package_sets[package_names] = []
        package_sets[package_names].append(changeset['filename'])
    
    duplicates = []
    for package_set, filenames in package_sets.items():
        if len(filenames) > 1:
            duplicates.append({
                'packages': list(package_set),
                'changesets': filenames
            })
    
    return duplicates


def main():
    """Main analysis function."""
    # Parse arguments
    target_branch = sys.argv[1] if len(sys.argv) > 1 else "main"
    
    # Get project root (git root)
    git_root = run_git_command(["rev-parse", "--show-toplevel"])
    project_root = Path(git_root)
    
    # Get current branch
    current_branch = get_current_branch()
    
    # Get modified files
    modified_files = get_modified_files(target_branch)
    
    # Group by package
    packages_with_changes = group_files_by_package(modified_files, project_root)
    
    # Get changesets
    changesets = get_changesets(project_root)
    
    # Extract all packages mentioned in changesets
    changeset_package_names = set()
    for changeset in changesets:
        for package in changeset['packages']:
            changeset_package_names.add(package['name'])
    
    # Find coverage gaps
    modified_package_names = set(packages_with_changes.keys())
    coverage_gaps = find_coverage_gaps(modified_package_names, changeset_package_names)
    
    # Find duplicate changesets
    duplicates = find_duplicate_changesets(changesets)
    
    # Build output
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
        'duplicate_changesets': duplicates
    }
    
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
