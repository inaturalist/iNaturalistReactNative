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
ABOUT = OM
ABOUT-COLLECTION-PROJECTS = OM SAMLINGSPROJEKTER
ABOUT-INATURALIST = OM INATURALIST
# About the Data Quality Assement
ABOUT-THE-DQA = OM DQA
About-the-DQA-description = Kvalitetskarakteren opsummerer nøjagtigheden, præcisionen, fuldstændigheden, relevansen og passendeheden af ​​en iNaturalistisk-observation som biodiversitetsdata. Nogle attributter bestemmes automatisk, mens andre afgøres af iNat-brugere i en afstemning. iNaturalist deler licenserede "Forskningskvalitet"-observationer med en række datapartnere til brug i videnskab og bevaring.
ABOUT-TRADITIONAL-PROJECTS = OM TRADITIONELLE PROJEKTER
ABOUT-UMBRELLA-PROJECTS = OM PARAPLYPROJEKTER
# Label for a taxon when a user prefers to see or hear the common name first
accessible-comname-sciname = { $commonName } ({ $scientificName })
# Label for a taxon when a user prefers to see or hear the scientific name first
accessible-sciname-comname = { $scientificName } ({ $commonName })
# Alert message shown after account deletion
Account-Deleted = Konto slettet
ACTIVITY = AKTIVITET
# Label for a button that adds a vote of agreement
Add-agreement = Tilføj enighed
ADD-AN-ID = TILFØJ EN ID
Add-an-ID-Later = Tilføj en ID senere
ADD-COMMENT = TILFØJ KOMMENTAR
Add-Date-Time = Tilføj dato/tidspunkt
# Label for a button that adds a vote of disagreement
Add-disagreement = Tilføj uenighed
ADD-EVIDENCE = TILFØJ BEVIS
# Label for a button that shows options for adding evidence, e.g. camera,
# gallery, sound, etc
Add-evidence = Tilføj bevis
Add-favorite = Tilføj favorit
Add-Location = Tilføj placering
# Accessibility label for a button that starts the process of adding an
# observation, e.g. the button in the tab bar
Add-observations = Tilføj observationer
ADD-OPTIONAL-COMMENT = TILFØJ VALGFRI KOMMENTAR
Add-optional-notes = Tilføj valgfrie notater
# Hint for a button that adds a vote of agreement
Adds-your-vote-of-agreement = Tilføjer egen stemme for enighed
# Hint for a button that adds a vote of disagreement
Adds-your-vote-of-disagreement = Tilføjer egen stemme for uenighed
Affiliation = Affiliation: { $site }
# Label for button that adds an identification of the same taxon as another identification
Agree = Enig
# Label for button that adds an identification of the same taxon as another identification
AGREE = ENIG
# Checkbox label that checks all of the consent agreements a user must make
# before signing up
Agree-to-all-of-the-above = Acceptér alle ovenstående
AGREE-WITH-ID = VÆR ENIG I ID?
Agree-with-ID-description = Vær enig i ID'en og foreslå flg. identifikation?
# This is what we call the camera that
# overlays identification suggestions in real time
AI-Camera = AI-kamera
ALL = ALLE
All = Alle
All-observation-option = Alle observationsvalgmuligheder (inkl. iNaturalist AI-kamera, Standardkamera, Upload fra Galleri og Lydoptager)
All-observations = Alle observationer
All-organisms = Alle organismer
# As in intellectual property rights over a photo or other creative work
all-rights-reserved = alle rettigheder forbeholdes
All-taxa = Alle taksa
ALLOW-LOCATION-ACCESS = TILLAD PLACERINGSADGANG
# As in automated identification suggestions
Almost-done = Næsten færdig!
Already-have-an-account = Har allerede en konto? Log ind
An-Internet-connection-is-required = Indlæsning af flere observationer kræver internetadgang.
# Generic option in a menu of choices that indicates that any of the choices
# would be acceptable
Any = Erhvert
#  Geoprivacy sheet descriptions
Anyone-using-iNaturalist-can-see = Alle brugere af iNaturalist, kan se, hvor denne art blev observeret, og videnskabsfolk kan lettere bruge den til forskning.
APP-LANGUAGE = APP-SPROG
APPLY-FILTERS = ANVEND FILTRE
Apply-filters = Anvend filtre
# Month of April
April = April
Are-you-an-educator = Er du en lærer, der ønsker at bruge iNaturalist sammen med eleverne?
Are-you-sure-you-want-to-log-out = Sikker på, at der skal logges ud af iNaturalist-kontoen? Alle observationer, som endnu ikke er uploadet til iNaturalist, slettes.
# Onboarding text on MyObservations: 0-10 observations
As-you-upload-more-observations = Efterhånden som man uploader flere observationer, kan andre i vores fællesskab hjælpe med at identificere dem!
attribution-cc-by = visse rettigheder forbeholdes (CC BY)
attribution-cc-by-nc = visse rettigheder forbeholdes (CC BY-NC)
attribution-cc-by-nc-nd = visse rettigheder forbeholdes (CC BY-NC-ND)
attribution-cc-by-nc-sa = visse rettigheder forbeholdes (CC BY-NC-SA)
attribution-cc-by-nd = visse rettigheder forbeholdes (CC BY-ND)
attribution-cc-by-sa = visse rettigheder forbeholdes (CC BY-SA)
# Month of August
August = August
# Returns user to login screen
BACK-TO-LOGIN = TILBAGE TIL LOGIN
BLOG = BLOG
# Accessibility label for bulk import / photo import button
# These are used by screen readers to label actionable elements iOS: https://developer.apple.com/documentation/uikit/uiaccessibilityelement/1619577-accessibilitylabel
# iOS Guidelines "A string that succinctly identifies the accessibility element." Starts with capital letter, no ending punctuation.
Bulk-importer = Masseimport
By-exiting-changes-not-saved = Ved at afslutte, vil ændringer til observationen ikke blive gemt.
By-exiting-observation-not-saved = Ved at afslutte, vil observationen ikke blive gemt.
By-exiting-your-observations-not-saved = Ved at afslutte, vil observationerne ikke blive gemt. Man kan gemme dem på sin enhed, eller de kan slettes.
By-exiting-your-photos-will-not-be-saved = Ved at afslutte, vil fotos ikke blive gemt.
By-exiting-your-recorded-sound-will-not-be-saved = Ved at afslutte, vil optaget lyd ikke blive gemt.
# Lead in to a list including "Get your identifcation verified..." and "Share your observation..."
By-uploading-your-observation-to-iNaturalist-you-can = Ved at uploade sin observation til iNaturalist, kan man:
Camera = Kamera
CANCEL = AFBRYD
Cancel = Afbryd
Captive-Cultivated = Fangenskab/Dyrket
# Quality grade indicating observation does not quality for Needs ID or
# Research Grade, e.g. missing media, voted out, etc.
Casual--quality-grade = Uformel
# Short label for the Creative Commons Attribution license
CC-BY = CC BY
# Short label for the Creative Commons Attribution-NonCommercial license
CC-BY-NC = CC BY-NC
# Short label for the Creative Commons Attribution-NonCommercial-NoDerivatives license
CC-BY-NC-ND = CC BY-NC-ND
# Short label for the Creative Commons Attribution-NonCommercial-ShareAlike license
CC-BY-NC-SA = CC BY-NC-SA
# Short label for the Creative Commons Attribution-NoDerivatives license
CC-BY-ND = CC BY-ND
# Short label for the Creative Commons Attribution-ShareAlike license
CC-BY-SA = CC BY-SA
# Short label for the Creative Commons Zero declaration
CC0 = CC0
CHANGE-APP-LANGUAGE = SKIFT APP-SPROG
# Label for a button that changes a selected date
CHANGE-DATE = SKIFT DATO
# Label for a button that changes a selected date
Change-date = Skift dato
# Label for a button that changes a selected end date
CHANGE-END-DATE = SKIFT SLUTDATO
# Label for a button that changes a selected end date
Change-end-date = Skift slutdato
Change-project = Skift projekt
# Label for a button that changes a selected start date
CHANGE-START-DATE = SKIFT STARTDATO
# Label for a button that changes a selected start date
Change-start-date = Skift startdato
Change-taxon = Skift takson
# Button that changes the taxon filter on Explore
Change-taxon-filter = Skift taksonfilter
Change-user = Skift bruger
# Label for a button that cycles through zoom levels for the camera
Change-zoom = Skift zoom
Check-this-box-if-you-want-to-apply-a-Creative-Commons = Markér dette felt, hvis man vil anvende en Creative Commons Attribution-NonCommercial-licens på uploadet indhold. Det betyder, at alle kan kopiere og genbruge ens fotos og/eller observationer uden at bede om tilladelse, så længe man krediteres, og indholdet ikke bruges kommercielt. Man kan vælge en anden licens eller fjerne licensen senere, men dette er den bedste licens til deling med forskere.
# Notification that appears after pressing the reset password button
CHECK-YOUR-EMAIL = TJEK INDBAKKEN!
# Text for a button prompting the user to grant access to the gallery
CHOOSE-PHOTOS = VÆLG FOTOS
# Label for button that chooses a taxon
Choose-taxon = Vælg takson
# Label for button that chooses top taxon
Choose-top-taxon = Vælg øverste takson
# Label for a button that clears content, like the text entered in a text
# field
Clear = Ryd
# Label for a button that closes a window or popup
Close = Luk
# Accessibility label for a button that closes the permission request screen
Close-permission-request-screen = Luk tilladelsesanmodningsskærmen
# Label for a button that closes a search interface
Close-search = Luk søgning
Closes-new-observation-options = Lukker nye observationsvalgmuligheder.
Closes-withdraw-id-sheet = Lukker "Tilbagetræk ID"-arket
# Heading for a section that describes people and organizations that
# collaborate with iNaturalist
COLLABORATORS = SAMARBEJDSPARTNERE
Collection-Project = Samlingsprojekt
# Button that combines multiple photos into a single observation
Combine-Photos = Kombinér fotos
# Title for a form that let's you enter a comment
COMMENT = KOMMENTAR
# Label for a button that shows options for a comment
Comment-options = Kommentarvalgmuligheder
# Label for a setting that shows the common name first
Common-Name-Scientific-Name = Almindeligt navn (Videnskabeligt navn)
Community-Guidelines = Fællesskabsretningslinjer
COMMUNITY-GUIDELINES = FÆLLESSKABSRETNINGSLINJER
# Button that confirms a choice the user has made
CONFIRM = BEKRÆFT
Connect-with-other-naturalists = Kom i kontakt med andre naturkyndige og deltag i samtaler.
Connection-problem-Please-try-again-later = Forbindelsesproblem. Forsøg igen senere.
CONTACT-SUPPORT = KONTAKT SUPPORTEN
Continue-to-iNaturalist = Fortsæt til iNaturalist
# Notification when coordinates have been copied
Coordinates-copied-to-clipboard = Koordinater kopieret til udklipsholder
# Button that copies coordinates to the clipboard
Copy-coordinates = Kopiér koordinater
# Right to control copies of a creative work; this string may be used as a
# heading to describe general information about rights, attribution, and
# licensing
Copyright = Ophavsret
# Error message when no camera can be found
Could-not-find-a-camera-on-this-device = Intet kamera fundet på denne enhed
Couldnt-create-comment = Kommentar kunne ikke oprettes
Couldnt-create-identification-error = Identifikation kunne ikke oprettes { $error }
Couldnt-create-identification-unknown-error = Identifikation kunne ikke oprettes, ukendt fejl.
CREATE-AN-ACCOUNT = OPRET EN KONTO
Create-an-observation-evidence = Opret en observation uden bevis
CREATE-YOUR-FIRST-OBSERVATION = OPRET DEN FØRSTE OBSERVATION
DATA-QUALITY = DATAKVALITET
DATA-QUALITY-ASSESSMENT = DATAKVALITETSVURDERING
Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence = Baseret på beviset, kan Fællesskabstakson stadig forbedres?
Data-quality-assessment-community-taxon-species-level-or-lower = Fællesskabstakson på artsniveau eller lavere
# Data Quality Assessment section label: whether or not the observation date is accurate
Data-quality-assessment-date-is-accurate = Dato er præcis
# Data Quality Assessment section label: whether or not the observation date was specified
Data-quality-assessment-date-specified = Dato angivet
Data-quality-assessment-description-casual = Denne observation har ikke opfyldt betingelserne for status som Forskningskvalitet.
Data-quality-assessment-description-needs-id = Denne observation har endnu ikke opfyldt betingelserne for status som Forskningskvalitet:
# Data Quality Assessment explanation when quality is Research Grade
Data-quality-assessment-description-research = Den kan nu anvendes til forskning og blive vist på andre websteder.
# Data Quality Assessment metric
Data-quality-assessment-evidence-of-organism = Bevis på organisme
# Data Quality Assessment metric
Data-quality-assessment-has-photos-or-sounds = Har fotos eller lyde
# Data Quality Assessment metric
Data-quality-assessment-id-supported-by-two-or-more = Har ID understøttet af to eller flere
# Data Quality Assessment metric
Data-quality-assessment-location-is-accurate = Sted er nøjagtig
# Data Quality Assessment metric
Data-quality-assessment-location-specified = Sted angivet
# Data Quality Assessment metric
Data-quality-assessment-organism-is-wild = Organisme er vild
# Data Quality Assessment metric
Data-quality-assessment-recent-evidence-of-organism = Nylige beviser på en organisme
# Data Quality Assessment metric
Data-quality-assessment-single-subject = Bevis relateret til ét enkelt emne
# Data Quality Assessment description of the final quality grade when Casual
Data-quality-assessment-title-casual = Denne observation er Uformel Klasse
# Data Quality Assessment description of the final quality grade when Needs ID
Data-quality-assessment-title-needs-id = Denne observation Behøver ID
# Data Quality Assessment description of the final quality grade when Research Grade
Data-quality-assessment-title-research = Denne observation har Forskningskvalitet!
Data-quality-casual-description = Denne observation behøver mere information verificeret for at blive betragtet som verificerbar
Data-quality-needs-id-description = Denne observation behøver flere identifikationer for at nå forskningsklasse
Data-quality-research-description = Denne observation har nok identifikationer til at blive betragtet som forskningsklasse
DATE = DATO
# label in project requirements
Date = Dato
# Date formatting using date-fns
# Used for things like User Profile join date
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
date-format-long = d LLL yyyy
# Used when displaying a relative time - in this case, shows only month+year (same year) - e.g. Jul 3
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
date-format-month-day = d MMM
# Use when only showing an observations month and year
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
date-format-month-year = MMM yyyy
# Short date, e.g. on notifications from over a year ago
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
date-format-short = d/M/yy
DATE-OBSERVED = OBSERVERET DATO
Date-observed = Observeret dato
Date-observed-header-short = Observeret
DATE-OBSERVED-NEWEST = OBSERVERET DATO - SENESTE TIL ÆLDSTE
DATE-OBSERVED-OLDEST = OBSERVERET DATO - ÆLDSTE TIL SENESTE
# Label for controls over a range of dates
Date-Range = Datoområde
# Label for controls over a range of dates
DATE-RANGE = DATOOMRÅDE
DATE-UPLOADED = UPLOADET DATO
Date-uploaded = Uploadet dato
Date-uploaded-header-short = Uploadet
DATE-UPLOADED-NEWEST = UPLOADET DATO - SENESTE TIL ÆLDSTE
DATE-UPLOADED-OLDEST = UPLOADET DATO - ÆLDSTE TIL SENESTE
# Used when displaying a relative time - in this case, X days ago (e.g. 3d = 3 days ago)
datetime-difference-days = { $count }d
# Used when displaying a relative time - in this case, X hours ago (e.g. 3h = 3 hours ago)
datetime-difference-hours = { $count }t
# Used when displaying a relative time - in this case, X minutes ago (e.g. 3m = 3 minutes ago)
datetime-difference-minutes = { $count }m
# Used when displaying a relative time - in this case, X weeks ago (e.g. 3w = 3 weeks ago)
datetime-difference-weeks = { $count }u
# Month of December
December = December
Delete-observation = Slet observation
# Button label or accessibility label for an element that deletes a photo
Delete-photo = Slet foto
Device-storage-full = Enhedslagerplads opbrugt
Device-storage-full-description = iNaturalist kan muligvis ikke til at gemme fotoene, eller den kan gå ned.
DONATE = DONÉR
# Button for editing something
Edit = Redigér
Edit-Observation = Redigér observation
# Indicates a species only occurs in a specific place
Endemic = Endemisk
# Title for a section describing an error
Error = Fejl
# Title of dialog or section describing an error
Error-title = Fejl
# label in project requirements
Establishment = Oprindelse
Exact-Date = Eksakt dato
except = bort set fra
Explore = Udforsk
# Header for featured projects
FEATURED = FREMHÆVEDE
# Month of February
February = Februar
Filter = Filtrér
Filters = Filtre
Flag-An-Item = Markér et objekt
Flag-Item-Other-Description = Andre grunde kan du forklare nedenfor.
Flag-Item-Other-Input-Hint = Angiv årsagen til, at du markerer dette emne
# Status when an item has been flagged
Flagged = Markeret
# Label for button that returns to the previous screen
Go-back = Gå tilbage
Hide = Skjul
# Identification Status
ID-Withdrawn = ID trukket tilbage
Identifiers = identifikatorer
# Identification category
improving--identification = Forbedrende
Introduced = indført
# Month of January
January = Januar
JOIN = TILMELD
# Header for joined projects
JOINED = DELTAGER
# Month of July
July = Juli
# Month of June
June = Juni
# Identification category
leading--identification = Ledende
Learn-More = Lær mere
Location = Sted
# Second person imperative label to go to log in screen
Log-in = Log ind
LOG-OUT = LOG UD
Map-Area = Kortområde
# Month of March
March = Marts
# Identification category
maverick--identification = Enkeltstående
# Month of May
May = Maj
# label in project requirements
Media-Type = Medietype
# Accessibility label for a button that opens a menu of options
Menu = Menu
Missing-Date = Dato mangler
Months = Måneder
MY-OBSERVATIONS = MINE OBSERVATIONER
Native = Hjemmehørende
# Header or button label for content that is near the user's current location
NEARBY = I NÆRHEDEN
# Header or button label for content that is near the user's current location
Nearby = I nærheden af
# Quality grade indicating observation still needs more identifications
Needs-ID--quality-grade = Behøver ID
# Heading when creating a new observation
New-Observation = Ny observation
No-Location = Ingen placering
No-Media = Intet medie
none = ingen
# Error message title when not enough storage space on device, e.g. when the
# disk is full and you try to save a photo
Not-enough-space-left-on-device = Ikke nok ledig lagerplads på enhed
# Error message description when not enough storage space on device, e.g. when
# the disk is full and you try to save a photo
Not-enough-space-left-on-device-try-again = Ikke nok ledig lagerplads på enheden til at gøre dette. Frigør noget plads, og forsøg igen.
Notifications = Notifikationer
# Month of November
November = November
Obscured = Sløret
Observation = Observation
Observations = Observationer
# Button that starts a new observation
Observe = Observere
Observers = Observatører
# Month of October
October = Oktober
Offensive-Inappropriate = Stødende/upassende
# Generic confirmation, e.g. button on a warning alert
OK = OK
# Adjective, as in geoprivacy
Open = Åben
# Generic option in a list for unanticipated cases, e.g. a choice to manually
# enter an explanation for why you are flagging something instead of choosing
# one of the existing options
Other = andet
Privacy-Policy = Fortrolighedspolitik
Private = Fortrolig
Project-Members-Only = Kun Projektmedlemmer
# As in iNat projects, collections of observations or observation search filters
Projects = Projekter
PROJECTS-X = PROJEKTER ({ $projectCount })
# label in project requirements
Quality-Grade = Kvalitetsklasse
Ranks-Class = Klasse
Ranks-Complex = Kompleks
Ranks-Epifamily = Epifamilie
Ranks-Family = Familie
Ranks-Form = form
Ranks-Genus = Slægt
Ranks-Genushybrid = Slægtshybrid
Ranks-Hybrid = Hybrid
Ranks-Infraclass = Infraklasse
Ranks-Infrahybrid = Infrahybrid
Ranks-Infraorder = Infraorden
Ranks-Kingdom = Rige
Ranks-Order = Indordning
Ranks-Parvorder = Parvorden
Ranks-Phylum = Stamme
Ranks-Section = Sektion
Ranks-SPECIES = ARTER
Ranks-Species = Art
Ranks-Statefmatter = Sagens kerne
Ranks-Subclass = Underklasse
Ranks-Subfamily = Underfamilie
Ranks-Subgenus = Underslægt
Ranks-Subkingdom = Underrige
Ranks-Suborder = Underorden
Ranks-Subphylum = Underrække
Ranks-Subsection = Undersektion
Ranks-Subspecies = Underarter
Ranks-Subterclass = Subterklasse
Ranks-Subtribe = Understamme
Ranks-Superclass = Superklasse
Ranks-Superfamily = Superfamilie
Ranks-Superorder = Superorden
Ranks-Supertribe = Superstamme
Ranks-Tribe = Stamme
Ranks-Variety = Varietet
Ranks-Zoosection = Zoosektion
Ranks-Zoosubsection = Zooundersektion
# Imperative verb for recording a sound
Record-verb = Optegnelse
# Label for button that removes an identification
Remove-identification = Fjern identifikation
Remove-project-filter = Fjern projektfilter
# Quality grade indicating observation is accurate and complete enough to
# share outside of iNat
Research-Grade--quality-grade = Forskningskvalitet
# Label for a button that resets the state of an interface, e.g. a button that
# resets the sound recorder to its original state
Reset-verb = Nulstil
# Label for button that restores a withdrawn identification
Restore = Gendan
# Label for the satellite map type
Satellite--map-type = Satellit
# Label for a button that persists something
SAVE = GEM
# Label for a button that persists something
Save = Gem
Scientific-Name = Videnskabeligt navn
# Title for a search interface
Search = Søg
# Month of September
September = September
Share = Del
Share-location = Del placering
Sounds = Lyde
Spam = spam
Spam-Examples = Kommerciel opfordring, fører ingen steder hen etc.
Species = Art
# Label for the standard map type
Standard--map-type = Standard
# Imperative verb for stopping the recording of a sound
Stop-verb = Stop
# Identification category
supporting--identification = Understøttende
Syncing = Synkroniserer...
# label in project requirements
Taxa = Taksa
Terms-of-Use = Vilkår for brug
The-models-that-suggest-species = De modeller, som foreslår arter baseret på visuel lighed og placering, kan til dels tilskrives et samarbejder med Sara Beery, Tom Brooks, Elijah Cole, Christian Lange, Oisin Mac Aodha, Pietro Perona og Grant Van Horn.
Traditional-Project = Traditionelt projekt
Umbrella-Project = Paraplyprojekt
# Text to show when a taoxn rank is unknown or missing
Unknown--rank = Ukendt
# Text to show when a taxon or identification is unknown or missing
Unknown--taxon = Ukendt
# Text to show when a user (or their name) is unknown or missing
Unknown--user = Ukendt
# Generic error message
Unknown-error = Ukendt fejl
# label in project requirements
Users = Brugere
View-in-browser = Vis i browser
# Label for a button that shows identification suggestions for an observation
# or photo
View-suggestions = Vis forslag
Wild = vild
# Label for a button that withdraws an identification
Withdraw = Træk tilbage
Worldwide = I hele verden
X-PROJECTS = { $projectCount } PROJEKTER
# Error message when you try to do something that requires log in
You-need-log-in-to-do-that = Dette kræver, at du først logger ind.
