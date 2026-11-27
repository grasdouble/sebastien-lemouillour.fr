---
'@grasdouble/slm-container': major
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm-vendors': major
---

feat: remove the AI chat from the portfolio.

Remove the `/ai/chat` route, its menu and sitemap entries, and the chat parcel. The shared vendor bundle no longer exports the Markdown, highlighting, sanitization, or highlight theme assets used only by the chat.
