# Fonts

## Lato: each weight/style must have a unique internal font family

The six `Lato-*.ttf` files in `assets/fonts/` (and their duplicate copies in
`android/app/src/main/assets/fonts/`) have been modified from how they're
normally distributed: each one's internal font family name (and, where
present, "preferred family" name) has been changed to be unique to that
file — `Lato Bold`, `Lato Bold Italic`, `Lato Italic`, `Lato Medium`,
`Lato Medium Italic`, `Lato Regular` — instead of all six sharing the single
family name `Lato` they ship with by default.

**If you're handed an updated `Lato-*.ttf` (or any new static weight/style of
it), it needs this same treatment before it's dropped into `assets/fonts/`,
or the bug below comes back.**

### Why this matters (MOB-1868)

Scientific names, and some higher-rank taxon names, were intermittently
rendering in the wrong weight (e.g. bold-italic instead of plain italic) —
first noticed after a React Native upgrade, but not actually caused by one.

Root cause: when all six weight/style files share one family name, and the
app asks for a specific one by name (e.g. `Lato-MediumItalic`), React Native's
iOS font resolver doesn't just use that file — it looks up the shared family
and re-picks whichever of the six siblings looks like the closest weight/style
match, using an analysis of each font file that isn't reliably consistent
across point sizes. Giving each file its own single-member family removes the
ambiguity: there's never a sibling for it to second-guess itself with.

This only ever affected iOS. Android's font loader (`ReactFontManager`)
resolves a requested `fontFamily` purely by filename (`fonts/<name>.ttf`) and
never reads a font's internal family metadata, so it was never ambiguous
there — the Android copies are kept identical to the iOS ones for
consistency, not because Android needs the fix.

This is edited into the font files themselves, not app code, so:
- it can't be fixed or reverted by changing anything under `src/`
- picking it up requires a full native rebuild, not Fast Refresh
- **it is invisible in a normal code review** — nothing about a font binary
  diff tells a reviewer whether this step was done

### The app-code half: `resolveFontClassName`

Unique family names fix font *selection* once the app asks for one file by
name, but nothing stopped a component from asking for a specific family
(`font-Lato-BoldItalic`) *and* a generic weight/style class (`italic`,
`font-bold`) on the same element — that combination is actively wrong on
Android (see `src/components/SharedComponents/Typography/fontResolver.ts`
for why) even though the unique family names fix it on iOS.

`InatText` (the base every Typography component renders through) runs
`resolveFontClassName` on the final className before it reaches native, so
callers just write ordinary Tailwind (`italic`, `font-bold`, `font-medium`)
and it gets reconciled into the one real `Lato-*.ttf` file that combination
maps to. This is a second, independent safeguard, not a substitute for the
naming requirement above — it can only pick correctly among files that
already have unique names.

### How to reapply it

Both `assets/fonts/*.ttf` and their duplicate copies in
`android/app/src/main/assets/fonts/` need the same change (keep them
byte-identical, as they are today — see the note above on why Android's copy
doesn't strictly need it).

Using [`fonttools`](https://github.com/fonttools/fonttools) (`pip3 install
fonttools`), for each font file:

```python
from fontTools.ttLib import TTFont

path = "assets/fonts/Lato-Bold.ttf"  # repeat per file
font = TTFont(path)
name_table = font["name"]
postscript_name = name_table.getDebugName(6)   # e.g. "Lato-Bold"
new_family = postscript_name.replace("-", " ")  # "Lato Bold" — insert spaces
                                                 # before internal capitals too,
                                                 # e.g. "Lato-BoldItalic" -> "Lato Bold Italic"

for record in name_table.names:
    if record.nameID in (1, 16):  # Font Family, and Typographic Family if present
        record.string = new_family

font.save(path)
```

Then copy the result over the matching file in
`android/app/src/main/assets/fonts/`, and do a full native rebuild (both
platforms) to verify before shipping.

To check a file's current family name without changing anything:

```bash
python3 -c "from fontTools.ttLib import TTFont; print(TTFont('assets/fonts/Lato-Bold.ttf')['name'].getDebugName(1))"
```

Or drag the `.ttf` into macOS Font Book (or Get Info) — before this fix, all
six files group under one "Lato" family with 6 members; after, each shows up
as its own single-member family.

This is deliberately a documented manual step rather than an automated
script or CI check.
