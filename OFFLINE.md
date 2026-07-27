# Offline Use: PWA and Android APK

## How Offline Works

Fonts are self-hosted in `fonts/` (converted to WOFF2). A service worker (`sw.js`) precaches the entire app (HTML, CSS, JS, fonts, and icons) on first load. After that first load, the app needs no network at all. A web app manifest (`manifest.json`) makes it installable as a Progressive Web App.

## PWA (Works Today, In Any Browser)

Nothing to build. Serve the folder over HTTPS (or `localhost`, which browsers treat as secure for this purpose):

```bash
python3 -m http.server 8080
```

Open in Chrome or Edge on desktop or Android and use "Install app" or "Add to Home screen." On iOS Safari, use the Share button then "Add to Home Screen."

To ship an update later, bump `CACHE_NAME` in `sw.js`. This tells returning visitors' browsers to fetch the new files instead of serving the old cached ones.

## Android APK

You need the Android SDK and a Java toolchain to produce a signed APK. This project provides `package.json` and `capacitor.config.json` for the wrapping step. You will need to run the commands yourself and click through Android Studio once.

Capacitor wraps the web files directly into the APK's assets, making the result fully offline.

On your Arch machine:

```bash
# One-time setup
sudo pacman -S jdk17-openjdk android-studio
npm install

# Add the Android platform
npm run android:add

# Copy web assets into the native project
npm run android:sync

# Open in Android Studio to build, run, and sign
npm run android:open
```

From Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)** gives you a debug APK immediately. For a release APK, use **Build > Generate Signed Bundle / APK** and follow the signing wizard.

A few notes:

- **App icon.** `assets/icons/icon-*.png` are already the right sizes. Android Studio's Asset Studio can regenerate the full launcher icon set from `assets/icons/icon-maskable-512.png`.
- **Permissions.** This app makes zero network requests once loaded. You can remove the internet permission from the generated `AndroidManifest.xml` to confirm nothing phones home.
- **App size.** The whole web app (fonts included) is under 1 MB. The APK will be larger due to the Capacitor/WebView shell, but still small by app standards.
