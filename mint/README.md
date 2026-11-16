# Mint Condition

A dark card-grading game in the style of a document-inspection sim. You work the desk at
Gemline Authentication: check each submission against its form, hunt for flaws, measure
centering, catch counterfeits and altered cards, and stamp a verdict. At night you spend
what you earn (and what you've learned) building your own collection, and you decide
what your honesty is worth.

This folder holds the **first slice**: 5 in-game days, 3 card lines, 4 tools.

- Play in a browser: https://quinn1005.github.io/Roguelike-App/mint-condition/play/
- Card line showcase: https://quinn1005.github.io/Roguelike-App/mint-condition/
- Full design: [`docs/mint-condition/DESIGN.md`](../docs/mint-condition/DESIGN.md)

## What's in the slice

- **Card lines:** Grim Grocers (1994), Neon Saints (1987), Bloomlings (1999). 26 cards,
  all drawn in code from data, each with chase variants: holos, shadowless and 1st Edition
  Bloomlings, and the missing-yellow-ink Grim Grocers misprint.
- **The desk:** a real-time shift from 9 to 5. Every card comes with a submission form.
  Tools: Hand (flip), Loupe (magnify and tag flaws), Ruler (centering and card size),
  UV lamp (from day 2), Reference binder.
- **Grading:** four sub-grades (centering, corners, edges, surface). The worst flaw in a
  category caps it, extra flaws take off half a point each, and the final grade is the
  average rounded down, never more than 1 above the lowest sub-grade.
- **Verdicts:** Grade, Authentic Error, Altered, Counterfeit, Return to client.
- **Fakes and tricks:** blurry print, wrong copyright lines, modern paper that glows
  under UV, backwards holo swirls, wrong card backs, added 1st Edition stamps, recolored
  corners, trimmed cards, and forms that don't match their card.
- **Payday:** pay per card, accuracy bonuses, citations and fines, food, rent on Friday.
  Seven citations and you're fired.
- **Evenings:** you step out onto the street and walk to a place. Two stops a night.
  Brick & Mortar Cards (packs you tear open yourself, singles, selling to Lou), the night
  market bulk bins, a diner shift (pay, tips and gossip about tomorrow), and home (binder,
  sleep). Each place has its own scene and a character whose lines follow your choices.
- **Feedback:** a wrong verdict prints a citation slip on the spot that says exactly what
  you missed. The reference binder has a Rules tab.
- **Story:** a bribe from Vince Carrow, a kid's counterfeit heirloom, your brother's
  inhaler, the rent, and an audit on Friday. Several endings.

## Controls

- **Hand:** tap the card to flip it. Fronts and backs have their own flaws.
- **Loupe:** drag over the card to magnify it. Tap a flaw to tag it (a tap on nothing
  costs a minute). On a phone, the lens floats above your finger; lifting your finger
  after a drag tags only if the crosshair is on a flaw.
- **Ruler / UV lamp:** toggle the overlay. The first use on each card costs time.
- **Verdict:** pick a verdict, adjust the grade if you must, and stamp it.
- Keyboard: `H` `L` `R` `U` `B` for tools, `F` to flip, `V` or `Enter` for the verdict.

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
| `www/js/data.js` | Card lines, set lists, days, rules, prices |
| `www/js/cardsvg.js` | Draws every card front and back as SVG, plus flaws, loupe detail, UV and ruler overlays |
| `www/js/grading.js` | Sub-grades, final grade, centering, value multipliers |
| `www/js/gen.js` | Card instances, flaws, variants, fakes, altered cards, submissions |
| `www/js/story.js` | Story submissions, letters, evening events |
| `www/js/scenes.js` | Street and location illustrations, and what Lou, Sal, the seller and Theo say |
| `www/js/audio.js` | Procedural music and ambience for each screen, and all sound effects (Web Audio, no files) |
| `www/js/game.js` | Screens: title, bulletin, desk, payday, city, shop, packs, bins, binder, endings |

Fonts are bundled in `www/fonts` (SIL Open Font License, except Special Elite: Apache 2.0).
