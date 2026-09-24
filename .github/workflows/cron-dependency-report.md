# Weekly dependency reports

`cron-dependency-report.yml` runs every Monday or on demand. It installs the
repository dependencies, generates an outdated-dependency report, adds it to the
GitHub Actions job summary, and uploads it as the `outdated-dependencies-report`
artifact for 30 days.

The workflow is read-only and does not update packages, commit files, or create
pull requests. Dependabot owns package-update pull requests. The report file is
not stored in the repository; use the job summary or download the artifact from
the run.
