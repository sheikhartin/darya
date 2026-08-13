#!/usr/bin/env python3
"""Regenerate the Android launcher icons from the project's source artwork.

This is the project's own deterministic replacement for the stock Capacitor
launcher icons that `cap add android` drops in. Those default icons are
never replaced by `npx cap sync`, which only copies the web bundle into the
platform, so without running this the shipped APK keeps the black-and-white
Capacitor logo instead of the Darya artwork.

The source image (a full-bleed square) is rendered into every density that
the Android res tree expects:

  * ic_launcher.png          - the legacy square icon, shown on Android < 8
                               and used as the fallback elsewhere. The full
                               source is scaled to the mipmap size.
  * ic_launcher_round.png    - the legacy round icon, the source cropped to
                               a circle so older launchers that opt into the
                               round slot render a proper disc.
  * ic_launcher_foreground.png - the adaptive-icon foreground layer (API 26+).
                               The artwork is scaled into the central safe
                               zone so the launcher's mask never clips the
                               design's edges.
  * ic_launcher_background.png - the adaptive-icon background layer, a solid
                               fill matching the source's corner colour.

It also rewrites the adaptive-icon XML in mipmap-anydpi-v26 and the
ic_launcher_background colour value, so everything stays in sync.

Run from the repository root:  python3 scripts/generate-android-icons.py
"""

import argparse
import os
import sys

from PIL import Image, ImageDraw

# Res tree layout: <android>/app/src/main/res/<mipmap>-<density>/
ANDROID_RES = os.path.join("android", "app", "src", "main", "res")

# Density -> (legacy/round px, adaptive px) for the mdpi..xxxhdpi buckets.
# Legacy and round use the launcher-icon sizes; foreground and background
# layers use the larger 108dp adaptive-canvas sizes.
DENSITIES = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}

# Fraction of the adaptive canvas the source is scaled to before being
# centred. The adaptive safe zone is the inner ~66% of the canvas; scaling
# the artwork to this fraction keeps the widest part of the design inside
# it so no launcher mask clips the edges.
FOREGROUND_SCALE = 0.68

# Adaptive-icon XML written into mipmap-anydpi-v26. The foreground is
# already pre-positioned in the safe zone, so no extra inset is needed.
ADAPTIVE_XML = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""


def corner_colour(source: Image.Image) -> tuple:
    """Return the corner colour of the source, used for the navy backdrop."""
    return tuple(source.getpixel((2, 2)))[:3]


def make_round(image: Image.Image) -> Image.Image:
    """Crop an image to a circle (transparent corners) via an alpha mask."""
    size = image.width
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    result = image.copy()
    result.putalpha(mask)
    return result


def make_foreground(source: Image.Image, size: int) -> Image.Image:
    """Scale the artwork into the adaptive safe zone of a size x size canvas."""
    target = int(size * FOREGROUND_SCALE)
    art = source.resize((target, target), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = (size - target) // 2
    canvas.alpha_composite(art, (offset, offset))
    return canvas


def make_solid(size: int, colour: tuple) -> Image.Image:
    """Build a solid colour background layer for the adaptive icon."""
    return Image.new("RGBA", (size, size), colour + (255,))


def main() -> int:
    parser = argparse.ArgumentParser(description="Regenerate Android launcher icons.")
    parser.add_argument(
        "--source",
        default=os.path.join("assets", "icons", "android-chrome-512x512.png"),
        help="Source square artwork (default: assets/icons/android-chrome-512x512.png)",
    )
    parser.add_argument(
        "--res",
        default=ANDROID_RES,
        help="Path to the Android res directory (default: %(default)s)",
    )
    args = parser.parse_args()

    if not os.path.exists(args.source):
        print(f"error: source artwork not found at {args.source}", file=sys.stderr)
        return 1

    source = Image.open(args.source).convert("RGBA")
    background = corner_colour(source)
    background_hex = "#{:02X}{:02X}{:02X}".format(*background)
    print(f"source:        {args.source}")
    print(f"background:    {background_hex}  (adaptive layer + colour value)")

    anydpi = os.path.join(args.res, "mipmap-anydpi-v26")
    os.makedirs(anydpi, exist_ok=True)

    for density, (legacy_size, adaptive_size) in DENSITIES.items():
        mipmap_dir = os.path.join(args.res, f"mipmap-{density}")
        os.makedirs(mipmap_dir, exist_ok=True)

        legacy = source.resize((legacy_size, legacy_size), Image.LANCZOS)
        round_icon = make_round(legacy)
        foreground = make_foreground(source, adaptive_size)
        background_layer = make_solid(adaptive_size, background)

        legacy.save(os.path.join(mipmap_dir, "ic_launcher.png"))
        round_icon.save(os.path.join(mipmap_dir, "ic_launcher_round.png"))
        foreground.save(os.path.join(mipmap_dir, "ic_launcher_foreground.png"))
        background_layer.save(os.path.join(mipmap_dir, "ic_launcher_background.png"))

        print(f"  mipmap-{density}: ic_launcher {legacy_size}x{legacy_size}, "
              f"adaptive {adaptive_size}x{adaptive_size}")

    # Adaptive-icon definitions consumed by API 26+ launchers.
    with open(os.path.join(anydpi, "ic_launcher.xml"), "w") as fh:
        fh.write(ADAPTIVE_XML)
    with open(os.path.join(anydpi, "ic_launcher_round.xml"), "w") as fh:
        fh.write(ADAPTIVE_XML)

    # The colour resource used by the adaptive background reference.
    values_dir = os.path.join(args.res, "values")
    os.makedirs(values_dir, exist_ok=True)
    with open(os.path.join(values_dir, "ic_launcher_background.xml"), "w") as fh:
        fh.write('<?xml version="1.0" encoding="utf-8"?>\n'
                 "<resources>\n"
                 f'    <color name="ic_launcher_background">{background_hex}</color>\n'
                 "</resources>\n")

    print("adaptive XML + colour value updated in mipmap-anydpi-v26 and values/")
    print("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
