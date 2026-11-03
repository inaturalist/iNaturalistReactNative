# MOB-1962 — Add to Projects rule subtitles (UI evidence)

Captured on **Pixel 6** (physical device) with `agent-device` after a Metro reload.

Screenshots show the Add to Projects chooser with membership-rule rows displaying Figma requirement prose under each header (pass, fail, and unknown statuses). Evidence was gathered using a temporary dev-only “all rules” project since removed from the branch.

## Files

| File | Content |
|------|---------|
| `01-add-to-projects-rules-top.png` | Captive / Wild / Location rows |
| `02-add-to-projects-rules-mid.png` | Photo through Specific identification + taxon thumbnail |
| `03-add-to-projects-rules-lower.png` | Lower rule groups |
| `04-add-to-projects-rules-bottom.png` | End of list |

## Rozenite

On the evidence session, `react.searchNodes` for `ProjectRuleRow` returned **12** mounted rows (one per displayed operator).
