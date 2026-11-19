#!/usr/bin/env python3
"""Build assets/class-safe-catalog.tsv: the only catalog /class_math_game may search.

1st-grade safe: no zombies, witches, skeletons, ghosts, graveyards, weapons, war,
explosions, dark/scary scenes, or discouraging voice clips. Allowlists for the painted
collections, a pack denylist for Kenney, then a word blocklist over every path.

Run from the repo root:  python3 -I assets/_tools/build-class-safe.py
Re-run after build-catalog.py adds files.
"""
import re
import sys
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent
SRC = ASSETS / "catalog.tsv"
OUT = ASSETS / "class-safe-catalog.tsv"

# Painted backgrounds: bright, friendly themes only (still check the preview: a few
# castle scenes are dark).
SAFE_BACKGROUNDS = {
    "beach", "bedroom", "camping", "field", "forest-green", "garden", "ice", "kitchen",
    "library", "mushrooms", "other-planet", "space-deck", "spaceship-inside", "town",
    "underwater", "ship", "desert", "ballroom", "castle", "futuristic-city", "japanese",
}
# Low-poly icon categories (avatars/weapons/war/survival/barrels/etc. are out).
SAFE_ICONS = {
    "animals", "coins", "common", "food", "fruits", "music", "nature", "space", "sport",
    "vehicles", "winter", "resources-nature", "clothes", "fantasy", "ui", "places", "_special",
}
# Kenney packs that are about fighting, weapons, dungeons or monsters.
DENY_PACK = re.compile(
    r"fighter|dungeon|roguelike|monster|shooter|tank|weapon|blaster|explosion|smoke|"
    r"tower defense|graveyard|halloween|horror|zombie|survival|war|battle|castle kit|"
    r"pirate",
    re.I,
)
# Words in any path that mean "not for 1st graders".
BLOCK_WORD = re.compile(
    r"zombie|skelet|skull|(^|[^s])witch|ghost|vampire|blood|grave|tomb|coffin|mumm(y|ies)|"
    r"demon|devil|spider|monster|pumpkin|pumkin|halloween|helloween|horror|scary|spooky|"
    r"(^|[^a-z])dead|death|corpse|bone|undead|reaper|evil|knife|sword|gun|pistol|rifle|"
    r"bomb|grenade|missile|rocket_?launcher|weapon|tank|(^|[^a-z])axe|dagger|spear|bullet|"
    r"explos|blast|claw|fang|blade|(^|[^a-z])bat[_.-]|cannon|gallows|pillory|trap|virus|"
    r"vomit|gas-?mask|soldier|army|war[_.-]|fight|punch|hurt|hit[_.-]|damage|injur|"
    r"cross_?bones|jolly|poison|toxic|lava|fire_?ball|crying|angry|scream|nightmare|"
    r"hell|curse|haunt|creep|snake|shark|knight-head|"
    # discouraging voice clips (no-punish rule)
    r"game_over|you_lose|mission_failed|hurry_up|time_over|(^|/)wrong\.",
    re.I,
)


def keep(path: str, pack: str, collection: str) -> bool:
    if BLOCK_WORD.search(path) or BLOCK_WORD.search(pack):
        return False
    parts = path.split("/")
    if collection == "backgrounds":
        if parts[1] == "_previews":
            return any(parts[-1].startswith(t) for t in SAFE_BACKGROUNDS)
        return parts[1] in SAFE_BACKGROUNDS
    if collection == "low-poly-icons":
        if parts[1] == "_previews":
            return parts[-1].rsplit(".", 1)[0] in SAFE_ICONS
        return parts[1] in SAFE_ICONS
    if collection == "kenney":
        if "3D assets" in path:
            return False  # 3D needs three.js + http; keep live builds simple
        return not DENY_PACK.search(pack)
    return collection in {"parallax-pack", "extras"}


def main() -> int:
    rows = SRC.read_text(encoding="utf-8").splitlines()
    header, body = rows[0], rows[1:]
    kept = []
    for row in body:
        cols = row.split("\t")
        if len(cols) < 5:
            continue
        path, _kind, _size, pack, collection = cols[:5]
        if keep(path, pack, collection):
            kept.append(row)
    OUT.write_text("\n".join([header, *kept]) + "\n", encoding="utf-8")
    print(f"kept {len(kept)} of {len(body)} rows -> {OUT.relative_to(ASSETS.parent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
