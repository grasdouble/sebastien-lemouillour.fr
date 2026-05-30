---
id: human-evaluation-of-models
order: 29
difficulty: advanced
tags: [LLM, évaluation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

When quality really matters, automated evals stop being enough very quickly. They miss tone, usefulness, harmlessness, and the annoying class of answers users describe as "technically correct but bad." Human evaluation is how you catch that gap. It also becomes garbage the moment the operations are sloppy. Bad human eval is expensive noise with authority attached to it.

## Start with the rubric, not the raters

Most evaluation failures begin before anyone reads a sample. If the rubric is vague, raters will improvise. If the task instructions mix multiple criteria, scores collapse into vibe. Good annotation guidelines define each criterion, give positive and negative examples, and explain tie-break cases. Practical guidance like the [Label Studio guide](https://labelstud.io/guide/quality.html) gets this right: quality starts with clear instructions and review loops, not with hoping annotators share your intuition.

My bias is to keep rubrics narrower than teams want. Separate factuality from usefulness. Separate policy compliance from tone. Separate final-answer quality from process quality. The more dimensions you stuff into one question, the less interpretable the score becomes.

## Choose the scale that fits the judgment

People reach for 1-to-5 ratings because they are familiar. The original [Likert scale](https://archive.org/details/likert-1932-technique-for-measurement-of-attitudes) is fine for fast scalar judgments when the criterion is simple and the anchors are explicit. It is not my first choice when differences are subtle or outputs are close in quality.

For ranking nuanced model outputs, pairwise comparison is often better. It reduces rater hesitation and forces a concrete preference. Statistical models such as [Bradley-Terry](https://projecteuclid.org/euclid.aoms/1177729694) exist for a reason: comparative judgments are often more stable than absolute ones. If the product decision is "which answer would we ship," pairwise is usually the more honest format.

## Agreement is a diagnostic, not a trophy

Teams love reporting inter-annotator agreement as if a high number proves the evaluation is good. It does not. Agreement tells you whether the rubric is producing consistent judgments, not whether those judgments are the right ones. Measures like [Cohen's kappa](https://www.jstor.org/stable/2529310) and [alpha](https://repository.upenn.edu/asc_papers/43/) are useful because they surface ambiguity, rater drift, and criteria that need rewriting.

The failure mode is using agreement as a punishment tool. If raters disagree, the first question should be whether the examples or rubric are underspecified. Some disagreement is healthy when prompts are genuinely ambiguous. Forced consensus can erase the edge cases you most need to understand.

## What production-grade human eval needs

Blind reviews matter. Randomized order matters. Sampling matters. If raters know which model produced which answer, or if you only review easy prompts, you are building a performance narrative, not an evaluation. Calibration sessions also matter more than most teams admit. A short weekly review of disagreements can improve data quality more than hiring more raters.

I would also keep a small adjudicated set that does not change casually. Not because it is sacred, but because trend lines need some stability. Then refresh the broader sample aggressively so the evaluation stays connected to current user behavior.

## Decision rule

Use human evaluation whenever the release decision depends on qualities machines still score badly: usefulness, nuance, tone, safety judgment, or comparative preference. If you cannot afford blind review, clear rubrics, and periodic agreement checks, do not pretend you have a gold-standard eval. You have anecdotes with spreadsheets.
