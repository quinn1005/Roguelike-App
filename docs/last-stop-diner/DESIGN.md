# Last Stop Diner: Game Design Doc (v0.3, Neon Arcana)

> A comedy dungeon-delving idle roguelike in a rain-soaked city where wizards run on neon.
> You run an all-night diner on the edge of a bottomless pit. Feed drifters, send them
> down, cook what they bring back, get burped back in time, do it again but better.

**How to review:** every idea has a number like **[4.3]**. Reply with what to cut, change or
keep, e.g. "cut 7.4 and 12.6, change 9.2, keep everything else."

Art style: **Hi-bit Deluxe (style D)** in the **Neon Arcana** theme (fantasy × cyberpunk).
Orientation: **landscape only**. Platform: Android (Capacitor) + web, same stack as Neon Bastion.

---

## 1. Setting & tone

**[1.1] The city: Rimside.** A vertical, always-raining city built around the rim of the Gullet,
a bottomless pit. Medieval timber taverns stacked under neon-lit wizard towers, cobblestone
streets with wet reflections, rune signs, cauldrons of green fire.

**[1.2] Mana is electricity.** Magic leaks up out of the pit as glowing vapor. The city
condenses it into neon tubes and runs everything on it: signs, trams, spellphones, the Pitnet.
That's why the whole city looks the way it does.

**[1.3] It always rains** because the pit exhales warm steam that rains back down. Locals call
it "pit drizzle." Umbrellas are a status symbol.

**[1.4] ArcDyne.** The megacorp (a wizard guild that incorporated) that pumps mana out of the
pit. Its executives are archmages in suits. They are not evil, just extremely corporate:
everything has a subscription, a terms-of-service scroll and a loyalty program.

**[1.5] The Pitnet.** The city's magic internet, accessed through spellphones (crystal balls
with apps). Monsters in the pit are terminally online on it too. This is where most meme humor lives.

**[1.6] Tone rules.**
- Everyone knows this is ridiculous. Bosses have side hustles, livestream their own fights,
  get bored mid-battle and ask for a draw.
- Villains are unserious, not evil. They want clout, quarterly numbers, or a good meal.
- Cozy, never mean. Jokes punch at bosses, corporations and the absurd situation, not at players or real groups.

**[1.7] Meme rules.** Memes are translated into Rimside culture, never pasted in. No real
characters, logos or brands. Mix old and new. All joke text lives in one swappable data file
so dated jokes can be rotated. About one good joke per screen.

---

## 2. Story

**[2.1] Premise.** You inherit the **Last Stop Diner** from your great-aunt **Dolores**, a
retired battle-wizard who went down the Gullet thirty years ago "to grab something real quick."
Her note: *"Keep the cauldron lit. They'll come. Feed them and they'll go down for you.
The cat's name is Meatball, he bites. P.S. It's not a pit. You'll see."*

**[2.2] The secret: the pit is a throat, and the bottom is a food critic.** At the bottom lives
**the Hunger**, an ancient cosmic being that has eaten 14 worlds and found them all "mid."
The mana the city runs on is literally its breath. It isn't trying to destroy anything. It's bored
and wants one really good meal.

**[2.3] Why heroes show up.** Dolores' cauldron is enchanted. A meal cooked in it gives the
eater **Grit**: temporary courage and power. Anyone who eats there feels the pull of the pit.

**[2.4] Why nobody really dies.** Every meal comes with a **Fortune Mint** (a little enchanted
mint on the receipt). When a hero falls, it teleports them back to the diner, alive, broke and
embarrassed. They take the tram home.

**[2.5] Why retreating keeps loot.** The **Dumbwaiter**: an old service lift on an enchanted
rope that hauls the party and everything they carry back up, but only from within its rope length.

**[2.6] Why you rebirth: the Big Burp.** At the bottom you serve the Hunger a meal. It leaves a
**review** (stars, on its giant spellphone), then burps. The cosmic burp blasts everything back up
the pit and **rewinds time to the night you opened the diner**. You keep your memory because
Dolores' **Cookbook** is burp-proof (it's laminated). The **Stars** from the review stick to you
and are your **rebirth points**.

**[2.7] Why each loop is deeper and harder.** The Hunger's taste gets more refined every meal,
and the pit stretches ("making room for dessert"). Bottom at floor 50, then 100, 150, 200
(finale), then endless. It also gets pickier: dishes it has already eaten score lower.

**[2.8] ArcDyne's angle.** ArcDyne has noticed the pit's mana output spikes every time someone
cooks a great meal down there. They want to buy your diner, franchise it, and put the Hunger on a
subscription plan. They send increasingly absurd corporate wizards to "acquire" you.

### Cast
**[2.9] You, the Owner.** The cook. Mostly silent; picks dialogue options that are all slightly unhinged.

**[2.10] Dolores.** Reached the bottom 30 years ago, got burped, and has been **looping ever since**
(loop #4,812). Totally chill about it. Runs a podcast on the Pitnet. Her Postcards come from different loops.

**[2.11] Moss.** A talking cactus at the register, with a cracked spellphone. Deadpan. Remembers
every loop but won't admit it until loop 3. Signature line: "...so anyway."

**[2.12] Jukebox Jo.** A ghost living in a rune-jukebox. Plays a track per biome and gives boss
tips, about half of them wrong on purpose.

**[2.13] Courier Hal.** Runs supply drops on a hover-cart and runs the shop. Thinks the pit is an
ArcDyne cover-up. He's wrong, but for the right reasons.

**[2.14] Meatball.** The cat. Bites. Hidden questline. Possibly the Hunger's cousin.

**[2.15] Basil, the Sous-Chef.** Dolores' old apprentice, now a pit-dwelling chef who cooks for the
monsters and streams it on the Pitnet, sponsored by ArcDyne. Not evil, wants clout. Catchphrase:
"and that's how we cook, besties."

**[2.16] Vice President Glimmerstone.** ArcDyne's acquisitions archmage. Recurring comic villain who
shows up with hostile-takeover paperwork, NDAs written on cursed scrolls, and a "synergy" spell
that does nothing.

### Arc
**[2.17] Loop 1: Opening Night (floors 1–50).** Fix the diner, learn the loop. Basil takes a
selfie with your party at floor 40. First Big Burp. Dolores' Postcard: *"Oh, you got burped.
Welcome to the club. Make the food better."*

**[2.18] Loop 2: Déjà Brew (1–100).** Monsters vaguely remember you. Basil is furious the Hunger
rated you higher and starts competing. ArcDyne sends Glimmerstone with a buyout offer.

**[2.19] Loop 3: The Collab (1–150).** Moss admits they remember. Basil proposes a collab for a
6-star review (he wants to go viral). You find Dolores at floor 140 running a pop-up stall for
monsters; she joins as a legendary Regular. ArcDyne tries to install a mana pump in the Hunger.

**[2.20] Loop 4: Final Course (1–200).** You, Dolores, Basil, Moss and Meatball cook the perfect
meal while fending off ArcDyne's pump. The Hunger gives 5 stars for the first time in 14 worlds and cries.

**[2.21] Endings.**
- *"Can I get the check?"*: the loop breaks, Dolores comes home, the Hunger retires to be a food critic on the Pitnet.
- *"Seconds?"*: keep looping. Endless mode, and the Hunger gets pickier forever.
- *Secret, "Franchise"*: collect every Postcard and open a Last Stop Diner *inside* the Hunger. New hub, post-game.
- *Joke ending, "Sell Out"*: accept ArcDyne's buyout. The game ends in 30 seconds with a corporate jingle, and the credits are a terms-of-service scroll.

---

## 3. Core loop

**[3.1] The loop.**
1. **Cook** a dish in the cauldron → drifters walk in.
2. **Seat** up to 4 in the Booth (your party) and pack **Takeout** (consumables).
3. **Delve**: the party auto-fights floor after floor while you watch.
4. **Push or bail**: Ring the Bell to retreat with all loot, or keep going.
5. **Spend** tips and ingredients on recipes and renovations.
6. Reach the **Bottom** → serve the Hunger → **Review** → **Big Burp** → spend Stars → repeat.

**[3.2] Currencies.**
| Currency | From | Spent on | Survives rebirth |
|---|---|---|---|
| Tips (coins) | Enemies, chests | Renovations, gear, cooking | No |
| Ingredients | Drops, Vaults, garden | Recipes, takeout | No |
| Mana Shards | Rare drops, bosses | Enchanting gear, neon upgrades | No |
| Stars | The Hunger's review | Secret Menu (rebirth tree) | Yes |
| Postcards | Story drops | Lore, secret recipes | Yes |
| Recipes | Test Kitchen discovery | Unlocked forever | Yes |

**[3.3] Pacing targets.** A delve is 2–5 minutes to watch. Loop 1 takes about 1–2 hours; later
loops take about as long thanks to rebirth upgrades.

---

## 4. Recruiting: the Menu

**[4.1] The dish decides who walks in.** Each dish attracts 3–5 drifters of mostly one class.
Better kitchens raise their level and trait odds.

| ID | Dish | Class | Role | Signature | Personality |
|---|---|---|---|---|---|
| **[4.2]** | Double Smash Burger | **Line Brawler** | Tank / melee | *Grease Slick*: taunt + slow | Gym bro with a cyber-arm. Counts reps mid-fight. |
| **[4.3]** | Dragon Wings (Extra Hot) | **Pyro Punk** | AoE fire | *Ghost Pepper Breath*: fire cone | Fire mage with a mohawk. Hasn't blinked since 2019. |
| **[4.4]** | Chamomile & Toast | **Hedge Witch** | Healer | *Warm Cuppa*: heal + cleanse | Casts spells from her spellphone. "Have you tried drinking water?" |
| **[4.5]** | Bottomless Void Coffee | **Night Owl** | Fast crit rogue | *Double Shot*: acts twice every 3rd turn | Netrunner thief. Has not slept. Says "ok boomer." |
| **[4.6]** | Chili Bowl | **Chrome Cowboy** | Ranged control | *Lasso*: yanks a backliner forward | Neon lasso, says "yeehaw" unironically. |
| **[4.7]** | Blue Plate Special | **Drifter** | All-rounder | *Hustle*: copies an ally at 50% | Four side hustles, zero income. |
| **[4.8]** | Pancake Stack | **Short-Order Knight** | Shield tank | *Syrup Wall*: party shield | Takes breakfast extremely seriously. |
| **[4.9]** | Mystery Meatloaf | **Gravedigger** | Summoner | *Leftovers*: raises a defeated enemy for 2 turns | The raised enemy just wants to go home. |
| **[4.10]** | Mana Milkshake | **Bubble Bard** | Buffer | *Brain Freeze* haste/slow; *Emotional Damage* | Synth-lute. Rhymes everything, badly. |
| **[4.11]** | Midnight Pie | **Pie-rate** | Gold / thief | *Steal a Slice*: steals buffs and tips | Sky-pirate. Pie puns only. |
| **[4.12]** | Rune Taco | **Glitch Shaman** | Debuffs | *Bluescreen*: blinds a row | Talks to his taco. The taco talks back. |
| **[4.13]** | Dolores' Special | **Gullet Diver** | Elite | *Last Call*: once per delve, revives the party at 30% | Has done this 4,812 times. Unimpressed. |

**[4.14] Traits** (0–2 per drifter):
| Trait | Effect |
|---|---|
| *Main Character Energy* | +20% stats, must be front row |
| *Hold My Milkshake* | 2× damage, 25% chance to drop a takeout |
| *Picky Eater* | +50% stats, double recruit cost |
| *Big Tipper* | +25% tips |
| *Ight Imma Head Out* | Flees below 25% HP, keeps party loot safe |
| *Clumsy* | 10% miss, 10% double hit |
| *Chronically Online* | +damage vs. Pitnet enemies |
| *Lowkey Built Different* | One random stat doubled |
| *Terms & Conditions Apply* | ArcDyne-sponsored: +30% stats, but reads an ad aloud every few turns (skips a turn) |
| *Regular* | Survives 3 delves → stays forever |

**[4.15] Regulars.** Most drifters leave after one delve. A Regular gets a name, a booth plaque,
persistent levels and bonds, and survives rebirth at level 1.

**[4.16] Bonds.** Regulars who delve together unlock duo combo moves
(e.g. Pyro Punk + Line Brawler = *Flambé*: the Brawler throws a flaming pan).

**[4.17] School synergies.** Each drifter also has a magic **School** (Pyre, Hex, Chrome, Brew, Void).
2 or 4 of the same School in a party grants a bonus, auto-battler style.

**[4.18] Merge duplicates.** Three drifters of the same class merge into one ★2 drifter.

---

## 5. Combat

**[5.1] Booth formation.** 4 seats (6 later): front row 2, back row 2. Front takes most hits.

**[5.2] Turn order** by Speed, shown as order tickets on a rail along the top.

**[5.3] Player inputs during auto-combat:**
- **Takeout**: tap a packed consumable (up to 4 slots, bottom-left).
- **Order Up!**: a shared meter that fills as you fight; spend it to fire one hero's signature move now (bottom-right).
- **Ring the Bell**: call the Dumbwaiter and retreat (bottom-right). Heroes say "ight imma head out."

**[5.4] Gambits** (unlocked via the Chalkboard): simple rules per hero, e.g. "Hedge Witch: heal below 40%."

**[5.5] Banter.** Heroes and enemies trash-talk in speech bubbles, pulled from the joke file.

**[5.6] Elements.** Fire, Frost, Hex, Chrome, Grease. Enemy weaknesses show in the Codex once discovered.

**[5.7] Speed controls.** 1×, 2×, 4× (4× unlocked by the Espresso Machine renovation).

---

## 6. The Gullet (dungeon)

**[6.1] Floor structure.** Each floor: 1–3 fights plus a chance of an event. Every 5th floor:
**Rest Stop** (shop, event or campfire). Every 10th: **Boss**. Every 25th: **Pantry Vault** +
**Pulley Station** (resets the rope). The Bottom: the Hunger.

**[6.2] Biomes** (25 floors each, unlocked as the pit stretches):
| Floors | Biome | Vibe | Enemy examples |
|---|---|---|---|
| 1–25 | **The Gutter** | City sewers and old mana pipes | Tumbleweed NPCs (3 lines only), Pipe Rats, Lost Tourists asking for wifi |
| 26–50 | **Salt Flats** | Crystal salt caves lit by neon veins | Brine Bats (ratio you), Pickle Slimes, Salty Gamers |
| 51–75 | **The Fermentery** | Glowing mushrooms, sour fog | Sourdough Starters (MLM downline), Kombucha Jellies, Mildew Monks |
| 76–100 | **Grease Trap** | Oil rivers, rusted ArcDyne pumps | Union Rats on break, Sludge Knights, the Drain Choir (one song only) |
| 101–125 | **Sugar Mines** | Candy crystal, sticky floors | Gumdrop Goons, Stonks Gnomes, Caramel Creepers |
| 126–150 | **Basil's Studio** | Ring lights, giant pots, a green screen | Ladle Lackeys (Basil's mods), Sous-Bots, Raw Eggs that hatch angrier eggs |
| 151–175 | **The Throat** | Living walls, warm wind, rain falling upward | Doomscrollers, Taste Buds (eyeball critics), Echo Hungers |
| 176–200 | **The Belly** | Oddly cozy, lantern-lit | Things the Hunger swallowed: a carousel, a ghost tram, a lighthouse that wants a hug |
| 200+ | **Seconds** | Remixed biomes | Everything, spicier |

**[6.3] Theme shifts with depth.** The city and the top of the pit are pure Neon Arcana; deeper
biomes lean into the other looks from the theme tests (Fermentery = High Fantasy, Basil's Studio =
Cyberpunk, the Belly = Space-Age). Cheap to do since the art is code-drawn.

**[6.4] Bosses** (all unserious):
| Floor | Boss | Personality | Gimmick |
|---|---|---|---|
| 10 | **Gristle Golem** | Sigma-grindset gym bro, obsidian with neon cracks | Armor breaks after 3 hits in a row; stops to drink a protein shake (free turn) |
| 20 | **Old Prospector** | Conspiracy theorist, thinks *you're* the monster | Throws mana-dynamite at the back row; pauses to show you his corkboard |
| 30 | **Queen Mildew** | Pitnet influencer | Mold stacks that need cleansing; ignore her 3 turns and she gets sad and loses armor |
| 40 | **Basil (cameo)** | Takes a selfie. "Content!" | Not a real fight; leaves after 3 turns, drops a promo code |
| 50 | **Salt Wyrm** | Salty pro gamer: "skill issue," "ez" | Burrows; salt halves healing; rage quits at 10% HP (you still win) |
| 75 | **The Mother Starter** | "Hey hun!" sourdough MLM | Splits 2→4→8; each blob tries to recruit you |
| 100 | **King of the Drain** | Power-tripping Pitnet moderator | Floods the floor; "bans" a hero for 2 turns; appeal with a tip |
| 110 | **VP Glimmerstone** | ArcDyne acquisitions archmage | Casts NDAs (silence), "synergy" (does nothing), summons interns |
| 125 | **Rock Candy Colossus** | Crypto bro, literal diamond hands | Shatters when "the market dips" at 50% HP |
| 150 | **Basil, the Sous-Chef** | Livestreaming to 9,800 followers | Cooks buffs for monsters (you can steal the dish); chat votes can nerf him |
| 175 | **The Uvula** | The Hunger's hype-man, brought a mic | Swings between rows; scream silences; drops the mic (item) |
| Bottom | **The Hunger** | Bored cosmic food critic, scrolls its phone | A plating minigame while your party fends off snacks it flicks at you; ends in the Review |

**[6.5] Events** (~1 in 4 floors):
- *This Is Fine Campfire*: full heal, but a random item gets toasted.
- *Vending Machine of Fate*: random takeout; 10% mimic; 1% Rickroll (a cursed jukebox track).
- *Stonks Gnome*: prices rise every time you look; leave and come back to "buy the dip."
- *The Imposter*: one party member is a mimic. Pick who's sus.
- *Food Critic Ghost*: rates your party's drip; 5 stars = tip bonus.
- *Dolores' Campsite*: heal + Postcard chance; sometimes she's there eating your fries.
- *Basil's Sponsored Segment*: buff if your party reads an ad.
- *ArcDyne Survey Drone*: answer a 3-question survey for a coupon. The answers are all bad.
- *Lost Tourist*: give them takeout for a map hint. They wanted wifi.

---

## 7. Push your luck: the Dumbwaiter

**[7.1] Rope length.** Starts at 10 floors from the last Pulley Station; upgrades extend it. Past
that it refuses: "One does not simply."

**[7.2] Retreat in range:** everyone comes up with 100% of the loot.

**[7.3] Out of range:** walk up (each floor costs HP) or push on to the next Pulley Station.

**[7.4] Party wipe:** Fortune Mints pop everyone home, Keyboard Cat (a jukebox track) plays you off.
You keep only what's **on the tab** (25%, upgradeable).

**[7.5] Shortcuts:** each Pulley Station reached becomes a start point for the rest of the loop.

---

## 8. Kitchen

**[8.1] Takeout** (consumables, 4 slots per delve):
| Takeout | Effect |
|---|---|
| Fries Basket | Heal all 20% |
| Hot Sauce Packet | +30% damage, 3 turns |
| Iced Tea | Cleanse + small heal |
| Fortune Cookie | Random strong effect; the fortune is always a meme |
| Espresso Shot | Party acts first next round |
| Bento of Courage | Revive one hero at 50% |
| Spite Soup | Poison all enemies |
| Doggy Bag | Bank 100% of current loot even if the party wipes |

**[8.2] Test Kitchen.** Combine 2–3 ingredients to discover recipes; a cookbook with blank pages
fills in as you go. Failed dishes become **Gross Goop**.

**[8.3] Meatball eats the goop.** Feed Gross Goop to Meatball for a random reward. "Meatball is stronger now."

**[8.4] The Hunger's meal.** The dish you serve at the Bottom is built from your best ingredients.
Its quality, novelty and your run performance set the review score.

---

## 9. The Diner (hub)

**[9.1] Renovations** (reset each loop):
| Building | Does |
|---|---|
| Cauldron | Cook recruit dishes; quality tiers |
| Booths | Party size 4 → 5 → 6 |
| Counter | More drifters per cook ("Rizz") |
| Pantry | Ingredient storage |
| Test Kitchen | Recipe discovery |
| Dumbwaiter | Rope length, on-the-tab % |
| Enchanting Bench | Spend Mana Shards to enchant hand-me-down gear |
| Chalkboard | Gambits |
| Rooftop Garden | Passive ingredients ("Touch Grass" tiers) |
| Motel Rooms | Regulars live here |
| Rune Jukebox | Passive buffs per track |
| Neon Sign | Recruit quality; each tier is a funnier sign ("EAT" → "EAT HERE" → "EAT HERE OR ELSE") |
| Espresso Machine | Unlocks 4× fight speed |
| Night Shift Booth | Idle delving |

**[9.2] The diner grows visually** from one cramped stall into a whole neon block of Rimside.

**[9.3] Hand-me-down gear.** Spatula swords, pot-lid shields, apron armor, cyber oven mitts. Gear is
loaned to drifters and comes back with them (unless they flee with it).

**[9.4] Cosmetics.** Diner paint jobs, neon sign designs, jukebox tracks, Meatball hats. Earned in play.

---

## 10. Idle: the Night Shift

**[10.1] Night Cook Ruby** (unlocked at floor 30) sends auto-parties down while the game is closed,
up to your best floor minus 10, retreating automatically.

**[10.2] The Morning Receipt.** On return, an itemized receipt of loot plus one-liners
("Gary was eaten by a Pickle Slime. Gary is fine. Gary would like a refund.").

**[10.3] Upgrades:** longer shifts, smarter retreat rules, deeper limits.

---

## 11. Rebirth: the Big Burp & the Secret Menu

**[11.1] Flow.** Beat the Hunger's plating challenge → Review → Big Burp cutscene → wake up on
opening night (Moss: "...so anyway.") → spend Stars → next loop.

**[11.2] Early burp.** After reaching floor 50 once, eat a **Sus Burrito** to force a rebirth with
a reduced review ("didn't even finish. 1 star.").

**[11.3] What resets / stays.** Resets: tips, ingredients, Mana Shards, renovations, progress.
Stays: Stars, Secret Menu, recipes, Postcards, Regulars (level 1), cosmetics.

**[11.4] Review score** = depth speed + dish quality + dish novelty + Regulars alive + style bonuses.

**[11.5] The Secret Menu** (rebirth tree), a neon menu board with five sections:
- **Appetizers (economy):** *Number Go Up* (+1% tips, stacks 10×), *Stonks*, *Not Stonks* (shop −10%), *Tip Jar*, *Free Refills* → capstone *Passive Income*.
- **Entrées (combat):** *Built Different*, *Skill Issue*, *This Is Fine*, *Emotional Damage*, *Git Gud* → capstone *Final Boss Music* (last hero alive gets +100% stats and the music changes).
- **Sides (recruiting):** *Rizz*, *Main Character Arc*, *Regular's Discount*, *Word of Mouth*, *Squad Goals* → capstone *The Gang's All Here*.
- **Drinks (pit & Dumbwaiter):** *Ight Imma Head Out* (+rope), *On the Tab*, *Speedrun Strats*, *Any% Glitch* → capstone *Skip the Cutscene*.
- **Desserts (weird stuff):** *Press F*, *Sus*, *Meatball Approves*, *Rickroll Immunity*, *Lore Accurate* → capstone *The Hunger's Favorite*.

**[11.6] Node ranks** in endless mode: Regular → Large → Extra Large → "Supersize Me Please."

---

## 12. Extra systems (optional, pick any)

**[12.1] Codex / Bestiary.** Every monster gets an entry with a joke bio and its Pitnet profile.

**[12.2] Daily Special.** A daily seeded challenge with a fixed party and modifiers; shared leaderboard by review score.

**[12.3] Shareable reviews.** Export the Hunger's review card as an image.

**[12.4] Achievements** with meme names ("Touch Grass": grow 100 ingredients).

**[12.5] Photo mode.** Pause any fight, hide the UI, add a filter and a caption.

**[12.6] Seasonal events.** Limited-time Pitnet trends that change enemy banter and add a themed boss.

**[12.7] Hardcore mode.** Fortune Mints disabled: fallen drifters and Regulars are gone for good.

**[12.8] Meatball's questline.** Feed Meatball enough goop and he reveals a secret floor.

---

## 13. Art & audio

**[13.1] Style D, Neon Arcana:** 480×270 native canvas, dynamic lighting, bloom, dithered 5-tone
shading, rim light, rain and wet reflections, hit-stop, smear frames. All code-drawn.

**[13.2] Hybrid art path.** Ship with code-drawn art; optionally swap in a pixel artist's
character sprites later. The engine keeps all the lighting and effects either way.

**[13.3] Music.** "Tavern synthwave": jukebox doo-wop and surf rock played on synths and lutes.
Each biome gets its own remix of the diner theme.

**[13.4] SFX.** An original bass-boom on crits, cash register on tips, sad trombone on wipes, a cosmic
burp that shakes the screen, rain ambience above ground.

---

## 14. UI (landscape)

**[14.1] Fixed 16:9 pixel canvas**, scaled by whole numbers; extra screen width shows more city, never stretched pixels.

**[14.2] Thumb zones.** Takeout bottom-left; Order Up! and Ring the Bell bottom-right; nothing important behind notches.

**[14.3] Screens.** Diner street view (swipe), Cauldron (menu left, counter right), Pack Takeout,
Delve, Receipt, the Review (giant spellphone held sideways), Secret Menu (wide menu board),
Cookbook (two-page spread), Booth Plaques, Codex.

---

## 15. Business model (choose one)

**[15.1] Premium.** One-time price, no ads, no in-app purchases. Simplest, and fits the "jokes at corporations" tone.

**[15.2] Free + one unlock.** Loop 1 free; one purchase unlocks the full game.

**[15.3] Free with optional ads.** Watch an ad for a reward (the joke: ArcDyne sponsors it). No forced ads.

---

## 16. Build plan

**[16.1] Tech.** Plain HTML5 Canvas + JS, no build step, Capacitor for Android. Same stack as
Neon Bastion, but a separate app folder so the two never interfere.

**[16.2] Milestone 1, "Fight Night" (playable slice):** one delve screen in the Neon Arcana look,
4 classes, floors 1–10, the Gristle Golem boss, takeout, Ring the Bell, retreat and wipe rules, simple save.

**[16.3] Milestone 2, "Opening Night":** the diner hub, cooking to recruit, renovations, floors 1–50,
4 bosses, the Hunger (simple), Review, Big Burp, Secret Menu (~10 nodes). A full Loop 1.

**[16.4] Milestone 3, "Regulars":** Regulars, bonds, traits, Test Kitchen discovery, events, Night Shift.

**[16.5] Milestone 4, "Story":** loops 2–4, Basil, ArcDyne, Postcards, endings.

**[16.6] Milestone 5, "Polish & ship":** music and SFX, Codex, achievements, balancing, store build.
