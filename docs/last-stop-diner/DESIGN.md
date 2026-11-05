# Last Stop Diner: Game Design Doc (v0.1 draft)

> A cozy-weird dungeon-delving idle roguelike. You run a greasy-spoon diner on the
> edge of a bottomless pit. Feed drifters, send them down, cook what they bring back.

---

## 1. Pitch

**One-liner:** *Feed the hungry, send them into the pit, cook what they bring back.*

The **Gullet** is a pit at the end of a desert highway that never ends. Nobody has seen
the bottom. The old story is that whoever reaches it gets one wish.

You've just inherited the **Last Stop Diner**, a run-down burger joint on the pit's
rim, from your great-aunt **Dolores**, who disappeared down the Gullet thirty years ago.
Her note says: *"Keep the grill hot. They'll come. Feed them well and they'll go down
for you. Don't let the fire go out."*

Pillars:
1. **Every system is food.** Recruiting, buffs, loot, upgrades and story all run through the kitchen.
2. **Short, readable runs.** A delve is 2–5 minutes to watch; one tap to bail out.
3. **Push your luck.** Deeper is always tempting, and the Dumbwaiter's rope is always just a bit short.
4. **Cozy, weird, warm.** Nobody dies. Monsters are strange, not grim. The diner is a home.

---

## 2. Core loop

```
 ┌──────────── DINER (hub) ─────────────┐
 │ 1. Cook a dish ─► drifters walk in   │
 │ 2. Seat up to 4 at the Booth (party) │
 │ 3. Pack takeout (consumables)        │
 └──────────────┬───────────────────────┘
                ▼
        THE GULLET (delve)
   auto-fight floor after floor
   tap takeout / call Dumbwaiter
                ▼
   Retreat ─► bank tips + ingredients
   Wiped  ─► keep only what's "on the tab" (25%)
                ▼
 ┌──────────── DINER ───────────────────┐
 │ 4. Cook ingredients into new recipes │
 │ 5. Renovate (buildings, staff)       │
 │ 6. Repeat, deeper                    │
 └──────────────────────────────────────┘
```

**Currencies**
| Currency | Source | Spent on |
|---|---|---|
| **Tips** (coins) | Every enemy, chests, floor bonuses | Renovations, gear, basic cooking |
| **Ingredients** | Enemy drops, Pantry Vaults, garden | Recipes (unlock + cook) |
| **Stars** | Prestige ("Closing Time") | Permanent perks |
| **Postcards** | Story drops from Dolores, rare | Lore + secret recipes |

---

## 3. Story

### Why the loop makes sense
| Question | Answer |
|---|---|
| Why do heroes show up? | The highway only leads to the diner. Drifters, dreamers and runaways all end up there hungry. |
| Why do they go down? | Dolores' grill is enchanted: a meal cooked on it gives the eater **Grit**, temporary courage and power. People who eat there feel called to the pit. |
| Why are they disposable? | Every meal comes with a **Fortune Mint**. When a hero falls, the mint pops them back to the diner, alive, broke and scared. They hitchhike home. |
| Why does retreating keep loot? | The **Dumbwaiter**, an old freight lift on a magic rope. It hauls the whole party up with everything they carry, but only from floors within its rope length. |
| Why go deeper? | Better ingredients, and every 25 floors a Pantry Vault with a legendary ingredient Dolores left a note about. |
| Why does the hub grow? | Word spreads. The diner becomes a truck stop, then a town. |

### Cast
- **You** (the Owner): silent-ish protagonist, the cook. Never goes down, at least at first.
- **Dolores** (missing): appears through **Postcards** found in the pit. Funny, cryptic, a bit guilty.
- **Moss**: a talking cactus who works the register. Dry humor, knows more than they say.
- **Jukebox Jo**: a ghost living in the jukebox. Plays a song per biome and gives tips about bosses.
- **Trucker Hal**: delivers supplies and runs the shop. His cargo gets stranger the deeper you go.
- **The Sous-Chef** (rival): a masked cook feeding the monsters from below. Revealed later as Dolores' old apprentice, **Basil**.

### Acts
**Act 1: Opening Day (floors 1–50).** Fix up the diner, learn the loop. Bosses guard
basic ingredients. Postcards hint that Dolores went down on purpose. Ends at the Salt Wyrm.

**Act 2: The Night Menu (floors 51–150).** Monsters are eating *cooked* food, so someone
down there is feeding them. The Sous-Chef appears, taunts you and steals a recipe.
Postcards show Dolores and Basil were partners who fell out. Ends with you beating Basil
in a cook-off battle; Basil reveals that the Gullet is **alive**.

**Act 3: The Bottom of the Stomach (floors 151–200).** The Gullet is the throat of
**the Hunger**, a world-eating creature asleep under the desert. Dolores' grill was
never feeding heroes. It was keeping the Hunger asleep with the smell of good cooking.
Dolores went down to cook it a final meal and never came back. You find her at floor 200,
old and cozy, running a little stall in the Hunger's belly.

**Ending choice:**
- **Lullaby Meal:** cook the perfect dish together and put the Hunger back to sleep for a
  century. Dolores comes home. (Good ending, starts New Game+ "next century".)
- **Feast:** feed it everything and wake it as an ally. Endless mode: the Hunger becomes a
  roaming biome generator.
- **Secret: Open a Branch.** If you've collected all Postcards, open a second Last Stop
  Diner *inside* the Hunger. Unlocks the true post-game.

---

## 4. Recruitment: the Menu

You cook a dish on the grill. The dish decides **who walks in**. Each dish attracts 3–5
drifters of mostly one class; quality (better ingredients, better kitchen) raises their level and traits.

| Dish | Class it attracts | Role | Signature ability |
|---|---|---|---|
| **Double Smash Burger** | **Line Brawler** | Tank / melee | *Grease Slick*: taunts and slows attackers |
| **Hot Wings (Extra Hot)** | **Pyro Punk** | AoE damage | *Ghost Pepper Breath*: cone of fire, burns |
| **Chamomile & Toast** | **Hedge Witch** | Healer | *Warm Cuppa*: heals lowest-HP ally, cleanses |
| **Black Coffee, Bottomless** | **Night Owl** | Fast attacker / crit | *Double Shot*: acts twice every 3rd turn |
| **Chili Bowl** | **Ranch Hand** | Ranged, lasso control | *Lasso*: pulls a backline enemy forward |
| **Blue Plate Special** | **Drifter** | Jack of all trades | *Hustle*: copies the last ally's action at 50% |
| **Pancake Stack** (unlock) | **Short-Order Knight** | Shield tank | *Syrup Wall*: shields the party |
| **Mystery Meatloaf** (unlock) | **Gravedigger** | Necro / summoner | *Leftovers*: raises a defeated enemy for 2 turns |
| **Milkshake Float** (unlock) | **Bubble Bard** | Buffer | *Brain Freeze*: party haste, enemy slow |
| **Midnight Pie** (Act 2) | **Pie-rate** | Gold finder / thief | *Steal a Slice*: steals a buff or extra tips |
| **Desert Taco** (Act 2) | **Sandshaman** | Debuffs, storms | *Dust Devil*: blinds an enemy row |
| **Dolores' Special** (Act 3) | **Gullet Diver** | Elite all-rounder | *Last Call*: once per delve, revives the party at 30% |

**Traits** (random, 0–2 per drifter): *Picky Eater* (+50% stats, double recruit cost),
*Leftover Lover* (heals from takeout twice), *Insomniac* (immune to sleep),
*Clumsy* (10% miss, 10% double hit), *Big Tipper* (+25% tips), *Homesick* (flees below 25% HP),
*Regular* (if they survive 3 delves, they stay on as a permanent hire).

**Regulars** are the progression hook. Most drifters leave after one delve, but a Regular
gets a booth plaque, a name, levels that persist, and bonds with other Regulars.

---

## 5. Party & combat

- **Booth of 4** (upgradeable to 6 with "The Big Booth"): front row 2, back row 2.
- Front row takes most hits; back row is safer but some classes are weak there.
- **Turn order** by Speed, shown as a ticket rail along the top (order tickets).
- Combat is automatic. Player inputs:
  - **Takeout**: tap a packed consumable (up to 4 slots).
  - **Order Up!**: a shared meter that fills with hits; spend it to fire one hero's signature move now.
  - **Ring the Bell**: call the Dumbwaiter (only within rope range).
- **Gambits** (unlocked by the Chalkboard): simple rules per hero, e.g. "Hedge Witch: heal below 40%".

---

## 6. The Gullet (dungeon)

### Floors
- Each floor = 1–3 fights + chance of an event.
- Every **5th floor**: a *Rest Stop* (shop, event, or campfire heal).
- Every **10th floor**: a **Boss**.
- Every **25th floor**: a **Pantry Vault** with a legendary ingredient + Postcard.

### Biomes (25 floors each)
| Floors | Biome | Feel | Enemy examples |
|---|---|---|---|
| 1–25 | **The Crust** | Dry rock, roots, old mine carts | Gravel Grubs, Tumbleweed Mimics, Lost Hikers (sleepwalking, harmless until poked) |
| 26–50 | **Salt Flats** | White crystal caves | Brine Bats, Pickle Slimes, Salt Golems |
| 51–75 | **The Fermentery** | Glowing mushrooms, sour fog | Sourdough Starters (multiply), Kombucha Jellies, Mildew Monks |
| 76–100 | **Grease Trap** | Black oil rivers, rusted pipes | Fat Rats, Sludge Knights, the Drain Choir |
| 101–125 | **The Sugar Mines** | Candy crystal, sticky floors | Gumdrop Goons, Caramel Creepers, Licorice Lashers |
| 126–150 | **Basil's Kitchen** | The rival's lair, giant pots | Ladle Lackeys, Sous-Bots, Raw Eggs (hatch mid-fight) |
| 151–175 | **The Throat** | Living walls, warm wind | Taste Buds (eye creatures), Swallowers, Echo Hunger |
| 176–200 | **The Belly** | Lantern-lit and strangely cozy | Lost things the Hunger swallowed: carousels, ghost trains, a whole lighthouse |
| 200+ | **Seconds** (endless) | Remixed biomes, rising modifiers | Everything, spicier |

### Bosses (every 10 floors; main ones listed)
| Floor | Boss | Gimmick | Drop / unlock |
|---|---|---|---|
| 10 | **Gristle Golem** | Armor that breaks after 3 hits in a row | Grill upgrade (Line Brawler quality) |
| 20 | **Old Prospector** | Throws dynamite at the back row, digs tunnels | Coffee Machine (Night Owl) |
| 25 | *Vault*: Desert Honey | | Chamomile & Toast tier 2 |
| 30 | **Queen Mildew** | Spreads mold stacks; must be cleansed | Fermentation Cellar |
| 50 | **Salt Wyrm** | Burrows; dehydrates heals by 50% | Spice Rack (Pyro Punk tier 2), end of Act 1 |
| 75 | **The Mother Starter** | Splits into 2, 4, 8 sourdough blobs | Bakery wing |
| 100 | **King of the Drain** | Floods the floor; front row slowed | The Big Booth (party of 6) |
| 125 | **Rock Candy Colossus** | Shatters into shards that hit everyone | Dessert Bar |
| 150 | **Basil, the Sous-Chef** | Cooks buffs for his monsters mid-fight; you can "steal" the dish | Dolores' Special recipe, end of Act 2 |
| 175 | **The Uvula** | Swings between rows; screams that silence | Last Postcard |
| 200 | **The Hunger** | A cook-off battle: your party fights while you "plate" ingredients | Ending choice |

### Events (random, ~1 in 4 floors)
- **Lost Hiker:** feed them a takeout box; they give a recruit voucher or a map hint.
- **Vending Machine of Fate:** pay tips, get a random takeout, or a mimic.
- **Dolores' Campsite:** heal + Postcard chance.
- **Food Critic Ghost:** rate your party; a 5-star rating gives a permanent tip bonus for this delve.
- **Basil's Supply Drop** (Act 2): steal ingredients, at the risk of an ambush.

---

## 7. Push your luck: the Dumbwaiter

- The Dumbwaiter has a **rope length** (starts at 10 floors from the last checkpoint; upgrades extend it).
- **Within range:** Ring the Bell and everyone comes up with 100% of loot.
- **Out of range:** you can still walk up, but each floor you climb costs HP; or push on to the next **Pulley Station** (every 25 floors) to reset the rope.
- **Party wipe:** Fortune Mints send everyone home. You keep only what's **on the tab** (25%, upgradeable to 50%).
- **Shortcuts:** each beaten Vault becomes a start point ("Express Elevator to floor 50").

---

## 8. Kitchen: recipes & takeout

Ingredients go into two kinds of cooking:

1. **Recruit dishes** (section 4): cooked on the Grill to attract drifters.
2. **Takeout** (consumables packed for a delve):

| Takeout | Ingredients | Effect |
|---|---|---|
| **Fries Basket** | Potato + Salt | Heal all 20% |
| **Hot Sauce Packet** | Pepper | +30% damage for 3 turns |
| **Iced Tea** | Leaf + Ice | Cleanse + small heal |
| **Fortune Cookie** | Flour + Honey | Random strong effect |
| **Espresso Shot** | Coffee Bean | Party acts first next round |
| **Bento of Courage** | Rice + Salt Wyrm Scale | Revive one hero at 50% |
| **Spite Soup** | Mildew + Brine | Poison all enemies |
| **Doggy Bag** | Any 3 leftovers | Bank 100% of current loot, even if the party wipes |

**Recipe discovery:** combine any 2–3 ingredients at the **Test Kitchen** to discover
recipes (journal of known/unknown slots, like a cookbook with blank pages). Failed dishes
become **Gross Goop**, which can be fed to the diner cat, Meatball, for a small random reward.

---

## 9. The Diner: renovations

Grows visually from a shack to a full roadside town.

| Building | Function | Upgrades |
|---|---|---|
| **Grill** | Cook recruit dishes | Quality tiers → higher-level recruits |
| **Booths** | Party size | 4 → 5 → 6 |
| **Counter** | More drifters per cook (choice of recruits) | 3 → 5 → 7 |
| **Pantry** | Ingredient storage | Capacity, freshness (ingredients don't spoil) |
| **Test Kitchen** | Recipe discovery | More combo slots, hint system |
| **Dumbwaiter** | Retreat | Rope length, "on the tab" % |
| **Gear Locker** | Hand-me-down gear for drifters | Spatula swords, pot-lid shields, apron armor |
| **Chalkboard** | Gambits | More rules, conditions |
| **Garden** | Passive ingredient generation | Plots, rare seeds |
| **Motel Rooms** | Regulars live here | Room count, rest bonuses |
| **Jukebox** | Passive buffs per song | New records from bosses |
| **Neon Sign** | Global recruit quality / attraction | Each tier is a new sign design |
| **Night Shift Booth** | Idle delving | See section 10 |

---

## 10. Idle: the Night Shift

- Unlocked after floor 30: hire **Night Cook Ruby**.
- While the game is closed, Ruby sends an auto-party (from your Regulars or cheap
  Blue Plate drifters) down up to your best floor minus 10, retreating automatically.
- On return: a **morning receipt** that lists floors cleared, tips, ingredients and funny
  one-liners ("Gary the Drifter was eaten by a Pickle Slime and is fine").
- Upgrades: longer shifts, smarter retreat rules, deeper limits.

---

## 11. Prestige: Closing Time

- Unlocked after beating the Salt Wyrm (floor 50).
- **Close the diner for the season**: reset tips, renovations and depth. Keep recipes, Postcards and Regulars (at level 1).
- Gain **Stars** based on depth reached and dishes discovered.
- Spend Stars on the **Star Menu**: permanent perks like +10% tips, start with 1 Regular, longer rope, "Grandma's Secret" (one random takeout free each delve).
- Each season gets a theme from Moss ("Taco Tuesday Season: Desert Tacos are half price").

---

## 12. Art & audio direction

- **16-bit pixel art**, generated in code like Neon Bastion, but in a **warm palette**:
  ketchup red, mustard yellow, mint, chrome, and sunset desert purples.
- The diner at night with a buzzing neon sign is the key art and title screen.
- Each biome shifts palette as you descend (reuse the "sector palette" system).
- **Audio:** jukebox doo-wop and surf rock above ground; each biome gets a lo-fi remix of the diner theme.
  Grill sizzle on hits, a cash register *ka-ching* on tips, a bell ding for Order Up!

---

## 13. UI screens (mobile portrait)

1. **Diner** (hub): scrollable side-view of the building, tap a building to open it.
2. **Grill**: choose a dish → drifters walk in → drag them into the booth.
3. **Pack Takeout**: 4 slots.
4. **Delve**: party on the left, enemies on the right; ticket rail on top; takeout + Order Up! + Bell at the bottom.
5. **Receipt** (results): itemized loot like a diner receipt.
6. **Cookbook**: recipes, ingredients, Postcards.
7. **Booth Plaques**: Regulars, their stats, bonds, stories.

---

## 14. MVP prototype scope

Goal: prove the loop is fun in ~1–2 weeks of building on the Neon Bastion code
(Canvas renderer, pixel sprite generation, save system, Capacitor build).

**In:**
- Diner with Grill, Booths (4), Dumbwaiter, Pantry
- 4 dishes / classes: Line Brawler, Pyro Punk, Hedge Witch, Night Owl
- Floors 1–30: The Crust + start of Salt Flats, 3 bosses (Gristle Golem, Old Prospector, Queen Mildew)
- 4 takeout items
- Retreat / wipe / "on the tab" rules
- Tips + 5 ingredients
- Save/load

**Out (later):** Regulars & bonds, Test Kitchen discovery, Night Shift, Prestige, story beyond Act 1 Postcards, gambits.

**Questions the prototype should answer:**
1. Is a 2–5 minute delve satisfying to watch with only takeout + Bell input?
2. Does the rope-length push-your-luck create real tension?
3. Does "dish → class" recruiting feel like a meaningful choice?

---

## 15. Open questions
- Should the Owner eventually go down personally (a playable "chef" hero in Act 3)?
- Can drifters be "lost" permanently in hardcore mode, or does the game stay fully cozy?
- Daily "Special of the Day" challenge runs with a fixed party?
- How much text/story vs. pure gameplay on mobile?
