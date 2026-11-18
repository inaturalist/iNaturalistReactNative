# Match requirement IDs

Every scenario in this folder, by ID. Text matches the test titles; when a
title changes, update it here too. **bug** marks a suspected bug, pinned as it
behaves today (see the [README](README.md#suspected-bugs)).

## The result

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-RESULT-01 |  | Confident species: shows it as the match with its confidence |
| R-RESULT-02 |  | Species between 79 and 92: says “likely” |
| R-RESULT-03 |  | Confident genus: talks about a group, not a species |
| R-RESULT-04 |  | Nothing above 78 but a common ancestor: the ancestor is the match |
| R-RESULT-05 |  | No results at all: asks for the group |
| R-RESULT-06 |  | Results but none confident and no ancestor: lists them with no match |
| R-RESULT-07 |  | A human anywhere in the results: shows only human |
| R-RESULT-08 |  | Other suggestions are ordered by score, whatever order the API used |
| R-RESULT-09 |  | Shows “Analyzing” until the AI answers |
| R-RESULT-10 |  | Asking again after GPS shows “Analyzing” over the earlier answer |
| R-RESULT-11 |  | Confidence shows one decimal; wording uses the rounded value |
| R-RESULT-12 |  | A fractional score shows with one decimal |
| R-RESULT-13 |  | The match threshold is strictly above 78 |
| R-RESULT-13b |  | A score just above 78 is a match, shown as 78% |
| R-RESULT-14 |  | No results but a common ancestor: treated as no results |
| R-RESULT-15 | **bug** | A name stored on the device beats the fresh one from the API |
| R-RESULT-16 |  | The AI camera's own guess isn't shown while Match analyzes |

## Choosing another suggestion or a group

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-CHOOSE-01 |  | Tapping another suggestion makes it the match |
| R-CHOOSE-02 |  | A chosen suggestion stays chosen when GPS brings new results that include it |
| R-CHOOSE-03 | **bug** | A chosen suggestion missing from the new GPS results: no match shown |
| R-CHOOSE-04 |  | Picking a different group replaces the first pick |
| R-CHOOSE-05 |  | A group picked before GPS brings results loses to the AI's match |

## Saving and discarding

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-SAVE-01 |  | Save keeps the match as an ID from the AI and leaves to My Observations |
| R-SAVE-02 |  | Save after choosing another suggestion keeps that one |
| R-SAVE-03 |  | Save with no results and no group chosen saves without an ID |
| R-SAVE-04 |  | Choosing a group then saving saves the group, not as an AI ID |
| R-SAVE-05 |  | Choosing from an unconfident list then saving counts as an AI ID |
| R-SAVE-06 |  | Discard saves nothing and leaves to My Observations |
| R-SAVE-07 |  | A human match is saved as an AI ID |
| R-SAVE-08 |  | Save writes the observation's location into photos also saved to the camera roll |
| R-SAVE-09 |  | Discard while still analyzing: leaves, and the late answer is harmless |
| R-SAVE-10 |  | With a stored copy of the taxon, Edit still gets the API's copy, readable after the re-save |
| B-01 | **bug** | Saving a second observation rewrites the location of the first one's camera-roll photo |

## Leaving for other screens

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-NAV-01 |  | “Learn more” opens the match's taxon page |
| R-NAV-02 |  | “Learn more” after choosing another suggestion opens that one |
| R-NAV-03 |  | Edit opens ObsEdit with the match filled in as an AI ID |
| R-NAV-04 |  | Back from the taxon page: same match, no new AI request |
| R-NAV-05 | **bug** | Edit after picking a group: ObsEdit gets the group as an AI ID |
| R-NAV-06 |  | Edit with an unconfident list and nothing chosen: ObsEdit has no ID |
| R-NAV-07 |  | Back from Match: returns to the camera and saves nothing |
| R-NAV-08 |  | “Learn more” on a common-ancestor match opens the ancestor's page |

## Network and the on-device model

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-NET-01 |  | Offline from the start: uses the on-device model and never calls the API |
| R-NET-02 |  | Offline and the on-device model finds nothing: asks for the group |
| R-NET-03 |  | API slower than 5 seconds: falls back to the on-device model |
| R-NET-04 |  | API answers after the fallback: the on-device answer stays |
| R-NET-05 | **bug** | API errors (500): tries 3 times over about 4 seconds, then uses the on-device model |
| R-NET-05b |  | API down (503): uses the on-device model right away, no retries |
| R-NET-06 |  | Connection drops while the API is working: falls back right away |
| R-NET-07 | **bug** | Offline and the on-device model fails: the screen crashes |
| R-NET-08 | **bug** | Connection drops while a result is showing: the result is replaced |
| R-NET-09 |  | Offline: names come from taxa the app has seen before |
| R-NET-10 | **bug** | Offline from the start: the on-device model ignores the observation's location |
| R-NET-10b |  | Falling back after an online attempt: the on-device model uses the location |
| R-NET-11 |  | Offline, nothing confident but a common ancestor: the ancestor is the match |
| R-NET-12 |  | Offline, a human among the predictions: shows only human |
| R-NET-13 |  | Offline from the start, then the connection returns: the API is never asked |
| R-NET-15 |  | The API answers with an empty response |
| B-02 | **bug** | After a slow first answer, the online answer asked for with the GPS location is ignored |

## Location

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-LOC-01 |  | Observation already has a location: sends it with the photo, no GPS |
| R-LOC-02 |  | New photo without location: asks the AI first, then again once GPS answers |
| R-LOC-03 |  | GPS answers before the AI does: asks again with the location |
| R-LOC-04 |  | GPS keeps improving: the location updates but the AI is only asked again once |
| R-LOC-05 |  | Connection drops while GPS is still fixing: the on-device model runs again with the location |
| R-LOC-06 | **bug** | Offline from the start: the GPS location is never added to the observation |
| R-LOC-07 |  | No location permission: asks the AI without location and offers to add one |
| R-LOC-08 |  | Add location without permission, then grant it: uses GPS and asks the AI again |
| R-LOC-09 |  | Add location without permission, then close the prompt: opens the location picker |
| R-LOC-10 |  | Camera photo with an imprecise location: asks with it, then again with a better GPS fix |
| R-LOC-11 |  | Photo imported without a location: no GPS; “Add location” opens the location picker |
| R-LOC-12 | **bug** | GPS answers: the place name lags one fix behind |
| R-LOC-13 |  | Leaving Match stops GPS; coming back starts it again |
| R-LOC-14 | **bug** | Location picked by hand: the map appears but the AI isn't asked again |
| R-LOC-15 |  | Imported photo, location allowed on Match: GPS gives it the current location |
| R-LOC-17 |  | A GPS position more than a minute old is ignored |
| R-LOC-18 |  | Location previously denied and blocked: the prompt points to settings |
| R-LOC-19 |  | Blocked location, open Settings from the prompt, allow, come back: GPS starts |
| B-03 | **bug** | GPS failed, location picked by hand: coming back restarts GPS and the next fix replaces the pick |

## Map and Add location

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-MAP-01 |  | Observation with a location: shows the map, no “Add location” |
| R-MAP-02 |  | No location yet: no map, “Add location” is busy while GPS works |
| R-MAP-03 |  | GPS fails: “Add location” stops being busy and nothing is asked again |

## Photos

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-PHOTO-01 |  | Tapping the observation photo opens the media viewer |
| R-PHOTO-02 |  | More than one photo: shows how many |
| R-PHOTO-03 |  | Tapping the match's representative photo opens its taxon page with that photo |
| R-PHOTO-04 | **bug** | Offline: a stored taxon's photo is never shown beside the observation photo |
| R-PHOTO-05 | **bug** | Online with a representative, a default and 3 taxon photos: only 1 taxon photo shows |

## What Match sends the AI

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-REQ-01 |  | Signed out: the AI request names the app's language |
| R-REQ-02 |  | Signed in: the AI request leaves the language to the account |
| R-REQ-03 |  | Only the first photo is identified |
| R-REQ-04 |  | Online results are kept on the device, so they have names offline later |
| R-REQ-05 |  | No AI request until the location permission check finishes |

## Performance trace

In `Match.requirements.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| R-PERF-01 |  | Reports “AI camera to Match” once, marked online |
| R-PERF-02 |  | Reports “AI camera to Match” marked offline after a fallback |
| R-PERF-03 | **bug** | Offline from the start: the performance trace is never stopped |

## Round trips through other screens

In `Match.journeys.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| J-01 | **bug** | Edit, Identify, species info: Discard throws away the new observation with no warning |
| J-02 | **bug** | Edit before GPS settles, then back: warns about changes the person didn't make and drops the location |
| J-03 | **bug** | Edit on an observation without a place name, then back: warns about changes the person didn't make |
| J-04 | **bug** | Edit and back, then Save: My Observations is told to reopen scrolled down, away from the new observation |

## Observation-flow state after Match

In `ObservationFlowState.test.js`.

| ID | | Scenario |
| --- | --- | --- |
| S-01 | **bug** | After saving on Match, a species page opened from Explore pins the saved observation's location on its map |
| S-02 | **bug** | After saving on Match, Suggest ID on another observation offers the earlier AI camera species while loading |
| S-03 | **bug** | Viewing the 2nd of 2 imported observations, going back and combining them opens an empty ObsEdit |
| S-04 | **bug** | After importing 19 photos as 19 observations, the camera won't add a photo to one that has a single photo |
