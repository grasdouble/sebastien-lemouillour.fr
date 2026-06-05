---
'@grasdouble/slm_parcel_header-bar': minor
---

feat: add navigation link to AI Chat parcel.

Added a new navigation item in the header-bar:
- "Chat IA" / "AI Chat" → `/ai/chat` (ai-chatbot parcel)

**Changes:**
- Updated `NavBar.tsx` to include the AI Chat route in `NAV_ITEMS`
- Added translations `nav.aiChat` in both `fr.json` and `en.json`
- Navigation link appears in both desktop and mobile menu
- Active state highlighting works correctly for the new route

Users can now easily discover and access the browser-based AI chatbot directly from the main navigation.
