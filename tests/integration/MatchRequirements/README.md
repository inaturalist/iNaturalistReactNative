# Match screen requirements

These tests record how the Match screen behaves today, so that Match V2 can be
run against the same scenarios. Any change in behavior then has to be a
deliberate edit to a test, not an accident.

## Summary

About 100 scenarios cover what a person sees and where they end up:

- **The result:** the verdict wording and score thresholds, common-ancestor and
  human results, the no-results group picker, and names and photos.
- **Choosing and saving:** picking another suggestion or a group, then Save,
  Discard, Edit and Learn more, and what each one stores.
- **Network:** offline from the start, the 5-second timeout, retries, losing or
  regaining the connection, and the on-device model's fallbacks.
- **Location:** permission (allowed, denied, blocked), GPS timing and accuracy,
  imports, the location picker, the map, and place names.
- **Round trips:** leaving Match for ObsEdit or a species page and coming back.
- **Measurement:** the AI camera to Match performance trace.

### Suspected bugs, at a glance

These are pinned as they behave today (see [Suspected bugs](#suspected-bugs)).

| Where the person notices it | IDs |
| --- | --- |
| Wrong or missing result: a confident match lost after GPS, an online answer replaced when the connection drops or ignored after a slow start, an out-of-date name, too few species photos, a crash when the on-device model fails offline | R-CHOOSE-03, R-NET-08, B-02, R-RESULT-15, R-PHOTO-04, R-PHOTO-05, R-NET-07 |
| Location: lost offline, overwritten after picking by hand, never used to ask the AI again, place name one fix behind, ignored by the on-device model offline | R-LOC-06, B-03, R-LOC-14, R-LOC-12, R-NET-10 |
| Saved data: earlier camera-roll photos get the new location, a picked group goes to ObsEdit as an AI ID | B-01, R-NAV-05 |
| Round trips: Discard on a species page reached through Edit deletes the observation, backing out of Edit warns about changes nobody made, My Observations reopens scrolled down | J-01, J-02, J-03, J-04 |
| Other screens after Match: species maps and Suggest ID show the last observation, regrouping imports opens an empty ObsEdit, the camera's photo limit counts the wrong photos | S-01, S-02, S-03, S-04 |
| Invisible to the person: unhandled errors from retries, the offline performance trace never stops | R-NET-05, R-PERF-03 |

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
