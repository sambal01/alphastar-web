# Chat with Us — local lifecycle update

Visitors share their name/email with consent, see the System welcome, and explicitly choose **Yes, connect me to support**. This creates the desktop Human Chat alert. Staff choose Anonymous or their verified first name and accept the chat before replying.

**End conversation** offers Helpful/Not helpful and a comment field. A rating is required; a comment is not. Ended conversations are read-only in desktop **Chats history**. Website Back, close, refresh and page exit end the guest thread; reopening creates a fresh private capability, never an email-based history lookup. An exit beacon is best effort, with a 15-second heartbeat and 90-second lease expired on backend reads/mutations as fallback.

The native pane mounts before the opening request and displays only loading until it completes. It does not flash a previous transcript or show a duplicate Clinic staff heading. Polling and staff connection preserve the visitor's draft. While Chat with Us is open, the underlying landing page is inert, scroll-locked and shielded from pointer clicks; focus stays within the chat.

The mobile counterpart uses the registered account and preserves its conversation across app exit/logout. Only explicit ending archives it; Continue returns it to Current chats in a new cycle.

Verification: `node --test test/human-chat.test.cjs` and `node test/human-chat-layout.cjs`. The browser fixture uses a local synthetic HTTP API, including real text/plain beacon requests during close/reload, blocks external requests, and checks four widths.

This is prepared with Android 1.0.66/build 67 and matching desktop/backend sources. Coordinate the rollout; a limited compatibility adapter preserves earlier first-session senders but never reopens an ended chat or accepts stale no-cycle sends after continuation. Publication evidence is recorded after deployment and download verification. See the shared mobile native-chat document for storage, authorization, timeout and rollout details.
