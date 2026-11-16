# Mint Condition

A dark card-grading game in the style of a document-inspection sim. You work the desk at
Gemline Authentication: check each submission against its form, hunt for flaws on both
sides, measure centering, catch counterfeits and altered cards, and seal a verdict. At
night you spend what you earn (and what you've learned) building your own collection, and
you decide what your honesty is worth.

- Play in a browser: https://quinn1005.github.io/Roguelike-App/mint-condition/play/
- Card line showcase: https://quinn1005.github.io/Roguelike-App/mint-condition/
- Full design: [`docs/mint-condition/DESIGN.md`](../docs/mint-condition/DESIGN.md)

## The game

- **Five weeks, 25 working days:** Onboarding, Expansion, The Boom, The Crash, Reckoning.
  Rent is due every Friday. Pay and card prices follow the market. Weekends have three
  stops and the Saturday auction.
- **Eleven card lines of 30 cards each** (common, uncommon, rare, mythic rare), all drawn
  in code from data. Every card has a holo version, and mythics come as full art and full
  art holo. Each line has chase versions and its own tell: Grim Grocers, Neon Saints, Bloomlings, Moth & Lantern, Tidebound, Rift
  Duelists, Grimoire Accord, Hollow Pantheon, Ironclad Derby, Cryptid Field Notes, Starpost.
- **Eleven tools:** hand, loupe, microscope, ruler, UV lamp, tilt stand, light box,
  dropper, scale, registry terminal and the reference binder (with rules and codex).
- **Grading:** four sub-grades (centering, corners, edges, surface). The worst flaw in a
  category caps it, extra flaws take off half a point each, and the final grade is the
  average rounded down, never more than 1 above the lowest sub-grade.
- **Verdicts:** Grade and Authentic Error seal the card into a slab with a printed label.
  Altered, Counterfeit and Return send it back with a sticky note. A wrong call prints a
  citation slip that says exactly what you missed.
- **Meters:** Reputation, Suspicion and a hidden Integrity. Seven citations in a week,
  or no reputation left, and you're fired. Suspicion at 100 and you're arrested.
- **Evenings:** walk the street to Lou's card shop (packs you tear open yourself), the
  night market bins, the diner (pay, tips, and gossip about tomorrow), Apex Grading
  (slab your own cards, dispute their mistakes), the Saturday auction, and home.
- **Collecting:** binder pages with set rewards, a Fake Binder, slabbed values, a
  population report that makes 10s less rare every time you hand one out.
- **Story:** Vince Carrow and his envelopes, Director Pike's cut, Mina's counterfeit
  heirloom, Theo, a VIP who wants a 10, a reporter who needs evidence, and Ellis Marsh's
  Ghost Print. Eight endings.
- **Extras:** codex of learned tells, 26 achievements kept across runs, music and effects
  volume, shift speed, and mid-shift saves.

## Controls

- **Hand:** tap the card to flip it. Fronts and backs have their own flaws.
- **Loupe / Microscope:** drag over the card to magnify it. Tap a flaw to tag it (a tap on
  nothing costs a minute). On a phone the lens floats above your finger; lifting after a
  drag tags only if the crosshair is on a flaw. The microscope reads microprint.
- **Ruler, UV lamp, tilt stand, light box:** toggle their views. Scale and registry give
  readings. The dropper places water (Tidebound only). First use on each card costs time.
- **Verdict:** pick a verdict, adjust the grade if you must, and stamp it.
- Keyboard: `H` hand, `L` loupe, `M` microscope, `R` ruler, `U` UV, `T` tilt, `X` light box,
  `W` dropper, `S` scale, `G` registry, `B` reference, `F` flip, `V` or `Enter` verdict.

## Running it locally

The game uses ES modules, so it needs to be served over http:

```sh
python3 -m http.server 8080 --directory mint/www
```

Then open http://localhost:8080.

## Android

`.github/workflows/build-mint-apk.yml` builds Mint Condition as its own app
(`com.mintcondition.game`), separate from Neon Bastion, whenever anything in `mint/`
changes. It publishes a GitHub Release tagged `mint-v<version>`, using the version in
`mint/www/js/version.js` and notes from `mint/CHANGELOG.md`. Builds are signed with the
same stable key as Neon Bastion, so updates install over older versions.

## Code layout

| File | What it does |
|---|---|
| `www/js/data.js` | Card lines, hand-written cards, tools, weeks, days, rules, prices |
| `www/js/sets.js` | Grows every line to 30 cards with names, text and art specs |
| `www/js/art.js` | Card illustrations for all eleven lines |
| `www/js/cardsvg.js` | Card renderer: the first three lines, holo and full art, flaws, loupe and microscope detail, UV, tilt, light box, water and ruler views |
| `www/js/cardsvg2.js` | Faces and backs for the eight later lines, copyright and microprint text |
| `www/js/grading.js` | Sub-grades, final grade, centering, condition multipliers |
| `www/js/gen.js` | Card instances, flaws, variants, counterfeits, alterations, submissions, values |
| `www/js/story.js` | Story cards, letters, evening and weekend events, clues, evidence, endings |
| `www/js/scenes.js` | Street and location illustrations, and what people say there |
| `www/js/collect.js` | Apex Grading and the Saturday auction |
| `www/js/slab.js` | Slab (graded card holder) markup |
| `www/js/extras.js` | Codex, achievements and settings |
| `www/js/audio.js` | Procedural music and ambience for each screen, and all sound effects (Web Audio, no files) |
| `www/js/game.js` | Screens and flow: title, bulletin, desk, payday, city, shop, packs, bins, binder, endings |

Fonts are bundled in `www/fonts` (SIL Open Font License, except Special Elite: Apache 2.0).
