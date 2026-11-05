# Last Stop Diner: Game Design Doc (v0.2 draft)

> A comedy dungeon-delving idle roguelike. You run a greasy-spoon diner on the edge
> of a bottomless pit. Feed drifters, send them down, cook what they bring back.
> Everyone involved, including the villains, is kind of just messing around.

---

## 1. Pitch

**One-liner:** *Feed the hungry, send them into the pit, get burped back in time, do it again but better.*

The **Gullet** is a pit at the end of a desert highway with no other exits. Rumor says
whoever reaches the bottom gets one wish. The rumor was started by the bottom.

You've just inherited the **Last Stop Diner** from your great-aunt **Dolores**, who
went down the Gullet thirty years ago "to grab something real quick." Her note says:

> *"Keep the grill hot. They'll come. Feed them and they'll go down for you.
> Don't let the fire go out. Also the cat's name is Meatball, he bites.
> P.S. It's not a pit. You'll see."*

### Pillars
1. **Every system is food.** Recruiting, buffs, loot, upgrades and story all go through the kitchen.
2. **Short, readable runs.** A delve is 2–5 minutes to watch; one tap to bail out.
3. **Push your luck.** Deeper is always tempting; the Dumbwaiter rope is always a bit short.
4. **Nobody takes this seriously.** Not the heroes, not the monsters, not the final boss.
   The comedy is the game's identity, not a coat of paint.

---

## 2. Comedy & meme direction

### Tone
- **Everyone is fully aware this is ridiculous.** Bosses have side hustles, lose interest
  mid-fight, livestream their own boss fights, and ask if you want to "just call it a draw."
- **Villains aren't evil, they're unserious.** The rival chef isn't trying to end the
  world; he's trying to hit 10k followers. The world-eater mostly wants a good meal and to
  leave a review.
- **Cozy, never mean.** Jokes punch at bosses, the Owner and the absurd situation, never at players or real groups.

### How memes fit the setting
Memes are **translated into diner and pit culture**, not pasted in. The Gullet has its own
internet ("the Pitnet") that monsters are terminally online on. The rule: a joke should
make sense to someone who's never seen the meme and land harder for someone who has.

| Meme | In-game version |
|---|---|
| *This is fine* | Skill node and a campfire event where a dog-shaped Lost Hiker sits in a burning booth, relaxed |
| *Stonks* | A gnome merchant in a tiny suit whose prices go up when you look at him |
| *Sus / imposter* | Mimic enemies disguised as party members; the receipt says "Gary was the imposter" |
| *Skill issue* | What the Salt Wyrm says every time it hits you |
| *Ight imma head out* | The animation and voice line when you Ring the Bell to retreat |
| *Press F to pay respects* | Tap F on a fallen drifter's tombstone for +1 tip |
| *Rickroll* | A cursed jukebox record. You will not be warned. |
| *Main character energy* | A drifter trait: always stands front row, refuses to be moved |
| *NPC* | Tumbleweed Mimics that repeat the same 3 lines no matter what happens |
| *Touch grass* | The Garden building's upgrade line |
| *Sigma grindset* | The Gristle Golem's entire personality |
| *Hey hun! MLM* | The Mother Starter boss, recruiting you into a sourdough pyramid |
| *One does not simply* | The Dumbwaiter refusing to go one floor further |
| *Nobody: / Absolutely nobody:* | Loading screen joke template |
| *Distracted partner* | An event where your Hedge Witch gets distracted by a better recruit dish |
| *Rizz* | The recruitment stat (how many drifters show up) |
| *Hold my beer* | *Hold My Milkshake*: drifter trait that doubles damage and drops their takeout |
| *Emotional damage* | A Bubble Bard ability that deals "emotional" damage, ignoring armor |
| *It's free real estate* | The Pantry Vault fanfare |
| *Doomscrolling* | An enemy that hypnotizes heroes by showing them their phone |
| *Number go up* | The prestige skill tree's top-left node. It's +1%. Number go up. |
| *Git gud* | Advice from Jukebox Jo after a wipe |
| *Ok boomer* | What every Night Owl says when Trucker Hal gives advice |
| *Keyboard cat* | Plays you off when the party wipes |

### Meme rules
- **Parody, not copying.** No trademarked or copyrighted characters, logos, or brands. Nod to the meme format, never paste the original image.
- **Mix old and new.** Something for every generation: classic rage-face era, 2010s formats, current slang.
- **Keep it swappable.** All meme lines live in one text/data file so dated jokes can be rotated in updates.
- **Scale it.** About 1 good joke per screen, not 5. Some screens are allowed to be just cozy.

---

## 3. Core loop

```
 ┌──────────── DINER (hub) ─────────────┐
 │ 1. Cook a dish ─► drifters walk in   │
 │ 2. Seat up to 4 at the Booth (party) │
 │ 3. Pack takeout (consumables)        │
 └──────────────┬───────────────────────┘
                ▼
        THE GULLET (delve)
   auto-fight floor after floor
   tap takeout / Ring the Bell
                ▼
   Retreat ─► bank tips + ingredients
   Wiped  ─► keep only what's "on the tab" (25%)
                ▼
 ┌──────────── DINER ───────────────────┐
 │ 4. Cook ingredients into new recipes │
 │ 5. Renovate (buildings, staff)       │
 │ 6. Repeat, deeper                    │
 └──────────────┬───────────────────────┘
                ▼
   Reach the BOTTOM ─► serve the Hunger a meal
   ─► it leaves a review (Stars) ─► THE BIG BURP
   ─► time rewinds to Opening Day ─► spend Stars
      on the Secret Menu (rebirth tree) ─► loop
```

**Currencies**
| Currency | Source | Spent on | Survives rebirth? |
|---|---|---|---|
| **Tips** (coins) | Enemies, chests, floor bonuses | Renovations, gear, cooking | No |
| **Ingredients** | Enemy drops, Pantry Vaults, garden | Recipes and takeout | No |
| **Stars** | The Hunger's review at the bottom | The Secret Menu (rebirth tree) | Yes |
| **Postcards** | Story drops from Dolores | Lore, secret recipes | Yes |
| **Recipes** | Discovered in the Test Kitchen | Unlocked forever once found | Yes |

---

## 4. Story

### The big secret: the pit is a digestive system, and the bottom is a food critic
At the bottom of the Gullet lives **the Hunger**, an ancient, enormous cosmic being who
has eaten 14 worlds and found every one of them "mid." It is bored out of its mind.
It isn't trying to destroy anything. It just wants a really good meal, and it's been
waiting a very long time for someone to cook one.

The pit is literally its throat. The monsters are things it swallowed and didn't
finish digesting. They live down there, form a community, and have their own internet.

### Why rebirth happens: the Big Burp
When your party reaches the bottom, you serve the Hunger a meal. It eats it, considers,
and leaves a **review** (1–5 Stars, shown like a review card on a giant phone).

Then it burps.

The **Big Burp** is a cosmic belch so powerful it blasts everything back up the pit and
**rewinds time to the morning you opened the diner**. The pit "resets" (regenerates new
floors), monsters respawn, your renovations un-happen.

But two things survive the burp:
1. **Your memory** (recipes, Postcards, story progress), because the Owner was holding
   Dolores' **Cookbook**, which is burp-proof (it's laminated).
2. **The review.** Stars are the Hunger's ratings. They stick to you like a smell.
   Stars are your **rebirth points**, spent on the **Secret Menu**.

### Why each loop is different and harder
- The Hunger's taste gets more refined every time it eats. The pit **gets deeper each
  loop** because, in its words, "I'm stretching. Making room for dessert."
  - Loop 1 bottom: floor 50
  - Loop 2: floor 100
  - Loop 3: floor 150
  - Loop 4: floor 200 (story finale)
  - Loop 5+: endless, +25 floors per loop
- Each loop reveals new story, new biomes, new bosses, and new reviews.
- Reviews get pickier: a dish that earned 5 Stars in loop 1 gets 2 Stars in loop 3,
  with a comment like "had this already. bring me something new or don't come back."
  This rewards discovering new recipes instead of repeating one strategy.

### How Stars are earned (the review score)
| Review factor | Example comment |
|---|---|
| **Depth speed** (fewer delves to reach the bottom) | "Fast service. Respect." |
| **Dish quality** (the meal served at the bottom) | "Chef's kiss. Literally, I kissed the chef. Sorry." |
| **New dish** (never served before) | "Something new?? On a TUESDAY??" |
| **Party survival** (Regulars alive) | "Your staff seem happy. Suspicious." |
| **Style bonus** (beat a boss with only takeout, etc.) | "Okay, that was cool." |

### Cast
- **You** (the Owner): the cook. Mostly silent; picks dialogue options that are all slightly unhinged.
- **Dolores** (missing great-aunt): it turns out she reached the bottom 30 years ago, got
  burped, and has been **looping for 30 years**. She's on loop #4,812. She's completely
  chill about it and has started a podcast. Her Postcards are from different loops.
- **Moss**: a talking cactus at the register. Deadpan. Has been through every loop with
  you and remembers them all, but won't say so until loop 3. Reaction: "...so anyway."
- **Jukebox Jo**: a ghost who lives in the jukebox. Plays a song per biome and gives boss
  tips, about half of which are wrong on purpose.
- **Trucker Hal**: shop and supply runs. Thinks the pit is a government cover-up. He's wrong
  but for the right reasons.
- **Meatball**: the cat. Bites. Has a hidden questline. Is possibly the Hunger's cousin.
- **Basil, the Sous-Chef** (rival): Dolores' old apprentice, now a pit-dwelling chef who
  cooks for the monsters and streams it on the Pitnet. Not evil. Wants clout. Has a
  catchphrase he says too often ("And that's how we cook, besties").

### Story arc across loops
**Loop 1: Opening Day (floors 1–50).**
Fix up the diner, learn the loop. Basil appears at floor 30, takes a selfie with your
party, and leaves. At the bottom, the Hunger rates your meal, burps, and you wake up on
opening day again. Moss: "Huh. Weird." Dolores' first Postcard: *"Oh, you got burped.
Welcome to the club. Make the burgers better."*

**Loop 2: Déjà Brew (floors 1–100).**
You know what's coming, but the pit is deeper. Monsters remember you vaguely ("didn't
we do this already?"). Basil is mad that the Hunger rated your food higher than his and
starts trying to **out-cook you** for the Hunger's attention. Postcards reveal that
Dolores is somewhere in the pit, looping too.

**Loop 3: The Collab (floors 1–150).**
Moss admits they remember every loop. Basil proposes a **collab**: if both of you serve
the Hunger together, its review might be 6 Stars, which would let him go viral. You find
Dolores at floor 140 running a pop-up stall for monsters; she's the reason the monsters
have snacks. She joins as a playable legendary Regular.

**Loop 4: Final Course (floors 1–200).**
The full crew (you, Dolores, Basil, Moss, and whatever Meatball is) cooks the Hunger a
perfect meal. The Hunger tastes it and... gives it **5 Stars**, for the first time in
14 worlds. It cries. It burps one last, emotional burp.

**Ending choice:**
- **"Can I get the check?"**: the loop breaks. Dolores comes home. The Hunger retires and
  becomes a food critic on the Pitnet. Credits roll over a montage of the Hunger's reviews of
  other restaurants.
- **"Seconds?"**: the Owner chooses to keep looping. Endless mode unlocks with the
  Hunger as a permanent customer who gets pickier every loop. The real game was the
  friends we fed along the way.
- **Secret: "Franchise."** Collect all Postcards and open a Last Stop Diner *inside* the
  Hunger. Unlocks the post-game and a new hub inside the stomach.

---

## 5. Recruitment: the Menu

You cook a dish on the Grill. The dish decides **who walks in**. Each dish attracts 3–5
drifters of mostly one class; better kitchens raise their level and traits.

| Dish | Class | Role | Signature ability | Personality |
|---|---|---|---|---|
| **Double Smash Burger** | **Line Brawler** | Tank / melee | *Grease Slick*: taunt + slow | Gym bro. Counts reps during fights. |
| **Hot Wings (Extra Hot)** | **Pyro Punk** | AoE damage | *Ghost Pepper Breath*: fire cone | Hasn't blinked since 2019. Sweating. |
| **Chamomile & Toast** | **Hedge Witch** | Healer | *Warm Cuppa*: heal + cleanse | "Have you tried drinking water?" |
| **Bottomless Black Coffee** | **Night Owl** | Fast crit | *Double Shot*: acts twice every 3rd turn | Hasn't slept. Vibrates. Says "ok boomer." |
| **Chili Bowl** | **Ranch Hand** | Ranged, control | *Lasso*: yanks a backliner forward | Says "yeehaw" unironically. |
| **Blue Plate Special** | **Drifter** | All-rounder | *Hustle*: copies an ally at 50% | Has 4 side hustles, 0 income. |
| **Pancake Stack** | **Short-Order Knight** | Shield tank | *Syrup Wall*: party shield | Takes breakfast extremely seriously. |
| **Mystery Meatloaf** | **Gravedigger** | Summoner | *Leftovers*: raises a defeated enemy for 2 turns | Raised enemy just wants to go home. |
| **Milkshake Float** | **Bubble Bard** | Buffer | *Brain Freeze*: haste party, slow enemies; *Emotional Damage* | Rhymes everything, badly. |
| **Midnight Pie** | **Pie-rate** | Gold / thief | *Steal a Slice*: steals buffs, extra tips | Arr. Pie puns only. |
| **Desert Taco** | **Sandshaman** | Debuffs | *Dust Devil*: blinds a row | Talks to his taco. Taco talks back. |
| **Dolores' Special** | **Gullet Diver** | Elite | *Last Call*: once per delve revives the party at 30% | Has done this 4,812 times. Unimpressed. |

**Traits** (0–2 per drifter, all with joke flavor text):
| Trait | Effect | Flavor |
|---|---|---|
| *Main Character Energy* | +20% stats, must be front row | "This is my story actually." |
| *Hold My Milkshake* | 2x damage, 25% chance to drop a takeout | "Watch this." |
| *Picky Eater* | +50% stats, double recruit cost | Sent the burger back twice. |
| *Big Tipper* | +25% tips | Tips in coupons, somehow still valuable. |
| *Ight Imma Head Out* | Flees below 25% HP, keeps the party's loot safe | Already halfway up the rope. |
| *Clumsy* | 10% miss, 10% double hit | Chaos. |
| *Chronically Online* | +damage vs. Pitnet enemies, -damage when grass is near | Ratio'd a Brine Bat. |
| *Lowkey Built Different* | Random stat is doubled | No explanation given. |
| *Regular* | Survive 3 delves, stays forever | Gets a booth plaque and a nickname. |

**Regulars** are the attachment hook. Most drifters leave after one delve, but a Regular gets a
name, persistent levels, bonds and a plaque. They survive rebirth at level 1 (they remember you).

---

## 6. Party & combat

- **Booth of 4** (6 with "The Big Booth"): front row 2, back row 2.
- **Turn order** by Speed, shown as order tickets on a rail along the top.
- Combat is automatic. Player inputs:
  - **Takeout**: tap a packed consumable (up to 4 slots).
  - **Order Up!**: a shared meter; spend it to fire a hero's signature move right now.
  - **Ring the Bell**: call the Dumbwaiter (within rope range). Heroes say "ight imma head out."
- **Gambits** (unlocked by the Chalkboard): simple per-hero rules.
- **Banter:** heroes and enemies comment on fights in speech bubbles (from the swappable joke file).

---

## 7. The Gullet (dungeon)

### Floor structure
- Each floor: 1–3 fights + chance of an event.
- Every **5th floor**: a **Rest Stop** (shop, event or campfire).
- Every **10th floor**: a **Boss**.
- Every **25th floor**: a **Pantry Vault** ("it's free real estate") + **Pulley Station** (resets the rope).
- **The Bottom** (50 / 100 / 150 / 200 / endless): the Hunger.

### Biomes (25 floors each; unlocked as the pit stretches)
| Floors | Biome | Vibe | Enemy examples |
|---|---|---|---|
| 1–25 | **The Crust** | Rocks, roots, old mine carts | Tumbleweed NPCs (3 lines only), Gravel Grubs, Lost Hikers (very lost, keep asking for wifi) |
| 26–50 | **Salt Flats** | Crystal caves of pure salt | Brine Bats (ratio you), Pickle Slimes, Salty Gamers |
| 51–75 | **The Fermentery** | Mushrooms, sour fog | Sourdough Starters (MLM downline), Kombucha Jellies (into wellness), Mildew Monks |
| 76–100 | **Grease Trap** | Oil rivers, rusty pipes | Fat Rats (union workers on break), Sludge Knights, the Drain Choir (only knows one song) |
| 101–125 | **The Sugar Mines** | Candy crystal, sticky floors | Gumdrop Goons, Stonks Gnomes, Caramel Creepers |
| 126–150 | **Basil's Kitchen** | Ring lights, giant pots, a green screen | Ladle Lackeys (Basil's mods), Sous-Bots, Raw Eggs (hatch into angrier eggs) |
| 151–175 | **The Throat** | Living walls, warm wind | Doomscrollers, Taste Buds (eyeball critics), Echo Hungers |
| 176–200 | **The Belly** | Lantern-lit, oddly cozy | Lost things the Hunger swallowed: a carousel, a ghost train, a lighthouse that wants a hug |
| 200+ | **Seconds** (endless) | Remixed biomes | Everything, spicier |

### Bosses (all unserious)
| Floor | Boss | Personality | Fight gimmick | Drop |
|---|---|---|---|---|
| 10 | **Gristle Golem** | Sigma grindset gym bro. Wakes up at 4am to lift other golems. | Armor breaks after 3 hits in a row. Stops mid-fight to drink a protein shake (free turn). | Grill upgrade |
| 20 | **Old Prospector** | Conspiracy theorist. Thinks *you* are the monster. Kinda has a point. | Throws dynamite at the back row; digs tunnels; occasionally pauses to show you his corkboard. | Coffee Machine |
| 30 | **Queen Mildew** | Influencer. Wants you to like and subscribe to her spore content. | Mold stacks that must be cleansed; if you ignore her for 3 turns she gets sad and loses armor. | Fermentation Cellar |
| 40 | **Basil (Encounter 1)** | Takes a selfie with the party. "Content!" | Not a real fight. Leaves after 3 turns. Drops a "promo code." | Rival intro |
| 50 | **Salt Wyrm** | Pro gamer, extremely salty. "Skill issue." "Ez." "Uninstall." | Burrows; salt cuts heals by 50%; rage quits at 10% HP (you still win). | Spice Rack |
| 75 | **The Mother Starter** | "Hey hun!" Sourdough MLM boss recruiting you into her downline. | Splits into 2, 4, 8 blobs; each one tries to sell you essential oils. | Bakery wing |
| 100 | **King of the Drain** | A power-tripping forum moderator of the Pitnet. | Floods the floor; "bans" one hero for 2 turns; can be appealed with a tip. | The Big Booth |
| 125 | **Rock Candy Colossus** | Crypto bro. Diamond hands. Literally, made of crystal. | Shatters into shards when "the market dips" (at 50% HP); HODLs a shield. | Dessert Bar |
| 150 | **Basil, the Sous-Chef** | Livestreaming the fight to his 9,800 followers. | Cooks buffs for his monsters; you can steal the dish. If chat votes for you, he gets nerfed. | Dolores' Special |
| 175 | **The Uvula** | Hype-man for the Hunger. Very loud. Brought a mic. | Swings between rows; screams that silence; drops the mic when defeated (it's an item). | Last Postcard |
| Bottom | **The Hunger** | A bored cosmic food critic. Scrolls its phone during the fight. | Not a fight: a **plating minigame** while your party fends off snacks it flicks at you. Ends with the review. | Stars + Big Burp |

### Events (~1 in 4 floors)
- **This Is Fine Campfire**: a calm dog-like Lost Hiker in a burning booth. Heal fully, but a random item gets toasted.
- **Vending Machine of Fate**: pay tips for a random takeout. 10% chance it's a mimic. 1% chance it's a Rickroll.
- **Stonks Gnome**: sells items; prices go up every time you check them. Leave and come back to "buy the dip."
- **The Imposter**: one party member is a mimic. Pick who's sus. Guess right: loot. Guess wrong: awkward.
- **Food Critic Ghost**: rates your party's drip; 5 stars gives a tip bonus for this delve.
- **Dolores' Campsite**: heal + Postcard chance. Sometimes she's there, eating your fries.
- **Basil's Sponsored Segment**: Basil offers a buff if your party reads his ad. They can refuse.
- **Lost Wifi Hiker**: give them a takeout and they'll give you a map hint. They wanted wifi though.

---

## 8. Push your luck: the Dumbwaiter

- The Dumbwaiter has a **rope length** (starts at 10 floors; upgrades extend it). It refuses to go further: "One does not simply."
- **Within range:** Ring the Bell and everyone comes up with 100% of the loot.
- **Out of range:** walk up (each floor costs HP), or push on to the next **Pulley Station** (every 25 floors).
- **Party wipe:** Fortune Mints pop everyone home, Keyboard Cat plays you off. You keep only what's **on the tab** (25%, upgradeable).
- **Shortcuts:** each Pulley Station reached becomes a start point for the rest of this loop.

---

## 9. Kitchen: recipes & takeout

**Takeout** (consumables packed for a delve):
| Takeout | Ingredients | Effect |
|---|---|---|
| **Fries Basket** | Potato + Salt | Heal all 20% |
| **Hot Sauce Packet** | Pepper | +30% damage, 3 turns |
| **Iced Tea** | Leaf + Ice | Cleanse + small heal |
| **Fortune Cookie** | Flour + Honey | Random strong effect; fortune is always a meme |
| **Espresso Shot** | Coffee Bean | Party acts first next round |
| **Bento of Courage** | Rice + Salt Wyrm Scale | Revive one hero at 50% |
| **Spite Soup** | Mildew + Brine | Poison all enemies |
| **Doggy Bag** | Any 3 leftovers | Bank 100% of current loot even if the party wipes |

**Test Kitchen**: combine any 2–3 ingredients to discover recipes. Failed dishes become
**Gross Goop**; feed it to Meatball for a random reward ("Meatball has eaten the goop. Meatball is stronger now.").

---

## 10. The Diner: renovations (reset each loop)

| Building | Function | Upgrades |
|---|---|---|
| **Grill** | Cook recruit dishes | Quality tiers |
| **Booths** | Party size | 4 → 5 → 6 |
| **Counter** | More drifters per cook ("Rizz") | 3 → 5 → 7 |
| **Pantry** | Ingredient storage | Capacity |
| **Test Kitchen** | Recipe discovery | More slots, hints |
| **Dumbwaiter** | Retreat | Rope length, on-the-tab % |
| **Gear Locker** | Hand-me-down gear | Spatula swords, pot-lid shields |
| **Chalkboard** | Gambits | More rules |
| **Garden** | Passive ingredients | "Touch Grass" tiers |
| **Motel Rooms** | Regulars live here | Room count |
| **Jukebox** | Passive buffs per song | Records from bosses |
| **Neon Sign** | Global recruit quality | Each tier is a funnier sign ("EAT", "EAT HERE", "EAT HERE OR ELSE") |
| **Night Shift Booth** | Idle delving | Shift length, depth |

**Night Shift** (idle): hire **Night Cook Ruby**, who sends auto-parties down while the game is
closed. On return: a **morning receipt** with loot and one-liners ("Gary was eaten by a Pickle Slime.
Gary is fine. Gary would like a refund.").

---

## 11. Rebirth: the Big Burp & the Secret Menu

### Flow
1. Reach the Bottom and beat the Hunger's plating challenge.
2. The Hunger leaves its review (1–5 Stars, plus bonus Stars from review factors, see section 4).
3. **The Big Burp** cutscene: everything gets blasted up the pit and time rewinds.
4. Wake up on Opening Day. Moss: "...so anyway."
5. Spend Stars on the **Secret Menu**, then start the next loop (deeper pit, new story).

You can also **burp early** after reaching floor 50 at least once: eat a **Sus Burrito** at the
diner to force a rebirth with a reduced review ("didn't even finish. 1 star."). This prevents
being stuck in a bad loop.

### What resets / what stays
| Resets | Stays |
|---|---|
| Tips, ingredients | Stars, Secret Menu nodes |
| Renovations | Recipes discovered |
| Floor progress, shortcuts | Postcards, story progress |
| Takeout inventory | Regulars (back to level 1) |
| | Cosmetics, sign designs, jukebox records |

### The Secret Menu (rebirth skill tree)
Laid out like a diner menu board with five sections. Nodes cost 1–10 Stars; each section has a capstone.

**Appetizers: Economy**
| Node | Effect |
|---|---|
| *Number Go Up* | +1% tips. That's it. Number go up. (Stacks 10 times) |
| *Stonks* | +15% tips |
| *Not Stonks* | Shop prices -10% |
| *Tip Jar* | Start each loop with 500 tips |
| *Free Refills* | Recruit dishes have a 20% chance to be free |
| **Capstone: *Passive Income*** | Earn tips while the game is closed, even without the Night Shift |

**Entrées: Combat**
| Node | Effect |
|---|---|
| *Built Different* | +10% HP for all heroes |
| *Skill Issue* | +10% damage (also on enemies you've lost to before) |
| *This Is Fine* | Heroes below 20% HP take 30% less damage |
| *Emotional Damage* | 5% of damage ignores armor |
| *Git Gud* | +5% crit per wipe this loop (max 25%) |
| **Capstone: *Final Boss Music*** | When only one hero is left, they get +100% stats and the music changes |

**Sides: Recruiting**
| Node | Effect |
|---|---|
| *Rizz* | +1 drifter per cook |
| *Main Character Arc* | Drifters have a +10% chance to roll a good trait |
| *Regular's Discount* | Regulars start each loop at level 5 instead of 1 |
| *Word of Mouth* | Start each loop with the Grill at tier 2 |
| *Squad Goals* | +5% stats per Regular in the party |
| **Capstone: *The Gang's All Here*** | Start each loop with one Regular from every class you've unlocked |

**Drinks: The Pit & Dumbwaiter**
| Node | Effect |
|---|---|
| *Ight Imma Head Out* | Rope length +5 floors |
| *On the Tab* | Wipe keeps +10% more loot |
| *Speedrun Strats* | Start each loop at your previous loop's halfway point |
| *Any% Glitch* | Bosses you've beaten in a previous loop have -15% HP |
| *Night Owl Shift* | Night Shift goes 25% deeper |
| **Capstone: *Skip the Cutscene*** | One free "teleport to a Pulley Station" per loop |

**Desserts: Weird Stuff**
| Node | Effect |
|---|---|
| *Press F* | Fallen drifters give +5 tips each |
| *Sus* | You can spot mimics; they're highlighted |
| *Meatball Approves* | Gross Goop rewards are always good |
| *Rickroll Immunity* | The cursed record becomes a buff |
| *Lore Accurate* | Postcards appear 2x more often |
| **Capstone: *The Hunger's Favorite*** | The Hunger's reviews are always at least 3 Stars. "you again? ok fine, you're my fav." |

### Star pacing (target)
| Loop | Expected Stars | Unlocks |
|---|---|---|
| 1 | 3–6 | A few Appetizers/Entrées |
| 2 | 6–10 | First capstone within reach |
| 3 | 10–15 | Most of one section |
| 4 (finale) | 15–20 | Two capstones |
| Endless | 5–25 per loop | Ranks: every node can be upgraded to rank II, III ("Large", "Extra Large", "Supersize Me Please") |

---

## 12. Art & audio direction

- **16-bit pixel art**, generated in code like Neon Bastion, in a **warm diner palette**:
  ketchup red, mustard yellow, mint, chrome, sunset purple.
- Comedic animation timing: bosses pause for reaction shots, heroes do victory poses
  with slightly too much commitment.
- **Audio:** jukebox doo-wop and surf rock above ground; each biome gets a lo-fi remix of the
  diner theme. Comedy SFX: vine-boom-style bass hit on crits (original sound), cash
  register on tips, a sad trombone on wipes, a cosmic burp that shakes the screen.

---

## 13. UI screens (mobile portrait)

1. **Diner** (hub): side-scrolling view of the building; tap a building to open it.
2. **Grill**: pick a dish → drifters walk in → drag them into the Booth.
3. **Pack Takeout**: 4 slots.
4. **Delve**: party left, enemies right, ticket rail on top; takeout + Order Up! + Bell at the bottom; banter bubbles.
5. **Receipt**: itemized loot with joke line items ("1x emotional damage .......... $0.00").
6. **The Review**: the Hunger's phone screen with stars and a comment.
7. **Secret Menu**: rebirth tree, styled as a diner menu board.
8. **Cookbook**: recipes, ingredients, Postcards.
9. **Booth Plaques**: Regulars and their stories.

---

## 14. MVP prototype scope

Goal: prove the full loop, **including one rebirth**, in about 1–2 weeks, built on the Neon
Bastion code (Canvas renderer, pixel sprite generation, save system, Capacitor build).

**In:**
- Diner with Grill, Booths (4), Dumbwaiter, Pantry
- 4 classes: Line Brawler, Pyro Punk, Hedge Witch, Night Owl
- Floors 1–50 (Crust + Salt Flats), bosses: Gristle Golem, Old Prospector, Queen Mildew, Salt Wyrm
- The Hunger (simple version), review screen, Big Burp, one loop reset
- Secret Menu with ~10 nodes (2 per section)
- 4 takeout items; retreat / wipe / on-the-tab rules
- Joke/banter data file with ~100 lines
- Save/load

**Out (later):** Regulars & bonds, Test Kitchen discovery, Night Shift, loops 2–4 story, gambits, events beyond 3.

**Questions the prototype should answer:**
1. Is a 2–5 minute delve fun to watch with only takeout + Bell input?
2. Does rope length create real tension?
3. Does the Big Burp feel like a reward instead of a loss?
4. Do the jokes land, and is the joke density right?

---

## 15. Open questions
- Should the Owner become a playable hero in loop 4?
- Should players be able to share the Hunger's reviews as images (good for virality)?
- How often should the joke file update (live seasonal memes)?
- Daily "Special of the Day" challenge with a fixed party and a leaderboard for review score?
