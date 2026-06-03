---
'@grasdouble/slm_parcel_header-bar': minor
---

feat: add navigation links to AI parcels.

Added two new navigation items in the header-bar:
- "Chat IA" / "AI Chat" → `/ai/chat` (ai-chatbot parcel)
- "IA Playground" / "AI Playground" → `/ai/playground` (ai-playground parcel)

**Changes:**
- Updated `NavBar.tsx` to include the new routes in `NAV_ITEMS`
- Added translations in both `fr.json` and `en.json`
- Navigation links appear in both desktop and mobile menu
- Active state highlighting works correctly for the new routes

Users can now easily discover and access the browser-based LLM features directly from the main navigation.
