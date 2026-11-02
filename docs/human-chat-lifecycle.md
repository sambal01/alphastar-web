# Chat with Us — local lifecycle update

Visitors share their name/email with consent, see the System welcome, and explicitly choose **Yes, connect me to support**. This creates the desktop Human Chat alert. Staff choose Anonymous or their verified first name and accept the chat before replying.

**End conversation** offers Helpful/Not helpful and a comment field. A rating is required; a comment is not. Ended conversations are read-only in desktop **Chats history**. Website Back, close, refresh and page exit end the guest thread; reopening creates a fresh private capability, never an email-based history lookup. An exit beacon is best effort, with a 15-second heartbeat and 90-second lease expired on backend reads/mutations as fallback.

The native pane mounts before the opening request and displays only loading until it completes. It does not flash a previous transcript or show a duplicate Clinic staff heading. Polling and staff connection preserve the visitor's draft. While Chat with Us is open, the underlying landing page is inert, scroll-locked and shielded from pointer clicks; focus stays within the chat.

The mobile counterpart uses the registered account and preserves its conversation across app exit/logout. Only explicit ending archives it; Continue returns it to Current chats in a new cycle.

Verification: `node --test test/human-chat.test.cjs` and `node test/human-chat-layout.cjs`. The browser fixture uses a local synthetic HTTP API, including real text/plain beacon requests during close/reload, blocks external requests, and checks four widths.

Published with Android 1.0.66/build 67 and matching desktop/backend sources on November 2, 2026. Website commit `6f532d6` is live on Render deploy `dep-dbk2u33bc2fs73e8qq40`; mobile/backend commit `5b9bc07` is live on `dep-dbk2rkivcj2c73fiqgg0`. A limited adapter preserves earlier first-session senders but never reopens an ended chat or accepts stale no-cycle sends after continuation. At 2:36 PM Asia/Manila, the entire custom-domain APK download matched 96,867,981 bytes and SHA-256 `3e8f58e801fc874232f719a2932c7909113f437c64030367c71edf190fa00362`. The live HTML/support assets match source, and backend health, access rejection and CORS checks passed. No valid chat or patient message was sent, and no phone installation was performed. See the shared mobile native-chat document for storage, authorization and timeout details.
