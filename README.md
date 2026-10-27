# Neon Bastion

A 16-bit sci-fi **endless tower defense roguelike** for Android, built with plain
HTML5 Canvas + JavaScript (no build step) and packaged as an APK with Capacitor.

All of the art is generated in code: every sprite is a pixel pattern rendered at a low
resolution and scaled up with nearest-neighbour filtering, with neon glow effects.

## Gameplay

- **Expanding map**: you start with a tiny map around your core. Every 3 waves (and
  after each boss) you pick 1 of 3 map **chunks** and attach it to an open enemy portal.
  - Chunk types: Conduit, Elbow, Braided Lanes (path splits and re-merges), Serpent Coil,
    Fork (+1 portal), Crossroads (+2 portals), Sealed Bulkhead (closes a portal).
  - Terrain modifiers: High Ground (+25% range), Coolant Spill (slows enemies), Asteroid
    Fields (unbuildable), Data Caches (tap for loot), Power Nodes (+30% damage).
  - The neon palette shifts every 10 waves (sectors), so you can see your map's history.
  - **Risk tiles** trade danger for loot. *Rift Conduits* and *Ion Accelerators* buff
    only the enemies that cross them (more HP / speed) but those enemies drop far more
    credits. *Shard Obelisks* and *Bounty Beacons* buff every enemy for shards or credits.
- **Themed sectors**: each new neon sector (every 10 waves) introduces new enemy types.
  The first time you meet one, an intel screen shows its art, stats, and abilities, plus
  which towers are strong and weak against it. Look it up again any time in the Codex.
- **Endless waves** with a **boss every 10 waves**:
  The Bulwark (shield with a rotating weakness type), Hive Mother (spawns minions),
  Disruptor (EMP disables towers), Phase Stalker (teleports), Leviathan (flying titan).
- **Elite waves** every 5 waves from wave 15 (Armored, Overdriven, Regenerating,
  Cloaked, Shielded, Titan).
- **Between waves**: pick augments (1 of 3), visit the Black Market (rerolls double in
  price each time; augments get pricier per copy owned), or hit random
  events (Derelict Signal, Void Altar, Wandering Merchant, Black Market Chip...).
- **12 towers**, each with 3 levels and then a **branch choice** (A or B). Every level
  looks a little more advanced, and each branch has its own sprite and color:
  Pulse Blaster, Plasma Cannon, Cryo Emitter, Tesla Coil, Nanite Sprayer, Railgun,
  Drone Bay, Credit Miner, Amplifier Pylon, Orbital Mortar, Beam Laser, Reclaimer.
- **Combos**: Shatter (Cryo + Tesla), Detonation (Nanite + explosions),
  Conductor (Tesla + Railgun), Thermal Shock (Cryo + Laser).

## Meta progression (saved between runs)

- Account **XP and levels**; each level gives a **talent point**.
- **Three themed talent trees** (Offense / Economy / Fortitude) **plus a mini tree for
  every tower**, all paid for with the same talent points. Free respec.
- **Void Shards** (dropped by bosses, elites, caches, and end-of-run rewards) unlock
  towers in the Armory and **Commanders** (each with a passive and a signature tower).
- **Heat levels** (ascension): reach wave 20 to unlock harder runs with bigger rewards.
- **Codex**: bestiary, bosses, combos, augments, and achievements (which award shards).
- Runs auto-save between waves, so you can quit and continue later.

## Controls

- Tap a tower in the bottom bar, tap a tile to preview its range, then tap the same tile again to build.
- Tap a built tower to upgrade it, pick its branch, change its targeting, or sell it.
- Drag to pan. Pinch to zoom (or use the mouse wheel on desktop).
- `1x/2x/3x` sets game speed. `AUTO` starts waves automatically. The Android back button pauses the game.

## Running it on your phone with Termux

### Play it right away in the browser

```sh
pkg update && pkg install git python
git clone https://github.com/quinn1005/Roguelike-App.git
cd Roguelike-App
git checkout claude/pixel-roguelike-tower-defense-924lht
python -m http.server 8080 --directory www
```

Then open **http://localhost:8080** in Chrome and rotate to landscape. In Chrome's
menu, choose *Add to Home screen* to get a fullscreen launcher icon.
(The game uses ES modules, so it has to be served over http; opening the file directly won't work.)

### Get the installable APK

Every push to GitHub runs the **Build Android APK** workflow
(`.github/workflows/build-apk.yml`):

1. On GitHub, open the repo, go to the **Actions** tab, and open the latest **Build Android APK** run.
2. Download the **neon-bastion-apk** artifact (a zip) and unzip it.
3. Open `app-debug.apk` on your phone and allow installing from unknown sources.

### Editing the game from Termux

```sh
pkg install nano gh   # or use the Acode editor app
gh auth login         # one-time GitHub login so you can push
nano www/js/defs.js   # e.g. tweak tower stats
git add -A && git commit -m "Tweak towers" && git push
```

Refresh the browser tab to see web changes immediately. Each push also builds a fresh APK.

## Project layout

```
www/                    the whole game (served as-is, no build step)
  index.html, style.css
  fonts/                Press Start 2P pixel font (OFL licensed)
  js/main.js            game loop, input, glue
  js/game.js            run simulation: waves, towers, combat, rewards, save/load
  js/world.js           chunk generation, map expansion, enemy routes, portals
  js/render.js          low-res pixel renderer and effects
  js/sprites.js         procedural pixel art (towers, enemies, bosses, tiles)
  js/defs.js            content: towers, enemies, bosses, augments, chunks, events
  js/meta.js            persistent progression: talents, commanders, heat, achievements
  js/ui.js              menus, HUD, tower panel, choice screens
  js/audio.js           synthesized chiptune sound effects
resources/              icon + splash used to generate Android assets
capacitor.config.json   Android wrapper config
```

## Building the APK yourself (on a PC)

Requires Node 20+, JDK 21, and the Android SDK:

```sh
npm install
npx cap add android
npx @capacitor/assets generate --android
npx cap sync android
cd android && ./gradlew assembleDebug
```
