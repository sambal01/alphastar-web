# Chat with Us — lifecycle and release record

## Version 1.0.73/build 74 — feedback comment restored, November 3, 2026

The end-conversation Help Bot question retains equal Like / Dislike choices and restores a labeled Comment field. Selecting a rating does not send it. **Submit feedback** saves the rating and optional trimmed comment (up to 1,000 characters), ends the current cycle through the existing endpoint, and returns to the unchanged chatbot main menu after confirmation. **Continue conversation** preserves the active chat without submitting. Both action pairs have equal dimensions; feedback stays scrollable on short screens. Polling preserves the same comment input and selection, failed saves remain retryable, and duplicate taps are blocked. English and Tagalog labels are supported.

Current staff guidance describes the built-in chat without obsolete provider wording. Saved conversations, compatibility code and historical privacy disclosures remain intact. No backend or storage change is included. See [the release record](android-release-1.0.73.md) for verification/publication evidence. Earlier version sections below are historical records.

Published November 3, 2026: website/download `b1d80c6` is live on Render `dep-dbkohuui0phs73asfgq0` at 3:11 PM Asia/Manila; mobile source `c5e403e` is pushed. The complete custom-domain Android touch download matched 1.0.73/build 74, 96,880,409 bytes and its verified SHA-256. Synthetic lifecycle, 11 selected website tests, 1,070 mobile/backend tests, TypeScript, 20 mobile layouts, isolated download, preserved footer/menu and read-only live checks passed. No real conversation or account/patient operation was used.

## Version 1.0.72/build 73 — Back, ending and feedback, November 3, 2026

Back in an active staff chat now offers Continue conversation or End conversation. Continue restores the same private guest session and unsent draft without reconnecting. End opens the S-avatar Help Bot question **Was our staff helpful?** with balanced Like / Dislike choices (also localized in Tagalog). Either choice saves its explicit up/down rating and ends the chat through the existing endpoint, then reveals the chatbot's main menu. Feedback errors remain visible and retryable instead of being cleared by polling. Duplicate taps are disabled; stale pre-mutation polls cannot reopen an ended guest session. The earlier transcript is not inserted into the bot or exposed behind feedback.

Minimize/reopen still preserves the active page-memory chat; refresh/page exit still ends website guest sessions. No name/email lookup, browser transcript persistence or backend change was added. Published with website/download source `aece260a27eab3d54f81c45a65f6bc0166ff3520`; see [the release record](android-release-1.0.72.md). Synthetic browser/component verification covers Back/Continue, both ratings, failed saves, duplicate taps, saved mobile history and responsive/keyboard-height layouts.

Verification: 10 selected website tests and the full synthetic staff-chat browser lifecycle fixture passed, alongside 1,069 mobile/backend tests, TypeScript and 20 real-component mobile layout cases. No real patient conversation or production write was used.

## Version 1.0.70/build 71 — scrolling typing row

The human-chat typing row is now the final child of the message log, instead of a fixed sibling below it. New messages are inserted before it. The transparent row scrolls away when reading earlier messages and only follows the bottom when the visitor is already there. System **S**, saved staff initials and the clinic logo keep the same 30 px bordered circle as message avatars. Existing rule-based chatbot styling is unchanged.

The synthetic native-chat browser fixture verifies circle geometry, message ordering, long-conversation scrolling, no forced jump while reading, clinic/account identities and the existing lifecycle/draft/responsive checks. The earlier complete website run passed 14/15 tests under concurrent mobile-suite CPU load; its existing timing-sensitive rule-based typing test failed a visibility-window check and passed when run on its own. The native-chat fixture passed again for the isolated 1.0.70 release payload. No live chat or backend writes were sent.

### Published checkpoint — November 3, 2026

Website/download commit `812f21ce28539b484c58f890d5e8e2b88c167d7e` is live on Render deploy `dep-dbkgsfgu01pc73agihb0`, completed at 6:27 AM Asia/Manila. Mobile source `a09cb291387b4d2f07a56c049166a5e18a258abf` is pushed; no backend, desktop, Firebase or service-configuration changes are included. One manual API deployment was used after no automatic deploy appeared following the earlier push.

The complete 6:34 AM custom-domain Android-emulated touch download matched Android 1.0.70/build 71, 96,874,785 bytes and SHA-256 `ebff398d70b8074757e9f9795b22b4bf4eb1edbe1b0e57f129b5dae5b8d299c9`. Filename/type, byte ranges, Android logo and English/Tagalog labels passed without browser errors. HTML, chat assets, download configuration, metadata and sidecar fingerprints match the tested source on both hostnames. An initial stale custom-domain configuration expired normally after its 300-second shared-cache lifetime; the final check passed without another deploy. Unrelated footer/menu/Firebase/image edits remain local. No actual conversation, patient/account operation or phone installation was performed. Install over a compatible app without uninstalling or clearing data.

## Local follow-up — draft typing presence

A visible, nonempty message draft renews its existing Boolean typing marker rather than stopping after a 1.8-second pause or input blur. Clearing/sending, feedback, Back/minimize, page hiding and exit stop it; returning to the visible draft renews it. Server expiry still clears lost/disconnected clients, without storing or sending any draft text. The synthetic browser fixture checks renewal for nine seconds and immediate clearing, alongside the existing lifecycle/layout tests. Client renewal is included in the 1.0.70 mobile/website release. A separate server-side connection-identity-lock follow-up remains local and is excluded from this deployment.

## Release follow-up — 1.0.69 / build 70

System labels display **Alphastar Support (System Message)** with an **S** avatar. The one-second support-request typing indicator uses **S**, not the clinic logo. Actual staff messages/typing keep their saved account or clinic identity. Feedback uses equal Helpful/Not helpful cards, a Comment field and balanced Keep chatting/End actions; the header End action is hidden while feedback is open. Back/minimize/refresh behavior from 1.0.68 is unchanged.

The matching backend emits protected chat path invalidations so desktop unread badges update from Dashboard without first visiting Human Chat. Bodies, identities and drafts are never sent through that stream. Synthetic browser checks verify the System identity, feedback dimensions, existing lifecycle and responsive layouts. Real patient chat and physical installation are not used for verification.

Published November 2, 2026: website/download `bb7b047` / Render `dep-dbk7qrgae00c73839ri0` is live (8:09 PM Asia/Manila), with backend `dd50758` / `dep-dbk7ogrncjis73ebialg` live (8:05 PM). Desktop `dd909f7` and backend `b3ea9e4` are pushed. At 8:10 PM, a complete Android-emulated custom-domain touch download of 1.0.69/build 70 matched 96,873,421 bytes and SHA-256 `f5814049e5b28836102a663aa5b79f3b987c2d6b51ea669fff400a8a40146cc6`. Live HTML/chat/download fingerprints, metadata/sidecar, filename/type/ranges, logo, English/Tagalog layout, backend health/access/CORS and recent error-log checks passed. Staging verified 59 prior public files and excluded unrelated local configuration/assets. No valid conversation, patient/account operation, phone installation or push delivery was performed.

## Release follow-up — 1.0.68 / build 69

Messages use compact reference-style bubbles with outside avatars, sender labels and bottom-right timestamps; System has an **S** avatar. The opening conversation and support-request acknowledgement have a one-second minimum presentation delay. Animated avatar/dots indicators show temporary typing without exposing draft text or claiming an assistant is connected.

**Back** and minimize preserve the conversation and draft in page memory. **Continue conversation** resumes that pane without creating another guest session or requesting identity again. Minimize/reopen shows only the loading state before revealing the conversation, never the old transcript behind loading. Refresh/page exit still sends the private-capability exit request and forgets the session; explicit ending still archives it. No guest capability or transcript is restored from browser storage. Heartbeats continue while the same page remains open, with the existing lease fallback for disconnected visitors.

Synthetic browser checks cover both one-second gates, Back/minimize resume, refresh ending, stable drafts, loading-only presentation and responsive widths. The underlying landing page stays scroll-locked/inert while the chat is open. Android 1.0.68/build 69 accompanies this update; publication evidence is recorded after live verification. The older Back/close behavior below remains historical release evidence, not the current client behavior.

Published November 2, 2026: website/download `012b49a` / Render `dep-dbk6ke0473hc73fpcaq0` is live (6:47 PM Asia/Manila), with backend `e46e6a1` / `dep-dbk6j8favr4c73cpi9q0` live (6:45 PM). The complete 7:05 PM Android-emulated custom-domain touch download matched all 96,873,401 bytes and SHA-256 `97a3ab492769386bac9e56842945086710576601ea55a5a4908d2267b8d04b66`. Live HTML/chat/download assets, metadata, checksum sidecar, filename/type/ranges, logo and English/Tagalog labels passed. Staging verified 59 prior public baseline assets and excluded unrelated local configuration/assets. No real conversation, patient/account operation, phone installation or actual push delivery was tested.

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
