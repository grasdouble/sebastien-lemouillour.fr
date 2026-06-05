---
'@grasdouble/slm_parcel_ai-chatbot': minor
---

feat: redesign chatbot interface with ChatGPT-style layout.

The chatbot interface has been completely redesigned to provide a cleaner, more modern experience inspired by ChatGPT:

**Layout improvements:**
- Sidebar now displays both conversation history AND model selector (no more cluttered main area)
- Messages fill the main area with full-width alternating backgrounds (user vs assistant)
- Input area fixed at the bottom with clean border
- Removed capabilities info from main area (moved to sidebar warnings only)
- Better responsive behavior on mobile devices

**Empty state improvements:**
- When no model selected: clear message "Select a model from the sidebar to get started"
- When model ready: welcoming "How can I help you today?" with example prompt cards
- Three example cards: Creative, Explain, and Code use cases
- Hover effects on example cards for better interactivity

**Message design:**
- Full-width message rows with alternating backgrounds (transparent for user, secondary for assistant)
- Avatar emojis (👤 for user, 🤖 for assistant)
- Centered content with max-width for readability
- Removed Card components for cleaner, ChatGPT-like message bubbles
- Better typography and spacing

**Visual polish:**
- Sidebar background uses secondary color with subtle border
- Fixed heights prevent layout shift during conversation
- Smooth scrolling in message area
- Better color contrast and visual hierarchy

All changes follow TDD approach — 32 tests passing including updated tests for the new empty states and message layout.
