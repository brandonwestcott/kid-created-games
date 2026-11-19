#!/usr/bin/env python3
"""
Copy one asset into a game folder, optionally shrinking/converting it, and print the
relative path to use in the game's code.  This is THE way to get an asset into a game:
games must never reference assets/ directly (it is gitignored and not deployed).

    python3 -I assets/_tools/use-asset.py <asset> <game-dir> [--name NAME] [--max PX] [--jpg] [--quality Q]

  <asset>     path relative to assets/ (as printed in catalog.tsv), or any real path
  <game-dir>  the game folder, e.g. class-math-game ; the file lands in <game-dir>/assets/
  --name      friendly file name without extension (default: the asset's own name)
  --max PX    shrink so the longest side is at most PX (never enlarges)
  --jpg       save as JPEG (use for opaque backgrounds; not for anything with transparency)
  --quality   JPEG quality, default 82

Examples
  use-asset.py backgrounds/castle/background_12.png class-math-game --name bg-castle --max 1920 --jpg
  use-asset.py low-poly-icons/fruits/apple.png class-math-game --max 128
  use-asset.py "kennys/Audio/Interface Sounds/Audio/confirmation_001.mp3" class-math-game --name correct
  use-asset.py parallax-pack/sky/clouds.png my-game      # copies clouds.json atlas too

If the asset is a sprite sheet with a sibling .json atlas, the atlas is copied too (renamed to
match, with meta.image updated). Shrinking a sheet with --max also rescales its atlas frames.
"""
import argparse, json, os, shutil, sys

ASSETS = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO = os.path.dirname(ASSETS)

ap = argparse.ArgumentParser()
ap.add_argument("asset"); ap.add_argument("game")
ap.add_argument("--name"); ap.add_argument("--max", type=int)
ap.add_argument("--jpg", action="store_true"); ap.add_argument("--quality", type=int, default=82)
a = ap.parse_args()

src = a.asset
for cand in (src, os.path.join(ASSETS, src), os.path.join(ASSETS, src.removeprefix("assets/"))):
    if os.path.isfile(cand): src = cand; break
else:
    sys.exit(f"not found: {a.asset}  (try: grep -i <word> assets/catalog.tsv)")

game = a.game if os.path.isdir(a.game) else os.path.join(REPO, a.game)
if not os.path.isdir(game): sys.exit(f"game folder not found: {a.game}")
dst_dir = os.path.join(game, "assets"); os.makedirs(dst_dir, exist_ok=True)

stem, ext = os.path.splitext(os.path.basename(src))
name = a.name or stem
ext = ".jpg" if a.jpg else ext.lower()
dst = os.path.join(dst_dir, name + ext)
scale = 1.0

if ext in (".png", ".jpg", ".jpeg", ".webp") and (a.max or a.jpg):
    from PIL import Image
    im = Image.open(src)
    if a.max and max(im.size) > a.max:
        scale = a.max / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    if a.jpg:
        im.convert("RGB").save(dst, quality=a.quality, optimize=True, progressive=True)
    else:
        im.save(dst, optimize=True)
else:
    shutil.copyfile(src, dst)

atlas = os.path.splitext(src)[0] + ".json"
if os.path.isfile(atlas) and ext == ".png":
    j = json.load(open(atlas))
    j.setdefault("meta", {})["image"] = os.path.basename(dst)
    if scale != 1.0:
        if "size" in j["meta"]: j["meta"]["size"] = {k: round(v * scale) for k, v in j["meta"]["size"].items()}
        for fr in j.get("frames", {}).values():
            for key in ("frame", "spriteSourceSize", "sourceSize"):
                if key in fr: fr[key] = {k: round(v * scale) for k, v in fr[key].items()}
    json.dump(j, open(os.path.join(dst_dir, name + ".json"), "w"), indent=1)
    print(f"atlas: assets/{name}.json")

kb = os.path.getsize(dst) // 1024
print(f"copied: {os.path.relpath(dst, REPO)} ({kb} KB)")
print(f"use in code: 'assets/{name}{ext}'")
if kb > 1500: print("warning: big file; consider --max and/or --jpg", file=sys.stderr)
