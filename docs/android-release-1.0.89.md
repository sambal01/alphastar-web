# Android 1.0.89 / build 90

Fresh APK from the current Mobile source, including the aligned Medical Form
History back arrow/title, larger back target and fitted submitted-form heading.
Also includes the school-ID review preview from 1.0.88, which was built locally
but was not the website's published download. Existing medical forms, released
records, photos, PDF export, support and legal notices are retained.

The actual APK's version, existing signing certificate, bundled sources, native
modules, PDF templates, size and SHA-256 are checked before publishing. The
download metadata and checksum sidecar identify the exact new binary. Source
comparison with build 89 changes only App.tsx and the two version metadata files.
No old named APK is removed or replaced.

Medical Form History passed 36 offline alignment layouts and its focused
navigation/component checks. TypeScript passed. The wider regression run had
120 passes and two unrelated pre-existing booking/privacy-header failures;
the same two failures were reproduced with this header change removed in memory.
No physical-phone installation or on-device performance claim is made.

Only the download HTML/configuration, verified APK/checksum, release metadata,
matching tests, staging helper and this note are published to the existing Render
website. Other local website/chat/legal edits remain unpublished. No Firebase
Hosting, backend, database/rules or storage provisioning is part of this release.
No billing or patient/account data is changed.

The existing development/testing signing certificate is retained. This is not
production signing or a Play Store release. Install over a compatible existing
app; do not uninstall or clear data to apply the update.
