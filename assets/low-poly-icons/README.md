# Low Poly Icons

474 rendered low-poly icons, each a 1024x1024 transparent PNG with soft shading and no
outline. They're great as collectibles, rewards, counting objects, shop items or inventory slots.
Source: polyperfect "Low Poly Icon Pack" v2.1, converted from a Unity package (see `README.pdf`).
This is a paid asset, so ask before publishing a game that uses it.

- Folder per category: `<category>/<name>.png`, for example `fruits/apple.png`, `coins/coin-crown-gold.png`.
- Every name in every category: `INDEX.md`. Look at the pictures in `_previews/<category>.png`.
- Always shrink when copying, because 1024 px is far too big:
  `python3 -I assets/_tools/use-asset.py low-poly-icons/fruits/apple.png <game> --max 128`
- `_special/tile.png` (rounded square backdrop) and `_special/icon-shadow.png` (soft shadow) are what
  the icons were designed to sit on, for a "card/button" look. Draw the tile, then the icon at about 80 % size.

Categories: animals, animations, avatars, barrels, clothes, coffee, coins, common, drinks,
electronics, fantasy, flags, food, fruits, hands, money, music, nature, places, resources,
resources-nature, scifi, space, sport, survival, tools, ui, vehicles, war, weapons, winter.
