# Installed Fire TV and phone cooking

For an AWS build, use the CloudFront `Origin` output with the existing `-ApiOrigin`
parameter as shown in [AWS deployment](AWS-DEPLOYMENT.md#fire-tv-apk-and-device-acceptance).
Keep the Cloudflare origin until AWS smoke and physical-device checks pass.

## Build status — October 10, 2026

- TypeScript check, all 18 TV tests, and scrolling regression checks passed.
- Android JavaScript/Hermes export passed with 187 bundled assets.
- Full APK rebuild succeeded after freeing disk space and using `-GradleCache 'D:\cf-gradle'` to resolve Windows dependency path-length limits. Release lint passed.
- Output: `tv/artifacts/Crave-Frame-Fire-TV.apk` (82.5 MiB), package `com.supperandscene.tv`, version 1.0.0 / code 1, minimum Android API 24, ARM64 and ARMv7.
- APK signature verification passed (v2); TV launcher entry verified. This remains a locally debug-signed demo build, not an Appstore release.
- SHA-256: `88A7B24C1585EC7845BAFE247C2C2388212DB0FCC22412CBA74E599D4A879DD1`.
- No device was connected to ADB. Device installation, remote-only navigation, and physical phone/TV synchronization remain unverified.
- These changes are local; the hosted phone frontend and GitHub repository were not published in this pass.

The Android project in `tv/android` targets **Fire OS / Android TV**. It does not run on Vega OS. Confirm the device model and OS in Settings → My Fire TV (or Device & Software) → About before installing. The TV and phone share a hosted HTTPS backend; the phone does not need an installed application.

## Build on Windows

Install TV dependencies with `npm ci` in `tv/`. Set `JAVA_HOME` and `ANDROID_HOME` to a compatible JDK and Android SDK. Then run from `tv/`:

```powershell
./scripts/build-tv.ps1 -ApiOrigin 'https://screen-to-supper-storyboard.sagitta107.chatgpt.site'
```

On Windows, use a short build-cache path to avoid the compiler's 260-character dependency path limit, for example `-GradleCache 'D:\cf-gradle'`. This also keeps large downloaded dependencies off the system drive. The drive must be available during the build.

Alternatively pass `-ToolRoot` pointing to a folder containing `java/<jdk-directory>` and `android-sdk`. The default builds at the actual checkout path. The optional `-UseShortPath` temporarily maps a free R: drive and removes its own mapping afterward, but can fail when dependency resolution mixes actual and mapped drive roots. Prefer the default or a checkout at a shorter actual path.

Output: `tv/artifacts/Crave-Frame-Fire-TV.apk`. The helper creates an ignored local debug signing key if missing. This is a demo APK, not an Appstore-signed release. Keep the same signing key for future upgrades. The backend origin is public configuration, not a credential. A custom deployment must serve both `/api/` and the phone `/tv/` frontend.

## Install on a confirmed Fire OS device

Enable ADB debugging on the device, then use the Android SDK platform tools from Windows on the same trusted network:

```powershell
adb connect DEVICE_IP:5555
adb install -r ./artifacts/Crave-Frame-Fire-TV.apk
```

Approve the computer's debugging connection on the television. Open Crave Frame from the device's apps. These instructions do not apply to Vega devices.

## Acceptance walkthrough

1. Cold launch without Metro or a development computer serving the UI. Check the app icon, landscape layout, and readable text at couch distance.
2. Use only Up/Down/Left/Right, Select, and Back to choose a title, review a pairing, and save an evening. Check focus remains visible throughout.
3. Open phone cooking and scan the QR. Confirm the phone receives the same meal, people count, and instructions without the intro.
4. Advance a cooking step on the phone; check the TV updates. Normal polling waits five seconds after each completed request.
5. Apply a delay and confirm both devices show the revised schedule. Back closes an open delay/order panel before leaving the evening.
6. Background and reopen each app/page. Progress refreshes immediately on return. Slow requests must not overlap or overwrite a local change.
7. Disconnect the network, restore it, and confirm synchronization recovers. Revoke the phone link and confirm it no longer allows edits.
8. Test Back at the root, re-entry, scrolling to the final control, and QR dialog dismissal on the physical remote.

The automated sync tests cover overlapping requests, stale reads after local writes, unmounted sessions, background/resume, and reconnect after an error. They do not certify physical remote navigation, QR scanning, or hardware installation. Browser and installed app sessions have separate household identities unless explicitly connected; existing Silk plans are not automatically imported into a fresh installation.
