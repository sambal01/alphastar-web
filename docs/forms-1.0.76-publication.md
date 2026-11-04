# Android 1.0.76 / build 77 — medical form release

APK: `Alphastar-1.0.76-build77.apk` — 97,328,301 bytes.

SHA-256: `d3de4dca25b19159d81ebf203bc53c080cd0ef7832b5b7930cabd8e13ff0d2e6`.

The existing development/test signing certificate is unchanged. This is not a Play Store or production-signing release. Install over a compatible existing app without uninstalling or clearing data. Physical-phone installation and actual patient push delivery are not tested.

The APK includes the updated supplied SMAPE/MAPE images, matching form-only PDF layouts and flexible inline remarks. Saved vital signs are read-only for patients. Authorized staff/admin can save versioned corrections from the latest History record and notify its owning patient. Older review snapshots remain preserved. Approval/History headings and navigation are organized, and legacy SMPE labels display as SMAPE without changing canonical database keys.

Source verification: TypeScript; 1,092 mobile/backend tests; 952 working-tree desktop tests; 900 tests on the isolated desktop release. Synthetic desktop tests cover both forms’ approvals, history correction, notification ownership and exports. All four mobile/desktop PDFs were rendered and inspected for correct fields, complete values, bounds and absence of added metadata/footers/continuation pages. APK checks verified its manifest, native modules, both packaged images, exact bundled source, all 110 build inputs and existing signing certificate. Twenty-four prior local APKs and their available sidecars were restored from checksum-verified backups after regeneration of the build output.

Mobile source: `d12dad49c378b4eb2b4864b36bdd30b1ca719b16`.
Desktop source: `c2c139936271a171406777ac95bb90f57bd3a919`.
Desktop backend: `43f08e18882eb78d167dd62aa217116de36f3f1c`.
Website/download source: `cfd3a82f69795a4eb061e5d1966b13bf870097eb`.

Matching mobile backend deploy `dep-dbladvqvcj2c738gr7j0` became live November 4, 2026 at 11:32:01 (Asia/Manila). Readiness confirms both form kinds, history assessment corrections and patient saved-vital protection. Safe health/access/CORS checks passed without clinical writes; no new error logs were observed during the release check.

Before publication, the isolated website payload was checked against 60 unchanged public baseline files. Local Android-emulated touch tests downloaded every APK byte and matched the checksum, name, Android MIME type, attachment and range support; layout checks passed at four widths. Unrelated local website/Firebase, chat, queue and profile work was excluded. No desktop installer was rebuilt; restart the desktop and its backend to load source updates.

Website deploy `dep-dblaijd9el5s73cfcqm0` became live November 4, 2026 at 11:41:52 (Asia/Manila), serving the exact website/download commit above. The public custom-domain Android touch-download check passed at 11:42:35: all 97,328,301 bytes matched the signed APK checksum, with correct filename/MIME type, range support, Android logo and English/Tagalog version labels. Live website assets and checksum sidecar matched the tested release, and the matching backend’s safe access/CORS/readiness checks passed without patient/account writes.

Download: https://alphastarkasiglahan.com/downloads/Alphastar-1.0.76-build77.apk
