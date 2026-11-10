---
'@mastra/memory': patch
---

Made Observational Memory cheaper on every step of a long tool-calling run. The token counter no longer hashes parts whose content has not changed since the previous count, no longer serializes and hashes plain tool results a second time just to find out they hold no images or files, and builds its estimate keys with the one-shot `crypto.hash()`. The check for unread message parts also reuses the cached identity of tool parts instead of building a new key string for each part on every step. Token estimates, persisted cache keys and which parts count as unread are unchanged. A plain tool result with a circular reference is now counted instead of throwing.
