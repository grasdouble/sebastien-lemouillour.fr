---
'@grasdouble/slm_shared': patch
---

fix: increase default max_tokens from 256 to 2048 for LLM responses.

Before: responses were truncated after ~256 tokens (~200 words), cutting off messages mid-sentence.

Now: responses can be up to 2048 tokens (~1500 words), allowing complete answers to most questions.

Affects both streaming and non-streaming generation modes.
