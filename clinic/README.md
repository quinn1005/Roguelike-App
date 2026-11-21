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

- **Five species:** Gloop (slime), Pebblet (egg, or rock), Static Cat, Fernling (walking
  houseplant) and Mothhound. Fifteen conditions, three per species.
- **Examining:** drag the lamp over the patient. Signs only show where the light is close;
  tap one to note it. Listen (tap the patient), take a temperature, X-ray, take a sample,
  or run a mood scan. X-rays and samples use up supplies; mood scans cost money.
- **Diagnosing:** compare your notes with Dr. Okafor's handbook and pick a condition.
- **Treating:** six mini-games (remove the object, give a pill, calm and play, seal the
  crack, pick off sparks or mites, dry the roots), plus admitting an egg to the incubator
  and breaking the news that a pet rock is a rock.
- **Billing:** charge fairly, give a discount, waive the fee, or overcharge. Happy owners tip.
- **Wrong calls** cost reputation and the patient comes back the next day, worse.
- **Waiting room:** patients arrive through the day and leave if they wait too long.
- **Evenings:** a day summary, kennel care for admitted patients, and supplies.
- **PetCorp Wellness** opens across the street on Wednesday. Keep your reputation up or lose
  patients to them, and fix their mistakes.
- **Story:** Dr. Okafor's letters, Tobi and the egg that won't hatch, Mrs. Fenwick and her
  overwatered Fernling, Mr. Vance and his suspiciously imported Mothhound, rent on Friday,
  and the basement door.
- **Casebook:** a turntable view of every species you've examined and a wall of photos of
  everyone you've cured.
- Saves automatically between patients.

## Controls

- **Exam room:** drag across the picture to move the lamp (on a computer, just move the
  mouse). Tap a sign to note it. With *Listen* selected, tap the patient. With *Turn*
  selected (eggs), drag sideways to turn it.
- **Waiting room:** drag to pan, tap a chair or a card to pick who's next.
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
