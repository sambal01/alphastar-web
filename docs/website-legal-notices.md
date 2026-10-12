# Website legal notices

The footer links open `privacy-policy.html` and `terms-and-conditions.html`.
Both are static pages: the entire English notice and all links work without
JavaScript. The existing site language preference also controls their complete
English/Tagalog views. It remains separate from the website Help Bot language.

The 14 Privacy Policy sections and 12 Terms and Conditions sections reproduce
`../alphastar-mobile/src/lib/legalNotices.ts` exactly in English. Separate website
sections describe the public bot, browser language storage, embedded map/fonts,
external contact channels, and the difference between guidance and an app
submission. Neither these pages nor their language switch records consent or
acceptance, books a service, or looks up a patient account.

## Content maintenance

- `scripts/build-legal-pages.cjs` produces static HTML and the legal translation
  catalog from the mobile notices and `scripts/legal-tagalog.cjs`.
- `node scripts/build-legal-pages.cjs --check` verifies that committed output is
  current. The adjacent mobile repository and its installed TypeScript package
  are only needed for this local maintenance check, not for website hosting.
- `--patch` emits a JSON object containing an `apply_patch` payload. Apply that
  payload after reviewing updated source wording and Tagalog translations.
- The source fingerprint intentionally prevents an English change from silently
  publishing stale translations. Update it only after reviewing the changed
  notices, update the revision date as needed, and regenerate the static files.
- Page scripts are UI-only. Do not add patient identifiers, tokens, account
  records, or generated support drafts to the translation catalog.

## Clinic review before publication

These plain-language notices are not a certification of legal compliance.
The clinic should confirm its legal operator/privacy contact, health-data consent
process, actual provider configuration, record/log/backup retention and deletion
procedures, guardian process, and fees/cancellation practices before publication.
The app's outstanding clinic decisions remain documented in
`../alphastar-mobile/docs/patient-legal-notices.md`.

Primary references linked in the notices include the National Privacy Commission's
Data Privacy Act of 2012, Firebase's privacy information, tawk.to's Privacy Policy,
Google's Privacy Policy, and Render's Privacy Policy. Website-specific statements
were checked against the current local website implementation.
