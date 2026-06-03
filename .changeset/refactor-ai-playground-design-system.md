---
'@grasdouble/slm_parcel_ai-playground': patch
---

refactor: complete migration to Lufa Design System with 100% DS components and semantic tokens.

**Full DS component adoption:**
- **PlaygroundInterface**: replaced custom `<div>` with `Container` + `Stack` + `Divider`, uses `Button` for generate action, added `LoadingIndicator` for model download progress
- **PromptEditor**: replaced custom `<h2>` with `<Text as="h2">`, uses `Stack` for vertical layout
- **ParametersPanel**: replaced `<h2>` with `<Text>`, uses `Stack` for parameter groups, DS `Input` for number input
- **OutputDisplay**: replaced custom buttons with DS `Button`, uses `Flex` for header layout, `Badge` for streaming status
- **PerformanceMetrics**: uses `Box` with `backgroundColor="muted"`, `Stack` for metric display
- **CapabilitiesInfo**: uses `Box` + `Badge` for status indicators (success/danger variants)
- **ModelSelector**: replaced custom `<button>` cards with clickable `<Card>`, uses `Badge` for selected state, proper keyboard handling
- **LoadingIndicator**: new component using DS `Badge`, `Box`, `Center`, `Stack`, `Text` for model download progress display

**Semantic tokens everywhere:**
- All custom CSS now uses `var(--lufa-semantic-ui-*)` tokens (background, text, border, spacing, border-radius)
- Removed all hardcoded colors (#0066cc, #ddd, #f5f5f5, #666, #00aa00, #cc0000, etc.)
- Uses proper spacing scale via semantic tokens

**Custom CSS minimized to patterns DS doesn't handle:**
- PromptEditor.module.css: textarea styling (DS has no textarea component yet)
- ParametersPanel.module.css: range input styling with accent-color (DS has no slider component)
- OutputDisplay.module.css: min-height constraint, animation with prefers-reduced-motion support
- ModelSelector.module.css: responsive grid (`repeat(auto-fill, minmax(250px, 1fr))`)
- PerformanceMetrics.module.css: responsive grid (`repeat(auto-fit, minmax(180px, 1fr))`)
- LoadingIndicator.module.css: progress bar with visible gradient fill (cyan/blue), border for visibility, respects prefers-reduced-motion

**Translation fixes:**
- Added missing `playground.loading.model` key in fr.json and en.json

All 26 tests pass, lint clean, build successful.
