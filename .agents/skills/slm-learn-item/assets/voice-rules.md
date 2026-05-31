# Voice Rules — Learn Guides

These guides live on Sébastien's personal site. They must sound like a developer with opinions, not a system following a template.

## Write with a point of view

- ✅ State what you would choose and why ("I'd start with X every time unless…")
- ✅ Acknowledge what's genuinely tricky ("This is the part that confused me for longer than I'd like to admit")
- ✅ Allow light humor or informal asides
- ✅ Name the thing that most tutorials skip ("Every example shows the happy path — here's what happens when the token expires mid-request")
- ❌ Never be a neutral narrator — neutral is forgettable
- ❌ Never list options without saying which one you'd actually pick

## Open with a concrete pain, not a definition

The first sentence must put the reader in a situation they recognize — not introduce what the guide covers.

- ✅ "You've set up your first LLM call, it works locally, and then you deploy it. Latency spikes. You have no idea why."
- ✅ "Every monorepo tutorial assumes you start from scratch. This one doesn't."
- ❌ "In this guide, we'll explore how to…"
- ❌ "React Query is a library for…"
- ❌ "This article covers the basics of…"

## Voice — always Découvreur

The voice is always the **Découvreur** persona regardless of the guide's `difficulty`. Difficulty controls the _depth and scope_ of content (see `content-quality-rules.md`), not the register.

- Warm and reassuring: normalize confusion, meet the reader where they are
- ✅ "Don't worry if this feels abstract — it clicked for me once I saw a real example."
- ✅ "This tripped me up the first time."
- ❌ Blunt or peer-to-peer register that assumes fluency with jargon
- ❌ Coldly authoritative: "This only makes sense at scale."

## Reformulation examples

Before/after pairs for common antipatterns:

| ❌ Before                                                        | ✅ After                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| "It's worth noting that rate limits apply here."                 | "Rate limits will bite you. Cap your concurrency before you find out the hard way." |
| "Now that we've seen X, let's move on to Y."                     | "X gets you running. Y is what stops you from running into a wall at 2am."          |
| "In conclusion, we covered A, B, and C."                         | "One rule of thumb: if the config grows past three files, it's time to extract."    |
| "You can use either X or Y. Both have advantages and drawbacks." | "Use X. Y looks appealing but you'll spend a week fighting its config."             |

## Antipatterns — ban in all guide content

- ❌ `—` (em dash surrounded by spaces) in prose — use a comma, colon, or restructure
- ❌ "straightforward", "Let's dive in", "In conclusion", "It's worth noting that", "At the end of the day"
- ❌ Mechanical transitions ("Now that X is clear, let's move to Y")
- ❌ Closing sentences that echo the intro or summarize what was covered
- ❌ Perfect symmetry between sections (same length, rhythm, structure)
- ❌ Lists that enumerate facts without a stance

## EN and FR parity

EN and FR must match in voice: same opinions, stance, and personality — not just structure. FR is not a reduced version; translate the narrative including the lightness and the humor. If a sentence punches in EN, it must punch in FR too — rephrase rather than translate literally when needed.
