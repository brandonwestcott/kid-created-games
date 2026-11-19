#!/usr/bin/env python3
"""
Pull the browser-usable files out of a Unity .unitypackage.

    python3 -I assets/_tools/unitypackage-extract.py <file.unitypackage> <out-dir> [--prefix "Assets/Some Folder"]

A .unitypackage is a tar.gz with one folder per asset GUID holding `asset` (the file),
`asset.meta` (Unity settings) and `pathname` (where it lived in the Unity project).
This script:
  * extracts the archive into a temp dir (never executes anything from it)
  * keeps images, fonts and readme/licence docs (.png .jpg .ttf .otf .pdf .txt);
    drops Unity-only files (.unity .cs .shader .mat .asset .anim .controller ...)
    and anything under a "TextMesh Pro" folder
  * writes each kept file to <out-dir>/<path with --prefix removed>
  * for PNGs Unity had sliced into several sprites (spriteMode: 2), also writes
    <name>/<sprite>.png for every slice and a <name>.json atlas (Phaser JSON Hash, same as
    the Kenney atlases). Unity rects are bottom-left origin; this flips them.

Afterwards: rename things to kebab-case, delete junk, write a README.md for the new
collection, add it to COLLECTIONS in build-catalog.py, and run build-catalog.py.
"""
import argparse, json, os, re, shutil, tarfile, tempfile
from PIL import Image

KEEP = {".png", ".jpg", ".jpeg", ".ttf", ".otf", ".pdf", ".txt"}
SKIP = ("TextMesh Pro",)

def sprites(meta):
    if not re.search(r"^\s*spriteMode: 2", meta, re.M): return []
    pat = (r"- name: (\S+)\s*\n(?:.*\n)*?\s*rect:\s*\n(?:.*\n)*?\s*x: ([\d.]+)\s*\n\s*y: ([\d.]+)"
           r"\s*\n\s*width: ([\d.]+)\s*\n\s*height: ([\d.]+)")
    return [(m.group(1), *[int(float(v)) for v in m.groups()[1:]]) for m in re.finditer(pat, meta)]

ap = argparse.ArgumentParser()
ap.add_argument("package"); ap.add_argument("out"); ap.add_argument("--prefix", default="Assets")
a = ap.parse_args()

tmp = tempfile.mkdtemp(prefix="upk-")
with tarfile.open(a.package, "r:gz") as t:
    t.extractall(tmp, filter="data")

n = 0
for g in sorted(os.listdir(tmp)):
    p = os.path.join(tmp, g)
    if not os.path.isfile(os.path.join(p, "asset")): continue
    name = open(os.path.join(p, "pathname"), encoding="utf-8").read().splitlines()[0]
    ext = os.path.splitext(name)[1].lower()
    if ext not in KEEP or any(s in name for s in SKIP) or not name.startswith(a.prefix): continue
    out = os.path.join(a.out, name[len(a.prefix):].lstrip("/"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    shutil.copyfile(os.path.join(p, "asset"), out); n += 1
    mp = os.path.join(p, "asset.meta")
    if ext == ".png" and os.path.exists(mp):
        sp = sprites(open(mp, encoding="utf-8", errors="replace").read())
        if not sp: continue
        im = Image.open(out); W, H = im.size
        base = os.path.splitext(out)[0]; os.makedirs(base, exist_ok=True); frames = {}
        for sn, x, y, w, h in sp:
            ty = H - y - h
            im.crop((x, ty, x + w, ty + h)).save(os.path.join(base, sn + ".png"))
            frames[sn + ".png"] = {"frame": {"x": x, "y": ty, "w": w, "h": h}, "rotated": False, "trimmed": False,
                                   "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h}, "sourceSize": {"w": w, "h": h}}
        json.dump({"frames": frames, "meta": {"image": os.path.basename(out), "size": {"w": W, "h": H}, "scale": "1"}},
                  open(base + ".json", "w"), indent=1)
        print(f"sliced {os.path.relpath(out, a.out)} into {len(sp)} sprites")
shutil.rmtree(tmp)
print(f"kept {n} files in {a.out}")
