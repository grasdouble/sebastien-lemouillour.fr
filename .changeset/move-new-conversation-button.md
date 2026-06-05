---
'@grasdouble/slm_parcel_ai-chatbot': patch
---

chore: move "New conversation" button to footer and reduce size.

Before: button was in header with primary style and medium size, taking prominent space at the top.

Now: button is at the bottom after the conversation list with secondary style and small size, making the conversation list more prominent and freeing up vertical space.

Visual changes:
- Button moved from header to footer
- Size reduced: md → sm
- Style changed: primary → secondary
- Added "+" prefix icon for compact visual
- Footer has border-top instead of header border-bottom
