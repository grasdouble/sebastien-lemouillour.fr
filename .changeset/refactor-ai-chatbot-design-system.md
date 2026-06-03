---
'@grasdouble/slm_parcel_ai-chatbot': patch
'@grasdouble/slm-container': patch
---

refactor: complete migration to Lufa Design System with 100% DS components and semantic tokens.

**Full DS component adoption:**
- **ModelSelector**: replaced custom `<button>` with `<Card>` clickable, uses `Badge` for model metadata
- **ChatInterface**: uses `Container` + `Divider` instead of hardcoded borders, removed all inline styles
- **MessageList**: uses `Badge` for user/assistant labels instead of plain text
- **MessageInput**: wrapped in `Box` with proper padding, uses `Button` size="lg"
- **LoadingIndicator**: uses `Center` + `Badge` with dynamic variants (info/warning/danger) for status
- **CapabilitiesWarning**: uses `Badge` for visual emphasis instead of emoji

**Semantic tokens everywhere:**
- All custom CSS now uses `var(--lufa-semantic-ui-*)` tokens (background, text, border, spacing, border-radius)
- Removed all hardcoded colors (#fff, #1976d2, #e0e0e0, #ff9800, etc.)
- Uses proper spacing scale (tight/compact/default/comfortable/spacious)

**Custom CSS minimized to patterns DS doesn't handle:**
- ModelSelector.module.css: responsive grid (`repeat(auto-fill, minmax(250px, 1fr))`)
- MessageList.module.css: message bubble alignment (user right, assistant left, max-width 80%)
- MessageInput.module.css: textarea sizing and focus states (DS has no textarea component yet)
- LoadingIndicator.module.css: progress bar with visible gradient fill (cyan/blue), border for visibility, respects prefers-reduced-motion

**Container-level fix:**
- Added `import '@grasdouble/lufa_design-system/style.css'` in slm-container/src/main.ts to load DS CSS in dev mode (production uses CDN via index.html)

All 19 tests pass, lint clean, build successful.
