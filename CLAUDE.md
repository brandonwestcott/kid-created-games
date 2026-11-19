# Kid-created games

Each folder at the repo root is one small browser game (plain HTML/CSS/JS, no build step),
linked from the root `index.html` and published with GitHub Pages.

## Asset library (`assets/`)

Kenney (CC0) packs plus third-party collections: painted backgrounds, low-poly icons, a parallax
pack and one-off extras. `assets/` is **gitignored** and is NOT deployed.
**Read `assets/README.md` first.** It has the find → look → copy → use recipe, a "where to find X"
table, code per format, size guidance and licences.

### Rule: copy assets into the game

When a game uses an asset, **copy just the files it needs** into `<game>/assets/` and refer to
them with relative paths (`assets/apple.png`). Never link into `../assets/`, because that path
doesn't exist on GitHub Pages. Copy with the tool (run from the repo root); it shrinks, renames,
copies any `.json` atlas and prints the path to use:
`python3 -I assets/_tools/use-asset.py low-poly-icons/fruits/apple.png my-game --max 128`
(options: `--name N`, `--max PX`, `--jpg`).

- Shrink icons and items with `--max 96`–`256`. Keep each game's `assets/` under about 5 MB.
- Background `<n>` numbers have gaps, so only use a number seen on a preview sheet. Copy
  backgrounds with `--max 1920 --jpg`.
- Prefer Kenney (CC0) for games that will be published. The non-Kenney collections carry a
  licence column in the catalog; ask before publishing a game that uses them.

### Finding assets

1. **Search:** `grep -i 'apple' assets/catalog.tsv`. Columns: path (relative to `assets/`), kind,
   size, pack, collection, license.
2. **Browse:** skim `assets/INDEX.md`, then the collection's own `INDEX.md`
   (`assets/kennys/INDEX.md` has one section per Kenney pack).
3. **Look before choosing:** Read the `<collection>/_previews/` sheets (or a Kenney pack's
   `Preview.png`). For any folder:
   `python3 -I scripts/kenney/contact-sheet.py "<dir>" --grep <word> --out "$TMPDIR/sheet.png"`

### Formats (all load directly in the browser)

| Kind | Format | How to use |
|---|---|---|
| Sprites/tiles | `.png` | `new Image()`, then `ctx.drawImage`. For pixel art, set `ctx.imageSmoothingEnabled = false` |
| Vector art | `.svg` | `<img>` or `new Image()`. Scales cleanly to any size |
| Spritesheets | `.png` + `.json` | Phaser "JSON Hash" atlas: `atlas.frames["name.png"].frame` gives `{x,y,w,h}` for the 9-argument `drawImage`. The PNG is named in `meta.image` (the old Kenney `.xml` is kept too) |
| Tilesheets | `Tilemap/*.png` + `Tilesheet.txt` | Grid of equal tiles. The tile size and spacing are in the txt |
| Sound/music | `.mp3` | `new Audio('assets/boing.mp3').play()` (after a tap or click), or Web Audio `decodeAudioData` |
| 3D models | `.glb` | three.js `GLTFLoader`. Textures are embedded, so one `.glb` file is all you copy |
| Animated 3D characters | `.fbx` (+ `Skins/*.png`) | three.js `FBXLoader`. Only in the "Animated Characters" packs, "Blocky Characters" and "Space Kit (Legacy)". Copy the skin PNG too and apply it as the material map |
| Fonts | `.ttf` | `@font-face` (UI Pack, UI Pack - Sci-fi) |

three.js via CDN (as `minecraft-run/` already does), for example an importmap pointing at
`https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` and `.../examples/jsm/`.

**file:// caveat:** `<img>` and `new Audio()` work when `index.html` is opened straight from
disk. `fetch()` (JSON atlases) and three.js model loaders need http, which GitHub Pages
provides. For local testing, run `python3 -m http.server` from the repo root. To keep a game
working from a double-click, inline small atlas JSON as a JS object instead of fetching it.

### Maintenance

- After adding or changing any collection, run `python3 -I assets/_tools/build-catalog.py`.
- `scripts/kenney/optimize.py` converts a freshly dropped-in Kenney pack: it extracts zips,
  converts OGG to MP3, embeds GLB textures, turns gltf into glb, and XML atlases into JSON. It
  moves unusable formats (FBX/OBJ/DAE/STL duplicates, .blend, Unity, Flash, .ai, ...) to
  `assets/kennys/_removed/`. It is idempotent.
- `scripts/kenney/build-index.py` regenerates `kennys/INDEX.md` and `kennys/catalog.tsv`. Run it after optimize, then
  `build-catalog.py`.
- Run them all from the repo root with `python3 -I`. They need ffmpeg and Pillow.
