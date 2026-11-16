# Mint Condition: design

A dark card-grading game. You're a new grader at **Gemline Authentication**, in a city
caught in a card-collecting craze. By day you inspect submissions, catch fakes and assign
grades. By night you spend your pay and your knowledge building your own collection.
Your choices at the desk decide how the story ends.

**Tone:** properly dark. Debt, intimidation, desperate clients and a boss who profits
from corruption. The crooked paths have real victims, including you.

**Pillars**
1. Every card is a small puzzle (30–90 seconds) with a clear answer.
2. What you learn at work makes you a better collector.
3. Your choices cost you something you care about.

Status key: ✅ in the first slice (v0.1.0) · ⏳ planned

---

## Loops

| Loop | Length | What happens |
|---|---|---|
| Card | 30–90 s | Check the form, authenticate, grade condition, give a verdict |
| Day | 10–15 min | Bulletin → Shift → Payday → Evening |
| Campaign | ~30 days | New card lines and tools, story arcs, a boom and a crash, endings |

## The desk ✅

Each submission is a card plus a form: client, service tier, card name, set, number,
claimed variant, declared value, and sometimes a note.

1. **Paperwork:** name, number and claimed variant must match the card, or it's returned.
2. **Authenticate:** front and back against the reference binder, with the tools you have.
3. **Condition:** four sub-grades.
   - Centering from border ratios: ≤55/45 → 10, 60/40 → 9, 65/35 → 8, 70/30 → 7, 75/25 → 6, 80/20 → 5.
   - Corners, edges, surface: the worst flaw caps the category (minor 9, moderate 8, major 6), each extra flaw −0.5.
   - Final grade: the average rounded down to the half point, never more than 1 above the lowest sub-grade. Four 10s is a **Pristine 10**.
4. **Verdict:** Grade · Authentic Error · Altered · Counterfeit · Return to client.

Minor flaws are only visible under the loupe. Tool use costs in-game minutes; a loupe tap
on nothing costs a minute. The worksheet grade comes from what you tagged and measured.
You can override it, which is how bribes are paid for.

### Tools
| Tool | Status | Reveals |
|---|---|---|
| Hand | ✅ | Flip the card |
| Loupe | ✅ | Print rosette vs blurry fakes, minor flaws, copyright line, holo swirl direction |
| Ruler | ✅ | Centering and card size (trimmed cards measure short) |
| Reference binder | ✅ | Official front and back, set list, line notes |
| UV lamp | ✅ day 2 | Modern paper glows (fake), recolored touch-ups glow in patches |
| Tilt stand | ⏳ | Holo swirl, foil, Rift hex hologram |
| Precision scale | ⏳ | Weight vs reference |
| Registry terminal | ⏳ | Serials, stolen-card flags, population counts |
| Light box, thickness gauge, microscope, water dropper | ⏳ | Trimming, pressing, late forgeries, Tidebound water test |

### Fakes and alterations
- ✅ Counterfeit tells: blurry print, wrong copyright line, UV glow, counter-clockwise Neon Saints holo swirl, wrong back detail.
- ✅ Alterations: 1st Edition stamp on a shadowed Bloomlings print, recolored corners, trimming.
- ⏳ Tier 4 ring forgeries that are perfect except one detail hinted in the bulletin.

## Card lines

| Line | Status | Front tell | Chase versions |
|---|---|---|---|
| Grim Grocers (1994) | ✅ | Copyright "©1994 GRISTLE TOYS" | Missing-yellow misprint |
| Neon Saints (1987) | ✅ | Holo swirl clockwise | Holo |
| Bloomlings (1999) | ✅ | Shadowless art box = first print | Shadowless 1st Edition, holo |
| Moth & Lantern | ⏳ wk 2 | Hidden UV ink | UV secret-art prints |
| Tidebound | ⏳ wk 2 | Water test | 1st Edition, holo |
| Rift Duelists | ⏳ wk 2 | Hex hologram shifts on tilt | Gold name, secret rare |
| Grimoire Accord | ⏳ wk 3 | Alpha corner radius | Alpha, foil |
| Hollow Pantheon | ⏳ wk 3 | Gold-leaf tarnish dates a print | Old tarnished prints |
| Ironclad Derby | ⏳ wk 3 | Stats match the print run | Run 1 vs Run 2 |
| Cryptid Field Notes | ⏳ wk 4 | Serial matches registry | Serialized /50 |
| Starpost | ⏳ wk 4 | Perforation count | Inverted-centre error |

## Day loop ✅

- **Bulletin:** rules (cumulative), quota, lines in the queue, new tools, letters.
- **Shift:** 9:00–5:00, one real second per in-game minute. Clock out early once the quota is met.
- **Payday:** tier pay (Economy $8, Standard $12, Express $18), +$4 for an exact call, citations (first each day is a warning, then −$5), −$5 per card short of quota, −$6 food. Rent ($220) on Friday. Seven citations in the week and you're fired.
- **Evening:** two actions. Card shop, bulk bins, a diner shift (+$30). Binder is free.

## Collecting

- ✅ Packs: tear the top yourself; tear too fast and the front card creases.
- ✅ Singles: the owner misjudges one card a night (a shadowless Bloomling, a misprint).
- ✅ Bulk bins: $3 a dig, keep two. Hidden variants and the odd fake.
- ✅ Selling at half value. Binder with set pages and copies.
- ⏳ Auctions, unclaimed submissions, payment in cards, Fake Binder, coworker trades, rival grader Apex, Ghost Print hunt, population report.

Value = base (common $2, uncommon $6, rare $30) × variant (holo ×4, shadowless ×4 or ×10 with 1st Ed., misprint ×25) × condition (10 → ×6, 9 → ×2.2, 8 → ×1.3, 7 → ×1).

## Story

**Cast:** Director Harlan Pike (boss), Dot (the next desk), Vince Carrow (dealer, as "C. Vance"),
Mina Sorensen (11), Theo (your little brother, asthmatic), Mr. Gaunt (landlord).

**Week one (✅):**
- Mon: training card, Pike's welcome, the rent warning.
- Tue: Theo's inhaler is empty. Dot warns about walk-ins. Mina's grandfather's Thunder Mama, a fake. Tell the truth, slip her $40, or pass it.
- Wed: Carrow's walk-in Ashowl (really a 7.5) with $200 to make it a 9.
- Thu: refuse and your door is scarred; accept and a counterfeit Corn Reaper arrives with "you don't get to say no twice". Skip the inhaler and Theo ends up in the ER ($60).
- Fri: the audit. Pike owns you if you took the money; if you refused, your home is broken into and your best card destroyed. Mina's and Theo's outcomes. Rent or eviction.

**Endings (slice):** Bought and Paid For · Clean Hands, Open Door · Out on the Street · Still Standing · Fired.

**Campaign (⏳):** wk 2 Expansion, wk 3 The Boom, wk 4 The Crash, wk 5 Reckoning. Full endings:
honest grader, whistleblower, crooked kingpin, the collector, fired and broke.
Meters planned: Reputation, Suspicion, Integrity.
