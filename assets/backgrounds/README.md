# Backgrounds

770 painted, cartoon-style full-screen scenes in 37 themes. Each one is `<theme>/background_<n>.png`
at 3840x2160 (16:9), opaque, about 1.7 MB. The source and license are unknown, so they're fine for
local and class use, but ask before publishing a game that uses them.

- The theme list, the number range for each theme and the preview pages are in `INDEX.md`.
- **Look before choosing.** Read `_previews/<theme>.jpg` (big themes have `-1`, `-2`, … pages).
  The `#<n>` under each thumbnail is the file number. Numbers are global and have gaps, so never
  guess one.
- Copy shrunk to JPEG (about 250 KB):
  `python3 -I assets/_tools/use-asset.py backgrounds/underwater/background_<n>.png <game> --name bg-underwater --max 1920 --jpg`
- Draw it to cover the canvas: `ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)` (or crop to
  keep the 16:9 ratio), or use CSS `background: url(assets/bg-underwater.jpg) center/cover`.
- Most scenes leave the lower third fairly open, as a floor or ground line where characters can stand.
