# Medical Records — Android 1.0.77 / build 78

The download supplies completed SMAPE/MAPE cards with Complete and View / edit, consistent editor reopening and separate preserved drafts. Both forms' notifications open all submitted forms in Medical History rather than filtering to one type. Explicit View and the Back path remain separate from editing. Saved vital signs stay read-only, and clinic review statuses remain accurate. Existing form templates and form-only exports are unchanged.

APK: `Alphastar-1.0.77-build78.apk`, 97,329,021 bytes. SHA-256: `2df2a7c8a517c285fc4b1e03554852f823d895a2764d071a3835644a5eaf2c03`.

TypeScript, all 1,100 mobile/backend tests, 85 focused form/navigation/correction/keyboard checks and ten actual-card layouts passed before publication. The APK signature, manifest, required native modules, both bundled form images, exact source/sourcemap and all 110 unchanged build inputs matched. Twenty-five earlier named APKs were preserved. Read-only live backend readiness/access/CORS checks passed without patient/account writes.

The existing development/test signing certificate is retained; this is not Play Store or production-signing approval. Install over a compatible existing app without uninstalling or clearing its data. Physical installation and on-device interaction/push delivery are not tested. No desktop installer, backend, Firebase, account or patient-data changes are part of this release. Unrelated local configuration, assets and chat work are excluded.

Website staging and live publication checks are recorded below after verification.

Mobile source `b7623b1e5517af02c0cc1969a9d2b1ff6ffde81b` is pushed to GitHub master. Its skip-deploy marker deliberately leaves the existing compatible backend unchanged. The isolated website payload verified all 60 prior public assets and excluded unrelated local work. Three integrity/configuration assertions and the four-width English/Tagalog browser fixture passed. Its Android-emulated touch download retrieved all 97,329,021 bytes with matching checksum, filename, Android MIME type, attachment and range support.
