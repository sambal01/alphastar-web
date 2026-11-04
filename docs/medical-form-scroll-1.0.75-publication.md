# Android 1.0.75 / build 76 — medical form section scroll

The download now supplies the mobile fix that opens Medical History at the top after Next from Patient Information. It applies to SMAPE and MAPE, preserves draft answers and does not force scroll resets while answering questions. No desktop/backend, database, Firebase rule, SDK or signing-key change is included.

Mobile source: 5d9b4d5cc306d61a8b63c4dc8a00690629a27a4a.
Website source: 2e16d41ea6052ad7eac6c908f5bf1c3f54bc8274.
Render deploy: dep-dbl13361egvs73995v1g; live November 4, 2026 at 00:54:45 Asia/Manila.

APK: downloads/Alphastar-1.0.75-build76.apk; 97,323,909 bytes.
SHA-256: 0412c7ff8e7736ead0bf590e528ea437bf913de6b48ea014bace35d00b3ad5c3.
The existing development certificate is retained. Install over a compatible existing app without uninstalling or clearing app data. This is not Play Store/production-signing approval; physical-phone installation and native on-device interaction were not tested.

TypeScript, all 1,086 mobile/backend tests, 85 targeted form/navigation/keyboard checks, APK source/manifest/signature/native-module/template verification, three staged website assertions and responsive download checks passed. The isolated payload verified the previous 60 public assets and excluded unrelated local configuration/image edits. Existing named APKs were preserved.

The custom domain briefly retained the old release metadata under its five-minute CDN cache policy. The first full download check was interrupted. After cache refresh, the actual custom-domain Android touch download passed at 08:33:27 Asia/Manila on November 4: exact full APK bytes/checksum, correct metadata, filename/type/range support, bilingual version labels and phone layout, without runtime errors. No patient records, support conversations, accounts or clinic approvals were created.
