# Offline Use: PWA and Android APK

## How Offline Works

Fonts are self-hosted in `fonts/` (converted to WOFF2). A service worker (`sw.js`) precaches the entire app (HTML, CSS, JS, fonts, icons, and both ambient sound files) on first load. After that first load, the app needs no network at all, including ambient sound. A web app manifest (`manifest.json`) makes it installable as a Progressive Web App.

## PWA (Works Today, In Any Browser)

Nothing to build. Serve the folder over HTTPS (or `localhost`, which browsers treat as secure for this purpose):

```bash
npm start
```

`npm start` runs `node scripts/serve.mjs` (port 8080 by default), which sends the cache headers an offline-first PWA needs: `no-store` for `sw.js` so worker updates are always noticed, and `no-cache` everywhere else.

Open in Chrome or Edge on desktop or Android and use "Install app" or "Add to Home screen." On iOS Safari, use the Share button then "Add to Home Screen."

To ship an update later, bump the `version` field in `package.json` (the service worker reads it at install time and derives its cache name from it). If that read ever fails, the worker falls back to `darya-cache-fallback`. Bumping the version tells returning visitors' browsers to fetch the new files instead of serving the old cached ones.

## Android APK

You need the Android SDK, a Java toolchain, and Node.js 22 or newer to produce a signed APK. The Capacitor 8 CLI (in `devDependencies`) requires `node >= 22`, so install or upgrade Node before running the commands below. This project provides `package.json` and `capacitor.config.json` for the wrapping step. You will need to run the commands yourself and click through Android Studio once.

Capacitor wraps the web files directly into the APK's assets, making the result fully offline.

On your Arch machine:

```bash
# One-time setup
# Android Studio is NOT in the official Arch repositories; install it
# from the AUR with an AUR helper (yay or paru):
# https://aur.archlinux.org/packages/android-studio
sudo pacman -S jdk21-openjdk
paru -S android-studio   # or: yay -S android-studio
# Capacitor 8 needs Node.js >= 22; check yours with: node -v
npm install

# Copy web assets into the committed native project
npm run android:sync

# Open in Android Studio to build, run, and sign
npm run android:open
```

The Android build bundles the web app from `www/`, a generated folder that `scripts/sync-web.sh` recreates from the project root on every `android:sync` (Capacitor 8 requires `webDir` to point at a real folder, so the root is not used directly). `www/` is gitignored; the `android/` native project is committed (see the README's Android APK Builds section), so syncing copies fresh web assets into it rather than regenerating the platform. The project root stays the single source of truth for the PWA.

From Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)** gives you a debug APK immediately. For a release APK, use **Build > Generate Signed Bundle / APK** and follow the signing wizard.

A few notes:

- **App icon.** `assets/icons/android-chrome-512x512.png` is already the right size, and `assets/icons/apple-touch-icon.png` covers iOS. Android Studio's Asset Studio can regenerate the full launcher icon set from `assets/icons/android-chrome-512x512.png`.
- **Permissions.** This app makes zero network requests once loaded. Keep the `INTERNET` permission in the committed `android/app/src/main/AndroidManifest.xml`: Capacitor's local WebView server on `https://localhost` needs it to serve the bundled assets, even though the app never dials out.
- **App size.** The web app shell (fonts included) is under 1 MB; the two ambient sound loops (ocean and beach) add about 2 MB and are bundled in `assets/audio/` so sound plays offline in both the PWA and the APK. The APK is larger due to the Capacitor/WebView shell, but still small by app standards.
