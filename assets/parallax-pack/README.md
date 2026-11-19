# Parallax Pack

Flat-colour 2D layers for side-scrolling scenes. All strips are 2048 px wide and tile
horizontally, so draw them twice side by side and scroll each one at a different speed.
Source: "2D Background Parallax Pack v1.0" (opengameasset.net), converted from a Unity package.
`free-parallax/` is the demo art from the bundled FreeParallax plugin (Digital Ruby). See
`README.txt`, `SOURCE.txt` and `free-parallax/README.txt`. Ask before publishing.

Previews: `_previews/<folder>.png`.

## Layers, back to front

| Depth | Files | Size | Scroll speed |
|---|---|---|---|
| Sky (fills the screen) | `sky/sky-blue.png`, `sky-dark-blue.png`, `sky-orange.png`, `sky-red-orange.png`, `sky-black.png` | 2048x1024, vertical gradient | 0 (static) |
| Stars (night, over the sky) | `sky/stars-small.png`, `sky/stars-big.png` | 2048x512, transparent | 0.05 |
| Sun / moon | `sky/sun-and-moon/sun-and-moon-<0..17>.png` | single sprites | 0 |
| Clouds | `sky/clouds/clouds-<0..11>.png` | single sprites | 0.1–0.2 |
| Far mountains | `layers/mountain-parallax-1/2/3.png` | 2048x512 strips, transparent | 0.2 / 0.35 / 0.5 |
| Single mountains to place yourself | `mountain/mountain-round/mountain-round-<0..21>.png`, `mountain/mountain-tri/mountain-tri-<0..22>.png` (sand, green, grey, purple, olive; 18–22 are plain white silhouettes, so tint them) | sprites | 0.3–0.5 |
| Water | `ocean-waves/wave-round.png`, `wave-tri.png` | 2048x512 strips | 0.7 |
| Plants, trees, flowers | `vegetation/vegetation/flower-01..24`, `tree-01..09`, `vegetation-1..10` | sprites | 0.8–1.0 |
| Grass edge | `layers/grass.png` | 2048x128 strip | 1.0 |
| Ground / road | `ground/ground/ground.png`, `ground-path.png`, `ground-asphalt1-lane.png`, `-2-lanes`, `-3-lanes` | 2048x170–232 strips | 1.0 |

The `.png` sheet next to each sliced folder (`sky/clouds.png` plus `sky/clouds.json`) holds the same
pieces as one atlas. Copy the single PNGs unless you want atlas drawing.

`free-parallax/` contains ready-made forest layers: `background-1/2-*.png` (far), `foreground-1/2-*.png`
(near), and `tree`, `tree2`, `flowers`, `cloud-1/2`, `moon`, `planet`, `nebula`, `star-field.jpg`.
The `@2x` files are double resolution.

## Scrolling loop

```js
const layers = [ // copied into the game with _tools/use-asset.py
  { img: load('assets/sky-blue.png'),            speed: 0,    y: 0,   h: 540 },
  { img: load('assets/mountain-parallax-1.png'), speed: 0.2,  y: 200, h: 256 },
  { img: load('assets/mountain-parallax-3.png'), speed: 0.5,  y: 260, h: 256 },
  { img: load('assets/grass.png'),               speed: 1.0,  y: 470, h: 64  },
];
function drawLayers(cameraX) {
  for (const L of layers) {
    const w = L.img.width * (L.h / L.img.height);    // keep aspect ratio
    let x = -((cameraX * L.speed) % w);
    for (; x < canvas.width; x += w) ctx.drawImage(L.img, x, L.y, w, L.h);
  }
}
```
