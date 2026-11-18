# Match screen requirements

These tests record how the Match screen behaves today, so that Match V2 can be
run against the same scenarios. Any change in behavior then has to be a
deliberate edit to a test, not an accident.

## Files

- `matchWorld.js` controls everything outside the screen: network, location
  permission, GPS, the online CV API, the on-device model, and time. Scenarios
  set it up, render Match, then drive it mid-test (for example, "lose signal
  now" or "GPS fix arrives").
- `matchHarness.js` renders Match inside a small navigator and reads what's on
  screen into plain values (verdict, top match, alternatives, map and so on), so
  scenarios don't depend on V1's markup. Screens Match navigates to are stubs
  unless a test passes real ones with `renderMatch( { screens } )`.
- `Match.requirements.test.js` holds the main scenarios (`R-…` and `B-…` IDs),
  with those screens stubbed.
- `Match.journeys.test.js` (`J-…`) follows a person from Match to the real
  ObsEdit, Suggestions and TaxonDetails screens and back.
- `ObservationFlowState.test.js` (`S-…`) covers the observation-flow state
  that Match shares with other screens. Some of what it checks shows up on
  other screens, not on Match.

## Suspected bugs

Scenarios with `[bug]` in their title assert today's behavior even where that
behavior looks wrong. A `// SUSPECTED BUG:` comment on each explains the cause
and what probably should happen instead. Fixing the bug means updating the test
on purpose.

```bash
# Only the suspected bugs
npx jest tests/integration/MatchRequirements -t "\[bug\]"
# Everything except the suspected bugs
npx jest tests/integration/MatchRequirements -t "^(?!.*\[bug\])"
```

The IDs are referenced from the acceptance criteria, the product spec and the
Product quiz, so keep them stable. Renumbering means updating all three.

## Running against V2

`matchHarness.js` has an `IMPLEMENTATIONS` map. To test V2, add an entry with
its component, a `read` function that returns the same shape as `readV1`, and
the same actions (`pressSave`, `chooseAlternative` and so on). Then run:

```bash
MATCH_IMPL=v2 npx jest tests/integration/MatchRequirements
```

Without `MATCH_IMPL`, the tests run against V1.
