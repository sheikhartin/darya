# Going offline: PWA and Android APK

## What changed to make this possible

Fonts were previously loaded from Google Fonts' CDN - that alone breaks
full offline use, regardless of anything else. They're now self-hosted in
`fonts/` (converted to WOFF2), and
a service worker (`sw.js`) precaches the entire app - HTML, CSS, JS,
fonts, and icons - on first load. After that first load, the app needs
no network at all: verified by loading it once, then cutting network
access entirely and confirming a full conversation still works end to
end. A web app manifest (`manifest.json`) makes it installable.

So: no, self-hosting the fonts alone wouldn't have been enough - the
service worker and manifest are what actually make it installable and
usable with zero connectivity, not just font-independent.

## PWA (works today, in any browser)

Nothing to build. Serve the folder over HTTPS (or `localhost`, which
browsers treat as secure for this purpose) and it's installable:

```bash
python3 -m http.server 8080
```

Open it in Chrome or Edge on desktop or Android and use "Install app" /
"Add to Home screen." On iOS Safari, use the Share button →
"Add to Home Screen" (iOS doesn't support the install prompt itself, but
the app still runs standalone and offline once added - that's what the
`apple-mobile-web-app-*` tags in `index.html` are for).

To ship an update later, bump `CACHE_NAME` in `sw.js` - that's what
tells returning visitors' browsers to fetch the new files instead of
continuing to serve the old cached ones.

## Android APK

This part I can prepare but can't fully finish for you: producing a
signed APK needs the Android SDK and a Java toolchain, which only exist
on your machine, not in the environment I run in. Here's the honest
division of labor: I've set up `package.json` and `capacitor.config.json`
so the wrapping step is just running commands, but you'll need to run
them yourself and click through Android Studio once.

**Capacitor** wraps the web files directly into the APK's assets, so the
result is truly offline - it doesn't rely on your earlier PWA caching at
all, it just ships the files inside the app package.

On your Arch machine:

```bash
# One-time setup
sudo pacman -S jdk17-openjdk android-studio  # or your preferred JDK/AUR package
npm install

# Add the Android platform (creates an android/ folder)
npm run android:add

# Copy the web assets into the native project
npm run android:sync

# Open in Android Studio to build/run/sign
npm run android:open
```

From Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
gives you a debug APK immediately, installable via `adb install` or
copying it to a phone. For a **release** APK to actually distribute,
Android Studio's Build menu also has a signing wizard (Build → Generate
Signed Bundle / APK) - you'll need to create a signing key the first
time, which Android Studio walks you through.

A few things worth knowing before you do:

- **App icon**: `assets/icons/icon-*.png` are already the right sizes for
  a PWA; Android Studio's Asset Studio (right-click `res/` → New → Image
  Asset) can regenerate the full launcher-icon set from
  `assets/icons/icon-maskable-512.png` if you want a proper adaptive icon
  rather than Capacitor's default.
- **Permissions**: this app makes zero network requests once loaded (no
  analytics, no external calls), so the generated `AndroidManifest.xml`
  shouldn't need the internet permission at all - Capacitor may add it by
  default; removing it is a nice, verifiable way to confirm to yourself
  that nothing's phoning home.
- **App size**: the whole web app, fonts included, is under 1 MB. The APK
  itself will be larger (the Capacitor/WebView shell adds overhead), but
  still small by app standards.
