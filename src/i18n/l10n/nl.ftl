### Source strings for iNaturalistReactNative
###
### Notes for Translators
### * See https://crowdin.com/project/inaturalistios/discussions/58 for notes
###   on this file format
###
### Notes for Developers
### * GroupComments (comments beginning w/ ##) are not allowed because all
###   strings in this file will be alphabetized and it's impossible to
###   determine where group comments should fit in.
### * Keys should match their content closesly but not exceed 100 chars
### * Try to annotate all strings with comments to provide context for
###   translators, especially for fragments and any situation where the
###   meaning is open to interpretation without context
### * Use different strings for synonyms, e.g. stop--noun and stop--verb, as
### * Use double dashes to make keys with the same values in English unique or
###   to otherwise annotate them, e.g. stop--noun or casual--quality-grade
###   these might have different translations in different languages
### * Accessibility hints are used by screen readers to describe what happens
###   when the user interacts with an element
###   (https://developer.apple.com/documentation/uikit/uiaccessibilityelement/1619585-accessibilityhint).
###   The iOS Guidelines defines it as "A string that briefly describes the
###   result of performing an action on the accessibility element." We write
###   them in third person singular ending with a period.

# Header for a general description, e.g. of a user, or of iNaturalist itself
ABOUT = OVER
# Label for a taxon when a user prefers to see or hear the scientific name first
accessible-sciname-comname = { $scientificName } ({ $commonName })
Add-Location = Locatie toevoegen
# Label for button that adds an identification of the same taxon as another identification
Agree = Akkoord
# Label for button that adds an identification of the same taxon as another identification
AGREE = EENS
ALL = ALLES
All = Alle
All-observations = Alle waarnemingen
# As in intellectual property rights over a photo or other creative work
all-rights-reserved = alle rechten voorbehouden
All-taxa = Alle taxa
An-Internet-connection-is-required = Een internetverbinding is vereist om meer waarnemingen te laden.
# Generic option in a menu of choices that indicates that any of the choices
# would be acceptable
Any = Elke
# Month of April
April = April
# Month of August
August = Augustus
Camera = Camera
Cancel = Annuleren
# Quality grade indicating observation does not quality for Needs ID or
# Research Grade, e.g. missing media, voted out, etc.
Casual--quality-grade = Onvolledig
# Label for a button that closes a window or popup
Close = Sluiten
Collection-Project = Verzamelproject
Community-Guidelines = Gemeenschapsrichtlijnen
# Notification when coordinates have been copied
Coordinates-copied-to-clipboard = Coördinaten naar klembord gekopieerd
# Data Quality Assessment section label: whether or not the observation date is accurate
Data-quality-assessment-date-is-accurate = Datum klopt
# Data Quality Assessment section label: whether or not the observation date was specified
Data-quality-assessment-date-specified = Datum opgegeven
# Data Quality Assessment metric
Data-quality-assessment-evidence-of-organism = Bewijs van organisme
# Data Quality Assessment metric
Data-quality-assessment-has-photos-or-sounds = Heeft foto's of geluiden
# Data Quality Assessment metric
Data-quality-assessment-id-supported-by-two-or-more = Heeft een ID die ondersteund wordt door twee of meer
# Data Quality Assessment metric
Data-quality-assessment-location-is-accurate = Locatie klopt
# Data Quality Assessment metric
Data-quality-assessment-location-specified = Locatie opgegeven
# Data Quality Assessment metric
Data-quality-assessment-organism-is-wild = Organisme is wild
# Data Quality Assessment metric
Data-quality-assessment-recent-evidence-of-organism = Recent bewijs van een organisme
# Data Quality Assessment metric
Data-quality-assessment-single-subject = Er is een taxon dat aanwezig is in al het bewijs
# Data Quality Assessment description of the final quality grade when Research Grade
Data-quality-assessment-title-research = Deze waarneming is van onderzoekskwaliteit!
# label in project requirements
Date = Datum
# Used when displaying a relative time - in this case, shows only month+year (same year) - e.g. Jul 3
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
date-format-month-day = d MMM
Date-observed = Datum waarneming
Date-observed-header-short = Waargenomen
# Label for controls over a range of dates
Date-Range = Tijdspanne
# Month of December
December = December
Delete-observation = Verwijder observatie
# Button label or accessibility label for an element that deletes a photo
Delete-photo = Foto verwijderen
DISCARD-X-OBSERVATIONS =
    { $count ->
        [one] GOOI WAARNEMING WEG
       *[other] GOOI { $count } WAARNEMINGEN WEG
    }
DONATE = DONEREN
# Button for editing something
Edit = Bewerken
Edit-Observation = Bewerk Waarneming
# Indicates a species only occurs in a specific place
Endemic = Endemisch
# Title for a section describing an error
Error = Fout
# Title of dialog or section describing an error
Error-title = Fout
# label in project requirements
Establishment = Vestiging
Exact-Date = Exacte datum
except = met uitzondering van
Explore = Verkennen
# Header for featured projects
FEATURED = FUNCTIES
# Month of February
February = Februari
Filter = Filter
Filters = Filters
Flag-An-Item = Een item melden
Flag-Item-Other-Description = Een andere reden die je hieronder kunt uitleggen.
Flag-Item-Other-Input-Hint = Geef de reden waarom je dit item meldt
# Status when an item has been flagged
Flagged = Gemeld
# Label for button that returns to the previous screen
Go-back = Ga terug
Hide = Verbergen
# Identification Status
ID-Withdrawn = ID ingetrokken
Identifiers = Determineerders
# Identification category
improving--identification = Verbeterend
Introduced = Geïntroduceerd
# Month of January
January = Januari
JOIN = DOE MEE
# Header for joined projects
JOINED = SLOOT ZICH AAN BIJ
# Month of July
July = Juli
# Month of June
June = Juni
# Identification category
leading--identification = Leidend
Learn-More = Meer informatie
Location = Locatie
# Second person imperative label to go to log in screen
Log-in = Inloggen
LOG-OUT = AFMELDEN
Map-Area = Gebied van de kaart
# Month of March
March = Maart
# Identification category
maverick--identification = Afwijkend
# Month of May
May = Mei
# label in project requirements
Media-Type = Mediatype
# Accessibility label for a button that opens a menu of options
Menu = Menu
Missing-Date = Datum ontbreekt
Months = Maanden
MY-OBSERVATIONS = MIJN WAARNEMINGEN
Native = Inheems
# Header or button label for content that is near the user's current location
NEARBY = IN DE BUURT
# Header or button label for content that is near the user's current location
Nearby = In de buurt
# Quality grade indicating observation still needs more identifications
Needs-ID--quality-grade = ID nodig
# Heading when creating a new observation
New-Observation = Nieuwe waarneming
No-Location = Geen locatie
No-Media = Geen media
none = geen
Notifications = Notificaties
# Month of November
November = November
Obscured = Vervaagd
Observations = Waarnemingen
# Button that starts a new observation
Observe = Waarnemen
Observers = Waarnemers
# Month of October
October = Oktober
Offensive-Inappropriate = Aanstootgevend/Ongepast
# Generic confirmation, e.g. button on a warning alert
OK = OK
# Adjective, as in geoprivacy
Open = Open
# Generic option in a list for unanticipated cases, e.g. a choice to manually
# enter an explanation for why you are flagging something instead of choosing
# one of the existing options
Other = Anders
Privacy-Policy = Privacybeleid
Private = Privé
Project-Members-Only = Alleen projectdeelnemers
# As in iNat projects, collections of observations or observation search filters
Projects = Projecten
# label in project requirements
Quality-Grade = Kwaliteitsklasse
Ranks-Class = Klasse
Ranks-Complex = Complex
Ranks-Epifamily = Epifamilie
Ranks-Family = Familie
Ranks-Form = Vorm
Ranks-Genus = Geslacht
Ranks-Genushybrid = Intragenerische hybride
Ranks-Hybrid = Hybride
Ranks-Infraclass = Infraklasse
Ranks-Infrahybrid = Infrahybride
Ranks-Infraorder = Infraorde
Ranks-Kingdom = Rijk
Ranks-Order = Sorteer
Ranks-Parvorder = Parvorde
Ranks-Phylum = Stam
Ranks-Section = Sectie
Ranks-SPECIES = SOORTEN
Ranks-Species = Soorten
Ranks-Statefmatter = Toestand van de materie
Ranks-Subclass = Onderklasse
Ranks-Subfamily = Onderfamilie
Ranks-Subgenus = Ondergeslacht
Ranks-Subkingdom = subrijk
Ranks-Suborder = Onderorde
Ranks-Subphylum = Onderstam
Ranks-Subsection = Subsectie
Ranks-Subspecies = Ondersoort
Ranks-Subterclass = Subterklasse
Ranks-Subtribe = Ondertak
Ranks-Superclass = Superklasse
Ranks-Superfamily = Superfamilie
Ranks-Superorder = Superorde
Ranks-Supertribe = Supertak
Ranks-Tribe = Geslachtengroep
Ranks-Variety = Variëteit
Ranks-Zoosection = Zoösectie
Ranks-Zoosubsection = Zoö-ondersectie
# Imperative verb for recording a sound
Record-verb = Item
# Label for button that removes an identification
Remove-identification = Determinatie verwijderen
Remove-project-filter = Verwijder projectfilter
# Quality grade indicating observation is accurate and complete enough to
# share outside of iNat
Research-Grade--quality-grade = Onderzoekskwaliteit
# Label for a button that resets the state of an interface, e.g. a button that
# resets the sound recorder to its original state
Reset-verb = Herstel
# Label for button that restores a withdrawn identification
Restore = Herstellen
# Label for the satellite map type
Satellite--map-type = Sateliet
# Label for a button that persists something
SAVE = OPSLAAN
# Label for a button that persists something
Save = Opslaan
Scientific-Name = Wetenschappelijke naam
# Title for a search interface
Search = Zoeken
# Month of September
September = September
Share = Deel
Share-location = Locatie delen
Sounds = Geluiden
Spam = Spam
Spam-Examples = Commerciële advertenties, koppelingen naar nergens, enzovoort.
Species = Soorten
# Label for the standard map type
Standard--map-type = Standaard
# Imperative verb for stopping the recording of a sound
Stop-verb = Stop
# Identification category
supporting--identification = Ondersteunend
Syncing = Synchroniseren...
# label in project requirements
Taxa = Taxa
Terms-of-Use = Gebruiksvoorwaarden
Traditional-Project = Traditioneel project
Umbrella-Project = Overkoepelend project
# Text to show when a taoxn rank is unknown or missing
Unknown--rank = Onbekend
# Text to show when a taxon or identification is unknown or missing
Unknown--taxon = Onbekend
# Text to show when a user (or their name) is unknown or missing
Unknown--user = Onbekend
# Generic error message
Unknown-error = Onbekende fout
# label in project requirements
Users = Gebruikers
View-in-browser = Bekijk in browser
# Label for a button that shows identification suggestions for an observation
# or photo
View-suggestions = Suggesties bekijken
Wild = Wild
# Label for a button that withdraws an identification
Withdraw = Intrekken
Worldwide = Wereldwijd
# Error message when you try to do something that requires log in
You-need-log-in-to-do-that = Je moet inloggen om dat te kunnen doen.
