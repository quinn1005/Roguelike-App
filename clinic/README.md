# Pixel Pet Clinic

A vet sim for creatures no other vet will touch. You inherit a run-down clinic: examine
each patient under the lamp, run tests, check the handbook, diagnose, treat them with a
quick hands-on mini-game, and bill the owner. Make rent by Friday.

This is the **week one demo** (Monday to Friday).

- Play in a browser: https://quinn1005.github.io/Roguelike-App/pet-clinic/
- Art direction tests: [`docs/pixel-pet-clinic/art-tests.html`](../docs/pixel-pet-clinic/art-tests.html)

## Five screens, five art styles

Every picture is drawn in code at a low resolution and scaled up with hard pixel edges.
Each kind of screen uses the pixel-art technique that suits it best:

| Screen | Style |
|---|---|
| Clinic (mornings and evenings) | Tilt-shift diorama: a block-built room with real shadows, light through the window, glow and depth blur |
| Waiting room | Parallax layers that slide at different speeds as you pan |
| Exam room | Lamp-lit sprites: patients relit every frame by the lamp you move |
| Eggs on the exam table | Stacked slices you can turn to see every side |
| Casebook | Pre-rendered 3D turnarounds, dithered to a few shades |

The light follows the clock: morning sun, fluorescent tubes through clinic hours, and the
late shift after 3:30.

## The game

- **Monday to Saturday.** Rent is due Friday night; Saturday is the town fair.
- **Five species, 25 conditions** with overlapping signs. Each patient shows only some of its signs, plus sometimes a harmless quirk.
- **Examining:** drag the lamp over the patient (signs only show where the light is close), listen in different places, and run tests. Every species has its own tests. Results are readings to check against the handbook's normal ranges, and you read the X-rays yourself.
- **Stress:** every test upsets the patient; push too far and they act out.
- **Diagnosing** includes severity, which decides the treatment. Pills need a dose by weight.
- **Treating:** mini-games for tongs and surgery, pills, calming, patching, trimming, hatching, picking off mites and sparks, draining a hot spot, drying, soaking and brushing. Some patients stay overnight in the kennels.
- **The day:** triage the waiting room, handle emergencies, hire staff, buy supplies and equipment, keep patient charts.
- **Evenings:** walk the town, brew remedies, foster strays, and answer the door after dark.
- **Saturday:** judge the pet show, run a market stall, make house calls, and find your fosters homes.
- **Story:** Dr. Okafor's notes, Tobi's egg, Mrs. Fenwick, Mr. Vance, PetCorp Wellness, the town's strays, and the basement door.

## Controls

- **Exam room:** drag across the picture to move the lamp (on a computer, just move the mouse) and tap anything odd. Tools like Listen, Jiggle, Knock and the voltmeter work by tapping the patient; Stroke works by dragging across the fur; Turn spins an egg.
- **Waiting room and town:** drag to pan, tap a chair or a building.
- **Mini-games:** each one shows its instructions under the picture.

## Running it locally

The game uses ES modules, so serve it over http:

```sh
python3 -m http.server 8080 --directory clinic/www
```

Then open http://localhost:8080.

## Android

Every push that changes `clinic/` runs the **Build Pixel Pet Clinic APK** workflow
(`.github/workflows/build-clinic-apk.yml`), which publishes a GitHub Release tagged
`clinic-v<version>` with the APK attached. The version comes from `www/js/version.js`.
