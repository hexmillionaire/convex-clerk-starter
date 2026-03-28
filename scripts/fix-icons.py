#!/usr/bin/env python3
"""
Regenerate macOS and apple-touch icons from the 1024x1024 source.
- macOS icons: flatten onto peach bg so they fill edge-to-edge (macOS applies its own superellipse mask)
- Apple touch icons: same treatment (iOS applies its own rounded-rect mask)
- Android chrome icons: same treatment for consistency
"""
from PIL import Image

PACK = "public/icons/favicon_pack"
BG_COLOR = (255, 231, 203)  # peach background sampled from icon

src = Image.open(f"{PACK}/macos-1024x1024.png").convert("RGBA")

# Create full-bleed version: fill transparent areas with bg color
bg = Image.new("RGBA", src.size, (*BG_COLOR, 255))
bg.paste(src, (0, 0), src)
full = bg.convert("RGB")

# macOS icons
for size in [256, 512, 1024]:
    out = full.resize((size, size), Image.LANCZOS)
    path = f"{PACK}/macos-{size}x{size}.png"
    out.save(path, "PNG")
    print(f"Saved {path}")

# Apple touch icons
for size in [120, 152, 167, 180]:
    out = full.resize((size, size), Image.LANCZOS)
    path = f"{PACK}/apple-touch-icon-{size}x{size}.png"
    out.save(path, "PNG")
    print(f"Saved {path}")

# Android chrome icons
for size in [192, 512]:
    out = full.resize((size, size), Image.LANCZOS)
    path = f"{PACK}/android-chrome-{size}x{size}.png"
    out.save(path, "PNG")
    print(f"Saved {path}")

# General purpose PWA icons (used in manifest.json fallback)
for size in [192, 512]:
    out = full.resize((size, size), Image.LANCZOS)
    path = f"public/icons/icon-{size}.png"
    out.save(path, "PNG")
    print(f"Saved {path}")

# Favicons (keep transparency for browser tabs - they handle it fine)
# But regenerate from source for quality
src_rgba = src.copy()
for size in [16, 32, 48, 64, 128, 256]:
    out = full.resize((size, size), Image.LANCZOS)
    path = f"{PACK}/favicon-{size}x{size}.png"
    out.save(path, "PNG")
    print(f"Saved {path}")

# Windows tile icons
for size in [70, 150, 310]:
    out = full.resize((size, size), Image.LANCZOS)
    path = f"{PACK}/mstile-{size}x{size}.png"
    out.save(path, "PNG")
    print(f"Saved {path}")

print("\nAll icons regenerated!")
