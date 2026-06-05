---
'@grasdouble/slm_parcel_ai-chatbot': patch
---

fix: automatically send message when creating first conversation.

Before: users had to manually click "New conversation" before sending their first message, and the typed message would be lost.

Now: when a user selects a model and sends a message without an active conversation, a new conversation is automatically created and the message is sent immediately.

Implementation: uses a `useRef` to store the pending message during conversation creation, avoiding cascading renders while ensuring the message is auto-sent once the conversation exists.
