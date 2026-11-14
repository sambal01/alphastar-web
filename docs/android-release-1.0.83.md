# Android 1.0.83 / build 84

The website's Android download points to `downloads/Alphastar-1.0.83-build84.apk`. Its exact byte length, SHA-256 and signing certificate are recorded in `downloads/release.json` and the checksum sidecar. HTML fallback, JavaScript settings and a fresh configuration cache key must match this identity.

## Mobile changes

- Save/PDF validates a private PDF, opens the Android save/share chooser, and keeps the file available while the reader or print service uses it. Direct printing remains a fallback. The previous immediate-deletion race is removed.
- Student/Non-student, Sex, Civil Status and Relation to You use connected selectors that overlay the form without moving the original box or fields below.
- Teal step headings display Patient Information, Medical History and Review & Submit. Yes/No guidance appears below the medical-history prompt.
- MAPE Requested By is optional. Item 26 is optional Remarks in SMAPE and optional Last Menstrual Period in MAPE. Saved remarks and staff-entered measurements remain separate; exported PDFs show the correct fields.
- Validation messages no longer paint white strips outside the input border. The previous cropped privacy banner returns below Next.
- Medical Records uses the form's mint-and-teal styling, displays released results without SMAPE/MAPE application cards, and explains where to complete patient information when no results are available. Submission confirmation explains pending review.

## Verification and scope

The mobile source passed TypeScript and 95 focused form, history, draft, PDF and version tests. Five-width offline visual checks passed for 20 selector layouts, 10 invalid-field layouts and five Medical Records empty states. Actual clinic-PDF fields, widget appearances and A4 renders were inspected. Offline selector previews use a browser portal stand-in, not a native-device test. APK inspection verifies the actual package/version, source bundle, PDF assets and unchanged signing certificate before staging. Website integrity, responsive download checks and public live-download verification are separate gates; a Git push alone is not proof of deployment.

No physical phone was connected, so the user's exact crash and in-place installation were not reproduced. The existing development/test signing certificate is retained; this is not Play Store or production-signing approval. Install over a compatible app without uninstalling or clearing data. Existing drafts, photos, forms, previous forms, results and conversations are preserved. No backend, database-rule deployment, account cleanup or stored patient-data changes are included.
