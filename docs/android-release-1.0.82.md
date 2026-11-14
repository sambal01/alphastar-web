# Android 1.0.82 / build 83

This release updates the website's Android download to `downloads/Alphastar-1.0.82-build83.apk`. Exact byte length and SHA-256 are recorded in `downloads/release.json` and the matching checksum sidecar. Both the HTML fallback and JavaScript settings must refer to this verified file, with a fresh configuration cache key.

## App changes

- Medical Forms History moves to Profile > Account.
- Keep Your Records Safe moves to the Form landing page, titled Medical Form.
- Student/Non-student options stay inside one connected dropdown; the editor no longer repeats patient type.
- White inputs fill the available width and float their labels to the top-left inside the input.
- Next, Back and Submit scroll with the form rather than staying in a sticky footer.
- Drafts, submitted forms, private photos, previous forms, PDF templates and released results remain available.

## Verification and scope

The mobile source passed 80 focused release tests, TypeScript, 10 responsive control-layout checks and an Android bundle export. Built-in form help uses the current form name and Profile > Account history path in both languages. Its broader suite has 22 failures also reproduced against unchanged source; the complete historical suite is not represented as passing. Native APK verification checks actual version, package, signature continuity, current bundled source and PDF assets before staging this download. Website payload and live-download checks are separate gates; preparing or pushing a file does not alone prove that the live website serves it.

The existing development/test signing certificate is retained; this is not Play Store or production-signing approval. Update a compatible installed app without uninstalling or clearing app data. No physical-phone installation or actual push delivery is claimed. No backend, Firebase rules, account cleanup, patient-data changes or unrelated website changes are included.
