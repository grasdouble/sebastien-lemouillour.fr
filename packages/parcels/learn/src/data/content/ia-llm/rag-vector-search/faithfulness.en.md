---
id: faithfulness
order: 23
difficulty: advanced
tags: [rag, evaluation]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

The answer looks polished, cites the right document, and still sneaks in one unsupported sentence that can get your team in trouble. That is the failure mode people hand-wave as “hallucination.” In a RAG system, I prefer the stricter word: faithfulness.

Faithfulness asks whether the claims in the answer are actually supported by the retrieved evidence. Not vaguely aligned, not emotionally plausible, supported. This is why I do not trust whole-answer thumbs-up reviews. They miss the exact thing that breaks production systems: one confident sentence that the context never justified.

The best mental model I know comes from [FactScore](https://arxiv.org/abs/2305.14251), which breaks a generation into atomic facts and checks whether each fact is supported by a reliable source. That is the right granularity. A response can be mostly useful and still contain one unacceptable claim. If you only score the answer as a blob, you will not catch that.

For automated loops, [Ragas faithfulness metric](https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/faithfulness/) is a practical place to start because it gives you faithfulness-style metrics you can run repeatedly, and [TruLens](https://www.trulens.org/) is helpful when you want groundedness tied back to traces and retrieved context. I use both ideas the same way: judge support at the claim level, then inspect failures with the original chunks in front of me.

What most tutorials skip is that citations are not proof. A model can mention a source ID and still fabricate the actual statement. Formatting a citation is cheap. Evidence alignment is the hard part.

That is why I like enforcing a stricter answer contract before shipping:

```yaml
generation_policy:
  allow_inference_beyond_context: false
  sentence_level_citations: true
  answer_unknown_when_evidence_missing: true
verification:
  split_into_atomic_claims: true
  mark_unsupported_claims: true
  fail_if_unsupported_claim_rate_gt: 0.03
```

This kind of policy feels severe until you work on a domain where mistakes matter. Internal knowledge tools can sometimes tolerate a little drift. Legal, medical, finance, and customer policy systems cannot.

My cutoff is blunt for a reason: if unsupported claims are above low single digits on your critical workflows, you are not “almost there.” You are still training users to distrust the product, and that damage is much harder to fix than latency or UI.
