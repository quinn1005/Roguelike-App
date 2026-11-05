# Last Stop Diner

A comedy dungeon-delving roguelike: feed random walk-ins at an all-night diner in a
neon wizard city, send them down a bottomless pit, and bring back meme loot.

Design doc: [`docs/last-stop-diner/DESIGN.md`](../docs/last-stop-diner/DESIGN.md)

## Run it

No build step. Serve the `www` folder and open it in a browser (landscape):

```
python3 -m http.server 8090 --directory diner/www
```

Then open http://localhost:8090.

## Milestone 2: Kitchen Nightmares (current)

- Walk around inside the diner; everything is a tappable spot (kitchen, dumbwaiter, locker, register, jukebox, door)
- Recruit from the customers eating there; serve a cooked dish at the register to choose who walks in
- Cooking mini-game: pick 2-5 ingredients, then Chop, Cook, Season and Plate, each graded
- Generated meme dishes with flavors, stats and quirks; Recipe Book with Quick Cook; Fridge
- Dishes work as recruit meals or as takeout during delves
- Auto or turn-based battles

## Milestone 1: Fight Night

- Random walk-ins every delve (name, job, bio, class, traits, look)
- Gear Up: 4 equipment slots per walk-in, gear is visible on the characters
- The counter: buy takeout, pick a start floor (Pulley Stations every 10 floors)
- Long delves through the Gutter: several fights per floor, rest stops, Gristle Golem boss every 10 floors
- Auto-battle with Order Up!, takeout, Ring the Bell, rope length, wipe rules ("on the tab")
- Loot: tips, meme gear, ingredients, monster parts, junk, mana shards
- Diner: Locker, Lou's Pawn & Prawn, Blacksmith (upgrade +1..+10, forge from parts), Pantry
- Saves to the browser (localStorage)

Code: `js/core.js` (engine), `js/data.js` (content), `js/puppets.js` (characters),
`js/render.js` (scenes and lighting), `js/battle.js` (delves and combat), `js/game.js` (screens).
