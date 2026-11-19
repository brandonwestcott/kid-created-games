# Extras

One-off assets that don't belong to a bigger pack, one folder per item. Previews are in `_previews/<item>.png`.
When you drop in a new one, give it a folder `extras/<kebab-name>/`, slice any sprite sheet into
`<name>/<frame>.png` plus a `<name>.json` atlas (same format as Kenney), add a section below, and run
`python3 -I assets/_tools/build-catalog.py`.

## turkey/

Pixel-art turkey by **VIERGACHT** (credit is printed on the original sheet; the license isn't
stated, so credit the artist and ask before publishing). Sheet: `turkey/turkey.png` (208x176) plus
`turkey/turkey.json`. Every frame is 32x32, sliced into `turkey/turkey/<frame>.png`:

| Animation | Frames |
|---|---|
| idle (standing, small bob) | `idle-1` … `idle-4` |
| gobble (head up) | `gobble-1` … `gobble-3` |
| walk | `walk-1` … `walk-6` |
| food items | `plate-raw`, `plate-roasted`, `plate-roasted-garnish`, `plate-bones`, `drumstick`, `wishbone` |

The turkey faces left. To make it face right, flip it with `ctx.scale(-1, 1)`. This is pixel art,
so draw it at a whole-number scale (x3, x4) with `ctx.imageSmoothingEnabled = false`. Copy it
without `--max`.

```js
const walk = [1,2,3,4,5,6].map(i => load(`assets/turkey-walk-${i}.png`));
const frame = walk[Math.floor(t / 100) % walk.length];   // t = ms; 10 fps
ctx.imageSmoothingEnabled = false;
ctx.drawImage(frame, x, y, 32 * 4, 32 * 4);
```
