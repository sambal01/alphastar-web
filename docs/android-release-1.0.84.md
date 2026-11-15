# Android 1.0.84 / build 85

The website download points to `downloads/Alphastar-1.0.84-build85.apk`. Its byte length, SHA-256 and signing certificate are recorded in `downloads/release.json` and the checksum sidecar. HTML, JavaScript settings and the configuration cache key match this release.

## Mobile changes

- Medical Form History and Export PDF use the requested singular and download labels.
- Android 10 and newer save PDFs directly to Downloads/AlphaStar through the native MediaStore writer. Older Android versions use a folder picker. Cancelling does not create a file; iOS retains its existing export capability.
- Attached patient photos remain in the printed 1x1 photo frame in both SMAPE and MAPE PDFs. Submitted form titles are centered.
- Personal details, guardian/emergency contact and review instructions use consistent typography. The first step is Medical & Physical Examination; action labels are Continue and Submit.
- Leaving an unfinished form offers Save draft and leave or Keep editing. Encrypted draft-save failures keep the editor open rather than silently losing changes.
- Medical Records uses the supplied folder illustration, a black heading and a simpler empty state without a white card or full-screen loading spinner. Existing selected results retain a Back action.

## Verification and scope

TypeScript and 105 focused tests passed. Actual PDF fields, photo placement and rendered pages were inspected. Five-width offline previews checked selectors, invalid fields, form headings/actions and empty states. APK inspection confirmed package/version, signature continuity, the generated source bundle, native PDF export module and examination templates. Website integrity and responsive download checks are separate publishing gates; Git push alone is not proof of deployment.

No physical phone was connected, so installation and the exact reported crash were not verified on a device. The existing development/test signing certificate is retained; this is not Play Store or production-signing approval. Install over a compatible app without uninstalling or clearing data. Drafts, photos, forms, previous forms, results and conversations are preserved. No backend, rules deployment, account cleanup or patient-data reset is included.
