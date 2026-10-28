# Changelog

## v1.4.1

### Fixed
- New versions now install over the old one instead of failing, so updating keeps your save. Every build is now signed with the same key, and a build is rejected if it isn't. **You need to uninstall one last time before installing this version**, because the version on your phone was signed with a different key.

### New
- **Export Save / Import Save** in Settings: back up all your progress as a code you can copy, and restore it on any install or device.

## v1.4.0

### New
- **Commander skill trees**: each commander levels up from runs you play with them (max level 15). Spend points on 4 small passive buffs and unlock 3 active abilities per commander (24 abilities in total), used from buttons during waves.
- **Run mutators**: optional modifiers on the New Run screen (Scorched Earth, Shroud, Swarm Surge, Glass Core, Inflation, Armored Tide, Haste, Famine). Each one adds bonus XP and shards.
- **Chunk relocation**: rotate a map chunk or swap two of them. You start each run with 1 relocation and get another after every boss (max 2). Towers on moved chunks are fully refunded.
- **Destructible asteroids**: tap a rock to blast it into a build tile, with a chance to find a Void Shard.
- **Tower relics**: 8 relics that can be installed on a single tower, like Ricochet Core, Frost Shell, Toxic Rounds and Bounty Chip. They come from augment picks, the shop and boss spoils.
- **Tower veterancy**: towers earn Bronze, Silver and Gold ranks from kills, with stat boosts and a badge on the sprite.
- **Fusion**: two max-level towers side by side can fuse into one of 5 new towers: Arc Lance, Frostfire Cannon, Plague Mortar, Storm Rail and Golden Pylon.
- **Overclock**: double a tower's fire rate for 5 seconds, after which it overheats and shuts down for 6.
- **Prestige**: at level 30, reset your level and talents for a permanent damage and shard bonus, shown as stars on the menu.
- **Mastery skins**: unlock Neon (400 kills) and Gold (1,500 kills) looks for each tower, and pick them in the Armory.
- **Run history**: your last 20 runs, with wave, commander, top tower and what finally broke the core.
- **Mini-bosses** on waves 25, 35, 45 and beyond: the Carrier, Juggernaut Prime and Rift Weaver.
- **Corrupted enemies** after wave 50: tougher variants with an extra ability each.
- **Wave preview bar** showing exactly which enemies are coming next.
- Game speed now goes up to **5x**.
- **Vibration** on hits, bosses, wave clears and game over, with a toggle in Settings.
- **Commander easter eggs**: tap a commander's sprite for a themed animation.

### Changed
- Main menu buttons are now in two columns, with a new History button.
- The New Run screen has a Launch button at the top.

## v1.3.0

### New
- Every commander now has their own animated pixel-art character on the Commanders and New Run screens:
  - Vanguard: power armor and pulse rifle
  - Engineer: hard hat, hi-vis vest and sparking wrench
  - Cryomancer: ice robe and crystal staff
  - Biotech: hazmat suit, gas mask and bubbling vial
  - Tycoon: top hat and monocle, flipping a gold coin
  - Warden: plate armor and tower shield
  - Gunslinger: cowboy hat, duster and revolver
  - Necrotech: hooded skull with a glowing soul orb
- Secret on the main menu: tap Quinn to trigger a random outfit change or animation:
  - Outfits: plague doctor costume, Spider-Man PJs, or back to the flannel
  - Animations: electric guitar, acoustic guitar, vape, Mega Man buster, web shooting, Game Boy, and portal jump
  - Taps are ignored until the current animation finishes

### Changed
- Quinn's sprite now wears a red and black flannel with rolled-up sleeves over a white undershirt.

## v1.2.0

### New
- "Made by Quinn" animated pixel sprite in the bottom-left of the main menu.
- Version number shown on the main menu.
- Releases are now versioned, and new versions install over old ones without losing your save.

### Changed
- New players start with only the Pulse Blaster. Every other tower is unlocked with Void Shards in the Armory.
- Cryo Emitter (3 shards), Plasma Cannon (4) and Tesla Coil (6) are cheap enough to unlock after a first run.
- Every run now pays at least 2 bonus Void Shards.
- Pulse Blaster rebalanced: cost 70, damage 5, fire rate 2.9/s.

## v1.1.0

### New
- Risk/reward map tiles:
  - Rift Conduit and Ion Accelerator buff only the enemies that cross them, but those enemies drop extra credits.
  - Shard Obelisk and Bounty Beacon buff every enemy in exchange for shards or bonus credits.
- New enemies arrive with each neon sector (every 10 waves), including the new Nullifier and Blinker in the Void Reach.
- Enemy intel screen the first time you meet an enemy or boss: stats, abilities, and which towers are strong or weak against it. Also viewable in the Codex.
- Every tower level has a more advanced look, and all 24 branch upgrades have their own unique sprite and color.

### Changed
- Much harder overall:
  - Towers and upgrades cost more, and income is lower.
  - Enemy HP scales faster, and the core has 15 HP.
- Slower meta progression:
  - More XP needed per level, and no free talent points.
  - Pricier unlocks and fewer shards per run.
- Shop rerolls double in price each time within the same shop.
- Augments cost more for every copy you already own.

## v1.0.0

### New
- First release of Neon Bastion, an endless sci-fi tower defense roguelike with 16-bit neon pixel art.
- Expanding map: every 3 waves, pick a map chunk and attach it to an enemy portal. Chunk types include forks, crossroads, braided lanes and sealed bulkheads, with terrain like high ground, coolant, rocks, data caches and power nodes.
- 12 towers with 3 levels and an A/B branch upgrade each, plus tower combos.
- Endless waves, elite waves, and a boss every 10 waves.
- Augments, a black market shop, and random events between waves.
- Meta progression: XP and levels, talent trees, tower unlocks, commanders, heat levels, codex and achievements.
- Runs auto-save between waves.
