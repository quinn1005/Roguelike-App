# Changelog

## v2.3.1

### Changed
- **Neon Slash follows your finger.** The slash now traces the exact path you draw, curves and all, instead of a straight line from start to finish. Each enemy along the stroke is hit once, and strokes can be up to about 14 tiles long. The live preview follows your finger too.

## v2.3.0

### New controls
- **Hold a tower** to open its info panel, any time. Between waves a quick tap still works too.
- **During a wave, tapping a tower is purely a rhythm action**: on the beat it fires an accent shot; off the beat it just shows MISS. Missed taps no longer pop the panel open.
- **Two fingers move the map** and pinch to zoom. One-finger drags no longer move the map, so a mistimed slash never sends the camera flying. On a computer, right-drag or the arrow keys move the map.
- A one-time hint explains the new controls on your first wave.

### Everything plays to the music
- Tower shots and enemy spawns now land on the beat grid of the song (sixteenth notes) at 1x and 2x speed. Fire rates are unchanged.
- Enemies march in step: they swap walking frames on the beat and hop on every beat. Bosses stomp on quarter notes.
- The path's neon flow steps forward with the music, portals pulse on the kick, max-level towers flash on every bar, and buff towers bob on the beat.
- The main menu's sun and grid pulse with the menu music.

### Cleaner screen
- Streamlined HUD: one slim top row, with the beat meter just under it and the enemies-left count in the wave chip. The redundant "Next" chip is gone.
- Compact controls: RAID, MOVE and AUTO are small buttons stacked above a pulsing WAVE button, and the tower bar scrolls instead of running into them.
- Smaller, quicker toasts. The raid window moved to the top-right.
- The map starts zoomed in so towers and enemies are easier to see and tap.
- Tidier New Run header.
- The How to Play guide is updated for the new controls.

## v2.2.0

### Removed
- **Echoes** have been removed: no more saved ghost towers, ECHO button or Echo page in the guide. Saved Echo data is cleared automatically.

## v2.1.0

### New: play to the beat
- **Tower Accents**: during a wave, tap a tower right on the beat and it instantly fires a charged accent shot. **Perfect** timing (within 60 ms) hits hardest, **Good** (within 110 ms) a little less. Each tower can accent once per bar. Off-beat taps still open the tower panel as before.
  - Every tower has its own accent. Tesla fires a charged chain, Railgun a charged slug, splash towers a charged blast, Drone Bays make all their drones strike at once. A Perfect accent on a Black Hole Cannon opens a black hole right on its target.
- **Neon Slash**: during a DROP, drag across the path to slash every enemy the line crosses. Release on the beat for full damage. Up to 2 slashes per drop, shown on the beat meter.
- **Beat Timing** in Settings: tap along with a click track to calibrate for your phone's audio delay, or adjust it by hand in 10 ms steps. Beat taps and slashes are judged by what you actually hear.
- **Beat Accents** can be turned off in Settings.
- New How to Play page: Play to the Beat.

## v2.0.0

### New: Synthwave Sync
- The game now has a soundtrack: procedural synthwave, with a different track and tempo for every neon sector, plus a calmer menu theme. Toggle it with **Music** in Settings.
- The fight runs to the beat. The core and your towers pulse with the music, and a **beat meter** in the top-left counts down 8 bars.
- On the 8th bar the song hits the **DROP**: for that whole bar every tower deals **double damage**.
- During boss waves, every other drop becomes a **BREAKDOWN**: for two bars the bosses take +75% damage and move 40% slower.

### New: Counter-Raids
- From wave 3, press **RAID**, pick a portal and choose up to **5 towers** for a strike squad. The odds of success are shown before you launch. Stronger, pricier and higher-ranked towers raise them.
- The squad **leaves the map for the whole next wave**, and a small window shows them fighting inside the rift.
- **Win**: credits, Void Shards, a chance at a relic, +10 veterancy kills for each raider, and that portal sends half its enemies for 3 waves.
- **Lose**: the portal sends a retaliation squad of elites next wave.
- Each raid fortifies that portal, and the squad needs 2 waves to recover before the next raid.

### New: Echoes
- When a run ends (wave 5+), your best tower is saved as an **Echo**, a ghost that keeps its level, branch, relic and rank. Your last 8 are kept.
- Once per run, summon one for **free** from the **ECHO** button on the tower bar. It lasts 4 waves, 5 if it came from a wave 25+ run, and 7 for a gold Echo from wave 50+.

### Removed
- **Overclock** has been removed from towers.

### Balance
- Enemies have 10% more HP to make up for the drops.
- Cryo Emitter: damage 4 → 6, slow 45% → 50%.
- Tesla Coil: damage 22 → 25.
- Orbital Mortar: damage 85 → 100.
- Beam Laser: damage 17 → 19.

### Guide
- The How to Play guide has new pages for Synthwave Sync, Counter-Raids and Echoes.

## v1.10.0

### Changed: Drone Bay
- Drones no longer stop enemies on the path. Each drone locks onto an enemy near its bay and chases it down until it dies, then flies back for the next one. Drones from the same bay spread out across different targets.
- Drones can't be destroyed any more, so drone HP is gone. Everything that used to boost drone HP now boosts drone damage instead:
  - **Heavy Frames** branch is now **Hunter Frames**: +80% drone damage and drones fly 40% faster.
  - Drone Bay talent **Armor Frames** is now **Servo Blades**: +10% drone damage per rank.
  - Warden's **Plated Drones** is now **Hunter Drones**: +8% drone damage per rank.
- Rebalanced for the new behaviour: drone damage 26 → 18.
- Drones still can't reach flying enemies.

## v1.9.0

### New enemy: Shade
- A hooded void wisp that is **always cloaked**, even without the Shroud mutator. Towers can only see it within 2.5 tiles unless they have detection (Tesla Coil, Beam Laser, Cryo Blizzard, Railgun Assassin, Mortar Carpet Barrage, Targeting Array or a Sensor Beacon).
- Appears in the Toxic Belt sector from wave 27, with its own intel screen and Codex entry.
- Corrupted Shades (wave 51+) also blink forward along the path.

## v1.8.0

### Cloaked enemy detection
Cloaked enemies (Shroud mutator, cloaked elite waves, corrupted Wasps and Blinkers) can normally only be shot from 2.5 tiles away. There are now more ways to see them at full range:

- **Always have detection**: Tesla Coil and Beam Laser.
- **Detection through an upgrade path**: Cryo Emitter (Blizzard), Railgun (Assassin), Orbital Mortar (Carpet Barrage).
- **Fusions keep it**: Arc Lance, Storm Rail and Quasar.
- **Amplifier Pylon (Targeting Array)** still grants detection to every tower in its range.
- **New relic, Sensor Beacon**: the tower it's installed on, plus every tower touching it (sides and diagonals), can see cloaked enemies.
- The tower panel now shows **Detection: Sees cloaked** on towers that can see them, and the How to Play guide explains detection.

## v1.7.0

### New tower: Black Hole Cannon
Designed by **Levi**, who found the Quinn easter egg. Thanks Levi!

- Unlocks in the Armory for 180 Void Shards and costs 210 credits to build.
- Lobs a singularity onto the track that opens a black hole for 2.5 seconds. Every enemy in reach is pulled into the core and held there, taking damage the whole time. Bosses and mini-bosses can't be held, but they are slowed.
- Caught enemies shrink and spin around the event horizon. An enemy that was just released can't be grabbed again right away.
- **Path A, Supermassive Collapse**: when a hole closes it implodes, blasting everything nearby. The blast gets bigger for every enemy it was holding.
- **Path B, Wormhole**: holes are 25% bigger. When one closes, everything it held is flung back up the path toward its portal and takes heavy damage. Bosses inside get shoved back too.
- Its talent tree has a new special, **Long Night**: black holes last 1 second longer.

### New fusion: Quasar
- Fuse a max-level Black Hole Cannon with a max-level Tesla Coil next to it. It fires huge, long-lasting black holes that hurl lightning at every enemy around them while they are open.

## v1.6.0

### Tower balance pass
Every tower is now a solid pick, and towers that take longer to unlock hit harder, so each unlock feels like a real step up.

- **Pulse Blaster**: Piercer branch now pierces 2 enemies (was 3) with +15% damage (was +30%).
- **Cryo Emitter**: damage 3 → 4, slow 35% → 45%, slow lasts 2s (was 1.6s).
- **Tesla Coil**: damage 12 → 22, chain jump range increased.
- **Nanite Sprayer**: damage 2 → 4, poison 8 → 12 per second, bigger splash.
- **Drone Bay**: drone HP 60 → 160, drone damage 8 → 26.
- **Credit Miner**: income 25 → 45 credits per wave.
- **Railgun**: damage 70 → 47. It was far ahead of everything else.
- **Amplifier Pylon**: cost 150 → 130, damage boost 15% → 35%, bigger range, Overclock branch +25% fire rate (was +20%). Stacking several pylons on one tower now has diminishing returns past +60%.
- **Orbital Mortar**: damage 34 → 85, fire rate 0.4 → 0.5, bigger blast, minimum range 2.5 → 1.5 tiles. Still can't hit flyers, so pair it with anti-air.
- **Beam Laser**: damage 14 → 17.
- **Reclaimer**: damage 10 → 38, fire rate 0.8 → 1, revive chance 25% → 40% (Legion 60%). Husk damage now scales with the wave.

### Fixed
- Beam Laser (and Arc Lance) lost almost all of their damage against armored enemies because armor was applied to every frame of the beam. Armor now applies to beams like it does to normal shots.

## v1.5.9

### Fixed
- **Tesla Coil lightning now actually chains.** It was only ever hitting its first target. It now jumps to 3 more nearby enemies (7 with Storm Lattice), dealing 15% less damage with each jump.
- Lightning arcs are thicker and stay on screen a little longer, so you can see each jump.

## v1.5.8

### New
- **How to Play guide**: an 11-page guide opens on the main menu the first time you launch the game. It covers the basics, building and upgrading towers, waves and bosses, the expanding map, risk tiles, augments and the shop, combos, veterancy, fusion and overclock, commanders, meta progression, and controls.
- Reopen the guide any time with the new **GUIDE** button on the main menu.

## v1.5.7

### Changed
- Overclock now lasts **10 seconds** (was 5) to make up for its credit cost and the longer overheat.

## v1.5.6

### Changed
- **Overclock now costs credits** (25 + 8 per wave), so it can't be spammed. It can only be used during a wave.
- **Overheating is much longer**: after the 5 second boost the tower shuts down until the end of the *next* wave. Overclock on wave 5 and the tower is offline for the rest of wave 5 and all of wave 6, then back for wave 7. Overheated towers stay overheated if you save and quit between waves.

## v1.5.5

### Changed
- The tower stat breakdown now includes a **location bonus** (purple): buffs from nearby Amplifier Pylons plus the tile the tower stands on (Power Node damage, High Ground range). Full order: base, location, talents, augments, relic, rank, then the total.

## v1.5.4

### Changed
- The tower stat breakdown now also shows your **talent bonus** (cyan): everything from the talent trees, your commander's passive and skill tree, and prestige. The full order is base, talents, augments, relic, rank, then the total, and the numbers multiply exactly to the total.

## v1.5.3

### Changed
- The tower panel now breaks down every bonus on Damage, Rate and Range: base value, then augment bonuses (pink), the installed relic's bonus (in the relic's colour) and the veterancy rank bonus (rank colour), then the total. A small legend shows which colour is which.
- Small stat values show one decimal so totals are exact.
- The tower panel is a little wider so the breakdown fits.

## v1.5.2

### Changed
- Veterancy-boosted stats in the tower panel now show the full breakdown: base value, rank bonus and total (for example `5 +20% = 6`).

## v1.5.1

### Changed
- **Run Again** now starts a new run with the same commander, Heat level and mutators as the run you just finished.
- The tower panel shows your veterancy bonuses next to each boosted stat (Damage, Rate, Range), coloured to match the tower's current rank: bronze, silver or gold.

## v1.5.0

### Changed
- **Commander abilities now recharge over waves instead of seconds** (2-5 waves depending on the ability), so saving them for the waves where you really need them pays off. Buttons show how many waves are left and pulse when ready.
- Tower mastery skins now take longer to earn: Neon at 3,000 kills and Gold at 12,000 kills.

### Visual polish
- Animated synthwave horizon and sun behind the main menu.
- Dithered nebula clouds drifting behind the map.
- Soft neon bloom glow on lights, lasers and explosions (toggle in Settings if your phone struggles).
- Deeper platform undersides and rim lighting on map chunks.
- Shadows under enemies, trails on projectiles, and a rotating shield ring around the core.
- New framed panels with corner brackets, richer buttons, colour-coded HUD chips, and a core health bar.
- Subtle CRT scanlines and vignette, smoother screen and popup transitions, and darker backdrops behind menu screens for readability.

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
