### Source strings for iNaturalistReactNative
###
### Notes
### * GroupComments (comments beginning w/ ##) are not allowed because all
###   strings in this file will be alphabetized and it's impossible to
###   determine where group comments should fit in.
### * Keys should match their content closesly but not exceed 100 chars
### * Try to annotate all strings with comments to provide context for
###   translators, especially for fragments and any situation where the
###   meaning is open to interpretation without context
### * Use different strings for synonyms, e.g. stop-noun and stop-verb, as
###   these might have different translations in different languages
### * Accessibility hints are used by screen readers to describe what happens
###   when the user interacts with an element
###   (https://developer.apple.com/documentation/uikit/uiaccessibilityelement/1619585-accessibilityhint).
###   The iOS Guidelines defines it as "A string that briefly describes the
###   result of performing an action on the accessibility element." We write
###   them in third person singular ending with a period.

# Header for a general description, e.g. of a user, or of iNaturalist itself
ABOUT = OOR
# Label for a taxon when a user prefers to see or hear the common name first
accessible-comname-sciname = { $commonName } ({ $scientificName })
All-observations = Alle waarnemings
# As in intellectual property rights over a photo or other creative work
all-rights-reserved = alle regte voorbehou
# Generic option in a menu of choices that indicates that any of the choices
# would be acceptable
Any = Enige
Cancel = Kanselleer
# Quality grade indicating observation does not quality for Needs ID or
# Research Grade, e.g. missing media, voted out, etc.
Casual--quality-grade = Informeel
Community-Guidelines = Gemeenskapsriglyne
# Data Quality Assessment section label: whether or not the observation date is accurate
Data-quality-assessment-date-is-accurate = Datum is akkuraat
Date-observed = Datum waargeneem
# Month of December
December = Desember
# Shows the number of observations a user is currently deleting out of total on my observations page
Deleting-x-of-y-observations =
    Vee { $total ->
        [one] tans 1 van 1 waarnemings uit
        [two] 1 van 2 waarnemings uit
       *[other] tans { $currentDeleteCount }  van { $total } waarnemings uit
    }
Explore = Verken
# Identification category
improving--identification = Verbeterend
# Identification category
leading--identification = Leidend
# Month of November
November = November
Obscured = Weggesteek
# Month of October
October = Oktober
# Month of September
September = September
# Identification category
supporting--identification = Ondersteunend
Traditional-Project = Tradisionele projek
Umbrella-Project = Sambreelprojek
Welcome-to-iNaturalist = Welkom by iNaturalist!
# Welcome user back to app
Welcome-user = <0>Welkom terug,</0><1>{ $userHandle }</1>
