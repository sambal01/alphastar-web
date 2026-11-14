# Android 1.0.81 / build 82

This release publishes the verified Android APK and matching website staff-chat changes.

## Download identity

- File: `downloads/Alphastar-1.0.81-build82.apk`
- Package: `com.alphastar.mobile`
- Bytes: `98511653` (98.5 MB)
- SHA-256: `bafc0ba0e836331d78145971357d4d367faae2a2c63f1a1d78f65f0629abaa71`
- Signing certificate SHA-256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`

The existing development/test signing certificate is retained, not replaced. This is not Play Store or production-signing approval. Install over a compatible existing app; do not uninstall or clear app data.

## Included changes

- SMAPE and MAPE exports use the supplied PDF templates, with mapped patient fields and an optional square form photo.
- Medical Info Form selects Student (SMAPE) or Non-student (MAPE); Medical Records History is accessible in the Records workspace.
- Patient-entered vital signs remain disabled; authorized clinic personnel handle measurements.
- Staff-chat feedback remains inline with the transcript, and rating/comment are optional.
- The website download metadata and visible label refer to this exact APK; matching chat assets have versioned cache keys.
- The matching private medical-form backend was published separately and verified through its readiness response.

## Verification and limitations

The native release build completed successfully. The release verifier confirmed manifest version/build/package, unchanged snapshotted source, matching packaged JavaScript, required native modules, both PDF assets, APK signature, and continuity with the previous signing certificate. Source, backend, and browser checks accompany this release; public-download verification is recorded separately after website deployment.

No patient data is reset, no Firebase rules are deployed, and no physical-phone installation or actual patient push delivery is claimed. Unrelated worktree files are not part of this release.
