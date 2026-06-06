---
name: audit-examples
description: Real-world audit patterns from production sessions
---

# Audit Examples

Real patterns from audits. Use these as calibration for future sessions — what good consolidation looks like, what violations feel like in practice.

---

## Pattern 1: Iterative Workflow = Natural Duplicates

**Context:** Owner creates changesets during development (not batched at end). Result: multiple changesets for same package across the branch.

**Example (feat-ai-chat-playground):**

- 5 changesets for `@grasdouble/slm_parcel_ai-chatbot` (improve-ui, fix-auto-create, improve-ux, reorganize, move-button)
- Each changeset described an iteration step, not the final result
- **Not a mistake** — just the natural byproduct of iterative workflow

**Consolidation:**

- All 5 → 1 changeset describing the final state (AI chatbot parcel launch)
- Dropped iteration details (reorganize, move button) — changelog readers don't need the journey
- Focus: what shipped, not how it was built

**Key insight:** Never frame duplicates as "errors" with iterative workflows. Frame as "let's consolidate the story before merge."

---

## Pattern 2: Feature Atomicity — What Changes Together, Ships Together

**Anti-pattern:** Splitting related changes into separate changesets by package boundary.

**Example (feat-ai-chat-playground before consolidation):**

- `add-ai-chatbot-parcel.md` — just the parcel
- `add-ai-chat-nav-link.md` — just the nav integration
- `move-llm-to-ai-chatbot.md` — shared utilities refactor
- `implement-real-llm-providers.md` — provider logic

**These are NOT separate features.** They're all parts of **one atomic feature: launching the AI chatbot parcel.**

**Consolidation:**

```markdown
---
'@grasdouble/slm_parcel_ai-chatbot': minor
'@grasdouble/slm_parcel_header-bar': minor
'@grasdouble/slm_shared': major
'@grasdouble/slm-container': minor
---

feat: add AI chatbot parcel with browser-based LLM, conversation history, and navigation integration.
```

**Why major for shared?** Code moved from shared to ai-chatbot = breaking change for shared consumers.

**Key insight:** If you can't launch feature A without change B, they're atomic. One changeset.

---

## Pattern 3: Conservative Bump Levels

**Philosophy:** Default to patch. Minor only when user-visible. Major only when breaking.

**Heuristics:**

- **Patch** — refactors, fixes, internal improvements, reorganization, performance tweaks
- **Minor** — new components, new routes, new user-facing features, new parcels
- **Major** — removed exports, moved code between packages, changed public APIs, breaking config changes

**Edge case — code moved:**
When code moves from package A to B:

- Package A (source) = **major** (breaking for consumers importing from A)
- Package B (destination) = **minor** (new functionality available)

**Example:** LLM code moved from `@slm_shared` to `@slm_parcel_ai-chatbot`:

- `shared`: major ❌ (consumers importing LLM from shared will break)
- `ai-chatbot`: minor ✅ (new capability for ai-chatbot users)

---

## Pattern 4: Concise Descriptions — State, Not Story

**Anti-pattern:** Describing the development journey.

```markdown
chore: reorganize AI chatbot components to improve maintainability
fix: move new conversation button to sidebar for better UX
feat: improve chatbot UI with better spacing
```

**Better:** Single description of the shipped result.

```markdown
feat: add AI chatbot parcel with browser-based LLM, conversation history, and navigation integration.
```

**Heuristic:** If the description contains words like "reorganize", "move", "refactor", "improve" without context of what was built — it's describing iteration, not outcome. Rewrite as the final state.

**Users read changelogs to know WHAT shipped, not HOW it was built.**

---

## Consolidation Decision Tree

When analyzing duplicates (multiple changesets for same package):

1. **Are they part of the same atomic feature?**
   - YES → Merge into one changeset, describe the final state
   - NO → Keep separate, but verify each is truly independent

2. **Can feature A launch without change B?**
   - NO → They're atomic, merge them
   - YES → They're independent, keep separate

3. **Do the changesets describe iterations or outcomes?**
   - Iterations (reorganize, move, improve) → Merge and rewrite as outcome
   - Outcomes (different user-facing features) → Keep separate

4. **Would a changelog reader care about the distinction?**
   - NO → Merge (internal refactors, multiple UI tweaks)
   - YES → Keep separate (genuinely different features)

**When in doubt:** One file per atomic feature. Err toward consolidation.

---

## Red Flags — High-Confidence Violations

**Always flag these immediately:**

1. **Multiple changesets for identical package set** — unless proven independent features
2. **Descriptions without conventional commit prefix** — feat:, fix:, chore:, etc.
3. **Changeset missing a package that has modified files** — coverage gap
4. **Hex-style names** (e.g., `6197e9-63944d.md`) — always reject
5. **Mega-changeset bundling 5+ unrelated packages** — unless truly atomic (rare)

**Lower confidence (investigate before flagging):**

1. **Minor bump for refactor** — might be justified if user-visible surface changed
2. **Patch for new component** — might be internal-only component
3. **Two changesets same package, different features** — verify they're actually independent
