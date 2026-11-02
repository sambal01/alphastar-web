# Chat with Us — local lifecycle update

## Release follow-up — 1.0.67 / build 68

Chat now shows first-name message labels, **Me** for the visitor's avatar, staff full-name initials or the clinic logo according to the assigned assistant's saved identity, and relative message times with full Philippine timestamp tooltips. Two-second polling shows staff typing without replacing the textarea or draft. Visitor typing is throttled and stops on idle, blur, send, close and backgrounding; no typed draft content is transmitted. Server-side indicators expire after eight seconds and do not create notifications or unread events. Desktop receives one alert per conversation, with subsequent messages represented by a per-patient unread dot.

Synthetic browser tests verify both indicator directions, initials/logo identities, relative/absolute times and stable drafts at four widths. This release accompanies Android 1.0.67/build 68 and the matching backend/desktop source. See the shared native-chat document for final live rollout verification; no real conversation is sent during testing.

Published November 2, 2026: website/download `1e501bd` is live on Render `dep-dbk4tluc6qcc73dhug0g` (4:51 PM Asia/Manila), and backend `38033f3` is live on `dep-dbk4sgnb9u1s73cc0n0g`. At 4:52 PM, a complete custom-domain Android-emulated touch download of 1.0.67/build 68 matched 96,872,677 bytes and SHA-256 `7720a1fec20843257ec736cf42516340740834cfeebce8590ed5d7d4c21daf08`. Live HTML/support assets, filename/type/ranges, logo, bilingual version labels and checksum sidecar passed. Staging verified 59 previous public assets and excluded unrelated local configuration/assets. No sign-in, valid conversation, patient record or actual app installation was performed.

Visitors share their name/email with consent, see the System welcome, and explicitly choose **Yes, connect me to support**. This creates the desktop Human Chat alert. Staff choose Anonymous or their verified first name and accept the chat before replying.

**End conversation** offers Helpful/Not helpful and a comment field. A rating is required; a comment is not. Ended conversations are read-only in desktop **Chats history**. Website Back, close, refresh and page exit end the guest thread; reopening creates a fresh private capability, never an email-based history lookup. An exit beacon is best effort, with a 15-second heartbeat and 90-second lease expired on backend reads/mutations as fallback.

The native pane mounts before the opening request and displays only loading until it completes. It does not flash a previous transcript or show a duplicate Clinic staff heading. Polling and staff connection preserve the visitor's draft. While Chat with Us is open, the underlying landing page is inert, scroll-locked and shielded from pointer clicks; focus stays within the chat.

The mobile counterpart uses the registered account and preserves its conversation across app exit/logout. Only explicit ending archives it; Continue returns it to Current chats in a new cycle.

Verification: `node --test test/human-chat.test.cjs` and `node test/human-chat-layout.cjs`. The browser fixture uses a local synthetic HTTP API, including real text/plain beacon requests during close/reload, blocks external requests, and checks four widths.

Published with Android 1.0.66/build 67 and matching desktop/backend sources on November 2, 2026. Website commit `6f532d6` is live on Render deploy `dep-dbk2u33bc2fs73e8qq40`; mobile/backend commit `5b9bc07` is live on `dep-dbk2rkivcj2c73fiqgg0`. A limited adapter preserves earlier first-session senders but never reopens an ended chat or accepts stale no-cycle sends after continuation. At 2:36 PM Asia/Manila, the entire custom-domain APK download matched 96,867,981 bytes and SHA-256 `3e8f58e801fc874232f719a2932c7909113f437c64030367c71edf190fa00362`. The live HTML/support assets match source, and backend health, access rejection and CORS checks passed. No valid chat or patient message was sent, and no phone installation was performed. See the shared mobile native-chat document for storage, authorization and timeout details.
