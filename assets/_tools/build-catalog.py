#!/usr/bin/env python3
"""
Rebuild the top-level asset index for assets/.  Run from anywhere:

    python3 -I assets/_tools/build-catalog.py            # catalog + indexes (+ missing previews)
    python3 -I assets/_tools/build-catalog.py --previews # also re-render every preview sheet

Writes (all inside assets/, which is gitignored):
  catalog.tsv                    every usable file in every collection (one row per file)
  INDEX.md                       every collection and pack, one line each
  backgrounds/INDEX.md           theme list
  backgrounds/_previews/*.jpg    one labelled contact sheet per theme
  low-poly-icons/INDEX.md        category list with every icon name
  low-poly-icons/_previews/*.png one contact sheet per category
  parallax-pack/INDEX.md         layer list
  parallax-pack/_previews/*.png  one contact sheet per folder

Kenney rows are copied from kennys/catalog.tsv, which scripts/kenney/build-index.py makes
(run that first after adding a Kenney pack).
"""
import os, re, sys, json, collections
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REDO = "--previews" in sys.argv
IMG = (".png", ".jpg", ".jpeg", ".webp")

# collection -> (folder, license, one-line description)
COLLECTIONS = {
    "backgrounds":    ("backgrounds",    "unknown source - check before publishing",
                       "Full-screen painted scene backgrounds, 3840x2160, grouped by theme"),
    "low-poly-icons": ("low-poly-icons", "polyperfect Low Poly Icon Pack (paid asset) - check before publishing",
                       "474 rendered low-poly item icons, 1024x1024 transparent PNG, grouped by category"),
    "parallax-pack":  ("parallax-pack",  "opengameasset.net 2D Background Parallax Pack (+ FreeParallax demo art)",
                       "Flat-style side-scroller layers: skies, mountains, ground, plants, clouds, sun/moon"),
    "extras":         ("extras",         "per item - see extras/README.md",
                       "One-off finds (pixel-art sprite sheets etc.), one folder per item"),
    "kenney":         ("kennys",         "CC0 (public domain)",
                       "~240 Kenney packs: 2D sprites/tiles/UI, 3D models (.glb), sound effects and music"),
}

def size_of(p):
    try:
        with Image.open(p) as im: return "%dx%d" % im.size
    except Exception: return ""

def kind_of(p):
    e = os.path.splitext(p)[1].lower()
    if p.endswith(".json"): return "atlas"
    if "/_previews/" in p: return "preview"
    return {".png": "image", ".jpg": "image", ".jpeg": "image", ".ttf": "font",
            ".mp3": "audio", ".glb": "model3d", ".svg": "vector"}.get(e, "doc")

def font(sz):
    for f in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf"):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()

def sheet(files, out, cw, ch, cols, label=lambda f: os.path.splitext(os.path.basename(f))[0]):
    """Labelled grid on a checkerboard (so transparency is visible)."""
    if not files: return
    if os.path.exists(out) and not REDO: return
    lh = 16; rows = (len(files) + cols - 1) // cols
    cols = min(cols, len(files))
    S = Image.new("RGB", (cols * cw, rows * (ch + lh)), (60, 60, 70))
    d = ImageDraw.Draw(S); fnt = font(12)
    for i, f in enumerate(files):
        x, y = (i % cols) * cw, (i // cols) * (ch + lh)
        for cy in range(0, ch, 12):
            for cx in range(0, cw, 12):
                if (cx // 12 + cy // 12) % 2:
                    d.rectangle([x + cx, y + cy, x + cx + 11, y + cy + 11], fill=(75, 75, 88))
        im = Image.open(f).convert("RGBA"); im.thumbnail((cw - 4, ch - 4), Image.LANCZOS)
        if max(im.size) <= 64:  # blow up tiny pixel art so it is visible
            k = max(1, min((cw - 4) // im.width, (ch - 4) // im.height))
            im = im.resize((im.width * k, im.height * k), Image.NEAREST)
        S.paste(im, (x + (cw - im.width) // 2, y + (ch - im.height) // 2), im)
        d.text((x + 3, y + ch + 1), label(f)[:int(cw / 6.5)], fill=(230, 230, 230), font=fnt)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    S.save(out, quality=82) if out.endswith(".jpg") else S.save(out, optimize=True)
    print("preview", os.path.relpath(out, ROOT))

def natural(s): return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", s)]

def files_in(d, exts=IMG):
    out = []
    for dp, dn, fn in os.walk(d):
        dn[:] = sorted(x for x in dn if not x.startswith("_"))
        out += [os.path.join(dp, f) for f in sorted(fn, key=natural) if f.lower().endswith(exts)]
    return out

rows, index = [], collections.OrderedDict()

def add_rows(coll, files, pack_of):
    lic = COLLECTIONS[coll][1]
    for f in files:
        rel = os.path.relpath(f, ROOT)
        rows.append((rel, kind_of(rel), size_of(f) if f.lower().endswith(IMG) else "", pack_of(f), coll, lic))

# ---- backgrounds: one pack per theme
bg = os.path.join(ROOT, "backgrounds"); lines = []
for t in sorted(x for x in os.listdir(bg) if os.path.isdir(os.path.join(bg, x)) and not x.startswith("_")):
    fs = files_in(os.path.join(bg, t))
    add_rows("backgrounds", fs, lambda f, t=t: t)
    PAGE = 36; prevs = []
    for i in range(0, len(fs), PAGE):
        prev = f"backgrounds/_previews/{t}" + (f"-{i // PAGE + 1}" if len(fs) > PAGE else "") + ".jpg"
        sheet(fs[i:i + PAGE], os.path.join(ROOT, prev), 256, 144, 6,
              label=lambda f: os.path.basename(f).replace("background_", "#").replace(".png", ""))
        prevs.append(f"`{prev}`")
    nums = sorted(int(re.sub(r"\D", "", os.path.basename(f))) for f in fs)
    lines.append(f"- **{t}** ({len(fs)}, n = {nums[0]}..{nums[-1]}) — `backgrounds/{t}/background_<n>.png` — preview {', '.join(prevs)}")
index["backgrounds"] = lines
with open(os.path.join(bg, "INDEX.md"), "w") as fh:
    fh.write("# Backgrounds\n\nEvery image is a 3840x2160 PNG (16:9, ~1.7 MB). Always copy with "
             "`_tools/use-asset.py ... --max 1920 --jpg` (about 300 KB).\n"
             "Look at the theme preview first; the label under each thumbnail is the `<n>` in the file name.\n"
             "Numbers are NOT 1..count and have gaps, so always pick a number you saw in a preview.\n\n"
             + "\n".join(lines) + "\n")

# ---- low-poly-icons: one pack per category
ic = os.path.join(ROOT, "low-poly-icons"); lines = []; detail = []
for c in sorted(x for x in os.listdir(ic) if os.path.isdir(os.path.join(ic, x)) and not x.startswith("_")):
    fs = files_in(os.path.join(ic, c))
    add_rows("low-poly-icons", fs, lambda f, c=c: c)
    prev = f"low-poly-icons/_previews/{c}.png"
    sheet(fs, os.path.join(ROOT, prev), 112, 112, 10)
    names = ", ".join(os.path.splitext(os.path.basename(f))[0] for f in fs)
    lines.append(f"- **{c}** ({len(fs)}) — preview `{prev}`")
    detail.append(f"## {c}\n`low-poly-icons/{c}/<name>.png`: {names}\n")
add_rows("low-poly-icons", files_in(os.path.join(ic, "_special")), lambda f: "_special")
index["low-poly-icons"] = lines
with open(os.path.join(ic, "INDEX.md"), "w") as fh:
    fh.write("# Low Poly Icons\n\nAll icons are 1024x1024 transparent PNGs. That is far too big for a game, so "
             "copy with `_tools/use-asset.py ... --max 128` (or 256 for big on-screen items).\n\n"
             + "\n".join(lines) + "\n\n" + "\n".join(detail))

# ---- parallax-pack: one pack per top folder
pp = os.path.join(ROOT, "parallax-pack"); lines = []
for c in sorted(x for x in os.listdir(pp) if os.path.isdir(os.path.join(pp, x)) and not x.startswith("_")):
    fs = files_in(os.path.join(pp, c), IMG + (".json",))
    add_rows("parallax-pack", fs, lambda f, c=c: c)
    # preview: single images + sliced pieces, not whole sheets
    pics = [f for f in fs if f.endswith(IMG) and not os.path.exists(os.path.splitext(f)[0] + ".json")]
    prev = f"parallax-pack/_previews/{c}.png"
    sheet(pics, os.path.join(ROOT, prev), 160, 120, 8)
    atl = [os.path.relpath(f, ROOT) for f in fs if f.endswith(".json")]
    lines.append(f"- **{c}** ({len([f for f in fs if f.endswith(IMG)])} images)"
                 + (f" — atlases {', '.join('`'+a+'`' for a in atl)}" if atl else "") + f" — preview `{prev}`")
index["parallax-pack"] = lines
with open(os.path.join(pp, "INDEX.md"), "w") as fh:
    fh.write("# Parallax Pack\n\nSee README.md for how the layers fit together.\n\n" + "\n".join(lines) + "\n")

# ---- extras: one pack per item folder; sliced sheets get a preview of their pieces
ex = os.path.join(ROOT, "extras"); lines = []
for c in sorted(x for x in os.listdir(ex) if os.path.isdir(os.path.join(ex, x)) and not x.startswith("_")):
    fs = files_in(os.path.join(ex, c), IMG + (".json",))
    add_rows("extras", fs, lambda f, c=c: c)
    pics = [f for f in fs if f.endswith(IMG) and not os.path.exists(os.path.splitext(f)[0] + ".json")]
    prev = f"extras/_previews/{c}.png"
    sheet(pics, os.path.join(ROOT, prev), 96, 96, 8)
    atl = [os.path.relpath(f, ROOT) for f in fs if f.endswith(".json")]
    lines.append(f"- **{c}** ({len(pics)} images)" + (f" — atlas {', '.join('`'+a+'`' for a in atl)}" if atl else "")
                 + f" — preview `{prev}` — see `extras/README.md`")
index["extras"] = lines

# ---- kenney: reuse kennys/catalog.tsv and the pack list in kennys/INDEX.md
kc = os.path.join(ROOT, "kennys", "catalog.tsv")
with open(kc) as fh:
    next(fh)
    for line in fh:
        p, k, s, pack = (line.rstrip("\n").split("\t") + ["", "", "", ""])[:4]
        rows.append(("kennys/" + p, k, s, pack, "kenney", COLLECTIONS["kenney"][1]))
kl = []; section = None
for line in open(os.path.join(ROOT, "kennys", "INDEX.md")):
    if line.startswith("## "): section = line.strip()
    if section == "## Packs" and line.startswith("- ["):
        kl.append(re.sub(r"\]\(#", "](kennys/INDEX.md#", line.rstrip()))
index["kenney"] = kl

# ---- write catalog + INDEX
rows.sort(key=lambda r: (r[4] != "kenney", r[0]))
with open(os.path.join(ROOT, "catalog.tsv"), "w") as fh:
    fh.write("path\tkind\tsize\tpack\tcollection\tlicense\n")
    for r in rows: fh.write("\t".join(r) + "\n")

cnt = collections.Counter(r[4] for r in rows)
out = ["# Asset index", "",
       "Auto-generated by `_tools/build-catalog.py`. Read `README.md` first for how to search and use assets.",
       "Paths are relative to `assets/`. Per-file search: `grep -i <word> assets/catalog.tsv`",
       "(columns: path, kind, size, pack, collection, license).", "", "## Collections", "",
       "| Collection | Folder | Files | License | What |", "|---|---|---|---|---|"]
for k, (folder, lic, desc) in COLLECTIONS.items():
    out.append(f"| {k} | `{folder}/` | {cnt[k]} | {lic} | {desc} |")
titles = {"backgrounds": "Backgrounds (by theme)", "low-poly-icons": "Low Poly Icons (by category)",
          "parallax-pack": "Parallax Pack (by layer)", "extras": "Extras (one-off items)", "kenney": "Kenney packs (details per pack in `kennys/INDEX.md`)"}
for k, lines in index.items():
    out += ["", f"## {titles[k]}", ""] + lines
with open(os.path.join(ROOT, "INDEX.md"), "w") as fh:
    fh.write("\n".join(out) + "\n")
print("catalog rows:", dict(cnt))
