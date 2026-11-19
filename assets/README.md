# Game assets: start here

This folder is the shared art and sound library for the kid-made games in this repo.
It is **gitignored and not deployed**. A game never links into it. Instead you **copy**
the few files a game needs into `<game>/assets/` with `_tools/use-asset.py`.

## The 4-step recipe

```bash
# 1. FIND: search the catalog (path, kind, size, pack, collection, license)
grep -i 'dragon' assets/catalog.tsv | head
grep -iP '\tlow-poly-icons\t' assets/catalog.tsv | grep -i fruit

# 2. LOOK: open the ready-made preview sheet (Read the .jpg/.png) before choosing
#    backgrounds/_previews/<theme>.jpg   low-poly-icons/_previews/<category>.png
#    parallax-pack/_previews/<folder>.png   Kenney: each pack's Preview.png
#    Any folder:  python3 -I scripts/kenney/contact-sheet.py "<dir>" --grep <word> --out "$TMPDIR/s.png"

# 3. COPY into the game, shrunk to the size the game draws it at
python3 -I assets/_tools/use-asset.py backgrounds/castle/background_117.png class-math-game --name bg-castle --max 1920 --jpg
python3 -I assets/_tools/use-asset.py low-poly-icons/fruits/apple.png class-math-game --max 128

# 4. USE the printed relative path in code:  img.src = 'assets/bg-castle.jpg'
```

Run the commands from the repo root. `use-asset.py` accepts the catalog path (relative to
`assets/`), a game folder name, an optional `--name`, `--max <px>` (longest side) and `--jpg`.
If the image has a `.json` atlas next to it, the atlas is copied and rescaled too.

## What's here

| Folder | What | Count | Size on disk | License |
|---|---|---|---|---|
| `backgrounds/` | Painted full-screen scenes by theme (castle, underwater, space-deck, kitchen…). All 3840x2160 PNG | 770 in 37 themes | 1.3 GB | **Unknown source.** Fine for local/class use. Ask before publishing |
| `low-poly-icons/` | Rendered 3D-look item icons by category (fruits, coins, animals, weapons, fantasy…). 1024x1024 transparent PNG | 474 in 31 categories | 77 MB | polyperfect paid pack. Ask before publishing |
| `parallax-pack/` | Flat-style side-scroller layers: skies, stars, mountains, ground strips, waves, plants, clouds, sun/moon | 176 | 4 MB | opengameasset.net pack. Ask before publishing |
| `extras/` | One-off finds, one folder per item (for now: an animated pixel-art turkey with walk/idle/gobble frames and food items) | 19 | tiny | per item, see `extras/README.md` |
| `kennys/` | ~240 Kenney packs: 2D sprites, tiles, UI, fonts, 3D `.glb` models, sound effects, music | ~76k files | 680 MB | **CC0. Always safe** |

Indexes, from broad to detailed:
- `INDEX.md` has every collection and every pack/theme/category on one line, plus preview paths.
- `catalog.tsv` has one row per file (~77k rows). Grep it rather than reading it.
- `backgrounds/INDEX.md`, `low-poly-icons/INDEX.md` (lists every icon name), `parallax-pack/INDEX.md`.
- `kennys/INDEX.md` gives one section per Kenney pack, with style, sprite sizes, folders, atlases and naming vocabulary:
  `grep -n -A10 '^### .*Fish Pack' assets/kennys/INDEX.md`

When an asset is equally good in both, prefer Kenney (CC0) for games that will be published to GitHub Pages.

## Where to look for common needs

| Need | First choice | Also |
|---|---|---|
| Scene / level background | `backgrounds/<theme>/` (painted, 16:9) | Kenney `Background Elements Redux/Backgrounds/`, `Platformer Pack Redux/PNG/Backgrounds/` |
| Scrolling side-view layers | `parallax-pack/` (see its README) | Kenney `Background Elements Redux` |
| Collectibles, rewards, "things to count" | `low-poly-icons/` (fruits, coins, food, animals, fantasy, resources) | Kenney `Generic Items`, `Platformer Pack Redux/PNG/Items` |
| Player / hero characters | Kenney `Platformer Pack Redux` (alienBlue_jump…), `Toon Characters Pack 1` (poses), `Platformer Characters 1` | `low-poly-icons/avatars` (portraits only) |
| Animals | Kenney `Animal Pack Redux` (round/square faces), `Fish Pack` | `low-poly-icons/animals` |
| Enemies | Kenney `Platformer Pack Redux/PNG/Enemies`, `Monster Builder Pack`, `Robot Pack` | |
| Numbers / letters on tiles | Kenney `Letter Tiles Redux`, `Platformer Pack Redux/PNG/HUD` (hud0…hud9) | |
| Buttons, panels, progress bars | Kenney `UI Pack`, `UI Pack - Adventure`, `UI Pack - Sci-fi` | `low-poly-icons/ui` |
| Stars, medals, trophies | Kenney `Medals`, `Emote Pack`, `Particle Pack` (sparkles) | `low-poly-icons/common`, `coins` |
| Explosions / sparkles | Kenney `Explosion Pack`, `Particle Pack/PNG (Transparent)`, `Smoke Particles` | |
| Correct / wrong / click sounds | Kenney `Audio/Interface Sounds/Audio/` (confirmation_, error_, click_), `Audio/UI Audio` | `Audio/Digital Audio` (powerUp, highUp) |
| Spoken words | Kenney `Audio/Voiceover Pack/` (male and female folders): `correct`, `wrong`, `congratulations`, `you_win`, `level_up`, `new_highscore`, `ready`/`set`/`go`, numbers `1`–`10` | |
| Win fanfare / short jingle | Kenney `Audio/Music Jingles/` | |
| Background music | Kenney `Audio/Music Loops/` | |
| Hits, footsteps, coins | Kenney `Audio/Impact Sounds`, `Audio/Casino Audio` | |
| 3D models | Kenney `3D assets/<Kit>/` `.glb` (look at `Previews/<model>.png`) | |
| Fonts | Kenney `UI Pack/Font/*.ttf` | |

## Using each kind in a plain-JS game

| Kind | Code | Notes |
|---|---|---|
| PNG/JPG image | `const img = new Image(); img.src = 'assets/apple.png'; ... ctx.drawImage(img, x, y, w, h)` | Works from `file://`. Pixel art: `ctx.imageSmoothingEnabled = false` |
| Atlas (`.png` + `.json`) | `const f = atlas.frames['clouds-3.png'].frame; ctx.drawImage(img, f.x, f.y, f.w, f.h, x, y, f.w, f.h)` | `fetch()` needs http. To keep double-click working, paste the JSON into the JS as an object. Often simpler: copy the individual sliced PNGs instead |
| SVG | `<img src="assets/x.svg">` or `new Image()` | Scales cleanly |
| Sound | `new Audio('assets/correct.mp3').play()` | Only after a tap/click/key. Make a new `Audio` (or `cloneNode()`) per play so sounds can overlap |
| Music | `const m = new Audio('assets/music.mp3'); m.loop = true; m.volume = 0.4` | Start it on the first click |
| 3D `.glb` | three.js `GLTFLoader` (see `minecraft-run/` for the CDN importmap) | Needs http. Textures are inside the `.glb` |
| Font | `@font-face { font-family: Kenney; src: url(assets/kenney.ttf) }` | |
| Background | CSS `background: url(assets/bg.jpg) center/cover` or `drawImage(bg, 0, 0, canvas.width, canvas.height)` | Use `--max 1920 --jpg` (about 250 KB instead of 1.7 MB) |

Size guide for `--max`: icons/items 96–256, characters 128–256, full-screen backgrounds 1920,
parallax strips 2048 (already that size). Keep every game's `assets/` folder small, ideally under 5 MB.

Local test: `python3 -m http.server` from the repo root, then open `http://localhost:8000/<game>/`.

## Collection notes

- **backgrounds/**: each file is `background_<n>.png`. The `<n>` numbers are global, not
  1..count (castle is 84..204). **Always choose a number you saw on a preview sheet.** Big themes
  have several preview pages (`castle-1.jpg` … `castle-4.jpg`). They're opaque, so always use `--jpg`.
- **low-poly-icons/**: friendly file names (`fruits/apple.png`, `coins/coin-crown-gold.png`).
  The full name list is in `low-poly-icons/INDEX.md`. `_special/` has a rounded tile backdrop and a drop
  shadow that the icons were designed to sit on.
- **parallax-pack/**: see `parallax-pack/README.md`. The sliced sheets have one PNG per
  piece in a same-named folder (`sky/clouds/clouds-3.png`) and a `.json` atlas.
- **extras/**: when someone drops a loose file into `assets/`, file it here as `extras/<item>/`
  and add a section to `extras/README.md` (see the turkey there as the pattern).
- **kennys/**: original Kenney folder and file names. Many packs ship 1x/2x or Default/Retina copies,
  so pick the smallest that looks right. Archived (older) packs are in `kennys/Archive/`.

## Maintenance

| Task | Command (from repo root) |
|---|---|
| Rebuild `catalog.tsv`, all `INDEX.md` files and missing previews | `python3 -I assets/_tools/build-catalog.py` (`--previews` re-renders all previews) |
| Add a Kenney pack | drop it in `assets/kennys/2D assets/` (or 3D/Audio), then `python3 -I scripts/kenney/optimize.py`, `python3 -I scripts/kenney/build-index.py`, `python3 -I assets/_tools/build-catalog.py` |
| Convert a Unity `.unitypackage` | `python3 -I assets/_tools/unitypackage-extract.py pkg.unitypackage assets/<new-collection> --prefix "Assets/<Folder>"`. It keeps images, fonts and docs, and cuts Unity sprite sheets into PNGs plus a `.json` atlas. Then rename to kebab-case, add a `README.md`, register it in `COLLECTIONS` in `build-catalog.py`, and rebuild |
| Add another folder of images | put it at `assets/<kebab-name>/<group>/<file>.png`, register it in `build-catalog.py`, rebuild |

Conventions: lowercase kebab-case names everywhere outside `kennys/`. Folders starting with
`_` (`_previews`, `_special`, `_tools`) are support files, not assets.
