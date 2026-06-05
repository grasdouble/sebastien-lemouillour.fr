---
'@grasdouble/slm_parcel_ai-chatbot': minor
---

feat: improve chatbot visual clarity and add markdown support.

Major UX improvements to make conversations clearer and more readable:

**Markdown support for LLM responses:**
- Added full Markdown parsing with `react-markdown` for assistant messages
- Code blocks now have syntax highlighting via `rehype-highlight`
- Inline code has distinct background and border
- Support for lists, headings, blockquotes, and tables
- User messages remain plain text for simplicity

**Improved message distinction:**
- Messages now have distinct alternating backgrounds with clear borders
- User messages: white background
- Assistant messages: secondary (gray) background
- Each message row has subtle border separator
- Avatar badges with border and background for better visibility
- Constrained message width (48rem max) centered for readability

**Optimized sidebar:**
- Reduced width from 280px to 240px (more space for conversations)
- Smaller font sizes and tighter spacing for conversation cards
- More compact padding throughout
- Better visual hierarchy

**Visual polish:**
- Input area now constrained to match message width
- Border on main area to clearly delimit conversation space
- Better use of design system colors (border-default instead of border-subtle)
- Improved responsive behavior on mobile

**Dependencies added:**
- `react-markdown`: Markdown parsing
- `remark-gfm`: GitHub Flavored Markdown support
- `rehype-highlight`: Syntax highlighting for code blocks
- `highlight.js`: Syntax highlighting themes

All 32 tests passing, full TypeScript and ESLint compliance.
