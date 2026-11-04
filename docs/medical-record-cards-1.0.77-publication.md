# Medical Records — Android 1.0.77 / build 78

The download supplies completed SMAPE/MAPE cards with Complete and View / edit, consistent editor reopening and separate preserved drafts. Both forms' notifications open all submitted forms in Medical History rather than filtering to one type. Explicit View and the Back path remain separate from editing. Saved vital signs stay read-only, and clinic review statuses remain accurate. Existing form templates and form-only exports are unchanged.

APK: `Alphastar-1.0.77-build78.apk`, 97,329,021 bytes. SHA-256: `2df2a7c8a517c285fc4b1e03554852f823d895a2764d071a3835644a5eaf2c03`.

TypeScript, all 1,100 mobile/backend tests, 85 focused form/navigation/correction/keyboard checks and ten actual-card layouts passed before publication. The APK signature, manifest, required native modules, both bundled form images, exact source/sourcemap and all 110 unchanged build inputs matched. Twenty-five earlier named APKs were preserved. Read-only live backend readiness/access/CORS checks passed without patient/account writes.

The existing development/test signing certificate is retained; this is not Play Store or production-signing approval. Install over a compatible existing app without uninstalling or clearing its data. Physical installation and on-device interaction/push delivery are not tested. No desktop installer, backend, Firebase, account or patient-data changes are part of this release. Unrelated local configuration, assets and chat work are excluded.

Website staging and live publication checks are recorded below after verification.

Mobile source `b7623b1e5517af02c0cc1969a9d2b1ff6ffde81b` is pushed to GitHub master. Its skip-deploy marker deliberately leaves the existing compatible backend unchanged. The isolated website payload verified all 60 prior public assets and excluded unrelated local work. Three integrity/configuration assertions and the four-width English/Tagalog browser fixture passed. Its Android-emulated touch download retrieved all 97,329,021 bytes with matching checksum, filename, Android MIME type, attachment and range support.

Website source `ae6d1b44b3c5315e0f6ffe09924f219b33a632c5` became live on Render deploy `dep-dbll65om7kps73bs86s0` on November 4, 2026 at 23:46:31 Asia/Manila (`2026-11-04T15:46:31.137Z`). No automatic deployment or event appeared after the successful GitHub push, so one explicit deployment of the existing website service was triggered; no service settings changed. The backend remains on the previously deployed compatible `d12dad49c378b4eb2b4864b36bdd30b1ca719b16`.

The full public custom-domain Android-emulated touch download passed at 23:47:23 Asia/Manila (`2026-11-04T15:47:23.697Z`). It retrieved exactly 97,329,021 bytes with the expected SHA-256 and filename. Public release metadata, Android MIME type, range support, logo, English/Tagalog version labels, phone layout and runtime-error checks passed. Live website/chat/download source and checksum sidecar matched the tested release. Safe backend readiness, rejected-access and CORS checks passed without patient/account writes. No physical installation or actual push delivery was performed.

Download: https://alphastarkasiglahan.com/downloads/Alphastar-1.0.77-build78.apk
