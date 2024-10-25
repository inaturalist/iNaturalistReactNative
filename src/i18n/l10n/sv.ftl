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
ABOUT-COLLECTION-PROJECTS = OM INSAMLINGSPROJEKT
ABOUT-INATURALIST = OM INATURALIST
# About the Data Quality Assement
ABOUT-THE-DQA = OM DQA
About-the-DQA-description =
    Kvalitetsklassen är en sammanfattning av noggrannhet, precision, fullständighet,
    relevans och lämplighet av ett iNaturalist-fynd i egenskapen av data om
    biologisk mångfald. Vissa egenskaper avgörs automatiskt, medan
    andra bestäms genom röstning av iNat-användare. iNaturalist
    delar fynd av "Forskningsklass" med ett antal datapartners
    för användning inom vetenskap och naturvård.
ABOUT-TRADITIONAL-PROJECTS = OM TRADITIONELLA PROJEKT
ABOUT-UMBRELLA-PROJECTS = OM PARAPLYPROJEKT
# Label for a taxon when a user prefers to see or hear the common name first
accessible-comname-sciname = { $commonName } ({ $scientificName })
# Label for a taxon when a user prefers to see or hear the scientific name first
accessible-sciname-comname = { $scientificName } ({ $commonName })
# Alert message shown after account deletion
Account-Deleted = Kontot raderades
ACTIVITY = AKTIVITET
# Label for a button that adds a vote of agreement
Add-agreement = Håller med
ADD-AN-ID = LÄGG TILL BESTÄMNING
Add-an-ID-Later = Lägg till bestämning senare
ADD-COMMENT = LÄGG TILL KOMMENTAR
Add-Date-Time = Lägg till datum/tid
# Label for a button that adds a vote of disagreement
Add-disagreement = Håller inte med
ADD-EVIDENCE = LÄGG TILL STÖD
# Label for a button that shows options for adding evidence, e.g. camera,
# gallery, sound, etc
Add-evidence = Lägg till stöd
Add-favorite = Lägg till favorit
Add-Location = Lägg till plats
# Accessibility label for a button that starts the process of adding an
# observation, e.g. the button in the tab bar
Add-observations = Lägg till fynd
ADD-OPTIONAL-COMMENT = LÄGG TILL EV. KOMMENTAR
Add-optional-notes = Lägg till valfria anteckningar
# Hint for a button that adds a vote of agreement
Adds-your-vote-of-agreement = Rösta på att hålla med
# Hint for a button that adds a vote of disagreement
Adds-your-vote-of-disagreement = Rösta på att inte hålla med
Affiliation = Anknytning: { $site }
# Label for button that adds an identification of the same taxon as another identification
Agree = Håller med
# Label for button that adds an identification of the same taxon as another identification
AGREE = GODKÄNN
# Checkbox label that checks all of the consent agreements a user must make
# before signing up
Agree-to-all-of-the-above = Godkänn allt ovanstående
AGREE-WITH-ID = HÅLLER MED OM BESTÄMNING?
Agree-with-ID-description = Vill du godkänna bestämningen och föreslå den följande?
# This is what we call the camera that
# overlays identification suggestions in real time
AI-Camera = AI-kamera
ALL = ALLA
All = Alla
All-observation-option = Alla fyndalternativ (inklusive iNaturalist AI-kamera, standardkamera, uppladdning från galleri och ljudinspelning)
All-observations = Alla fynd
All-organisms = Alla organismer
# As in intellectual property rights over a photo or other creative work
all-rights-reserved = alla rättigheter förbehållna
All-taxa = Alla taxa
ALLOW-LOCATION-ACCESS = TILLÅT ÅTKOMST TILL PLATS
# As in automated identification suggestions
Almost-done = Nästan klar!
Already-have-an-account = Har du redan ett konto? Logga in
An-Internet-connection-is-required = En internetanslutning krävs för att läsa in fler observationer.
# Generic option in a menu of choices that indicates that any of the choices
# would be acceptable
Any = Vilken som
#  Geoprivacy sheet descriptions
Anyone-using-iNaturalist-can-see = Alla som använder iNaturalist kan se var denna art observerades, och forskare kan enklast använda den för forskning.
APP-LANGUAGE = APP-SPRÅK
APPLY-FILTERS = TILLÄMPA FILTER
Apply-filters = Tillämpa filter
# Month of April
April = april
Are-you-an-educator = Är du lärare och vill använda iNaturalist med dina studenter?
Are-you-sure-you-want-to-log-out = Är du säker på att du vill logga ut från ditt iNaturalist-konto? Alla fynd som inte har laddats upp till iNaturalist kommer att raderas.
# Onboarding text on MyObservations: 0-10 observations
As-you-upload-more-observations = När du laddar upp fler fynd, kanske andra i vår community kan hjälpa dig att bestämma dem!
attribution-cc-by = vissa rättigheter förebehållna (CC BY)
attribution-cc-by-nc = vissa rättigheter förbehållna (CC BY-NC)
attribution-cc-by-nc-nd = vissa rättigheter förbehållna (CC BY-NC-ND)
attribution-cc-by-nc-sa = vissa rättigheter förbehållna (CC BY-NC-SA)
attribution-cc-by-nd = vissa rättigheter förbehållna (CC BY-ND)
attribution-cc-by-sa = vissa rättigheter förbehållna (CC BY-SA)
# Month of August
August = augusti
# Returns user to login screen
BACK-TO-LOGIN = TILLBAKA TILL INLOGGNING
BLOG = BLOGG
# Accessibility label for bulk import / photo import button
# These are used by screen readers to label actionable elements iOS: https://developer.apple.com/documentation/uikit/uiaccessibilityelement/1619577-accessibilitylabel
# iOS Guidelines "A string that succinctly identifies the accessibility element." Starts with capital letter, no ending punctuation.
Bulk-importer = Bulkimportering
By-exiting-changes-not-saved = Genom att avsluta kommer ändringar av ditt fynd inte att sparas.
By-exiting-observation-not-saved = Genom att avsluta kommer ditt fynd inte att sparas.
By-exiting-your-observations-not-saved = Genom att avsluta kommer dina fynd inte att sparas. Du kan spara dem på din enhet, eller radera dem.
By-exiting-your-photos-will-not-be-saved = Genom att avsluta kommer dina bilder inte att sparas.
By-exiting-your-recorded-sound-will-not-be-saved = Genom att avsluta kommer ditt inspelade ljud inte att sparas.
# Lead in to a list including "Get your identifcation verified..." and "Share your observation..."
By-uploading-your-observation-to-iNaturalist-you-can = Genom att ladda upp ditt fynd till iNaturalist kan du:
Camera = Kamera
CANCEL = AVBRYT
Cancel = Avbryt
Captive-Cultivated = I fångenskap/Odlad
# Quality grade indicating observation does not quality for Needs ID or
# Research Grade, e.g. missing media, voted out, etc.
Casual--quality-grade = Grundklass
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
CHANGE-APP-LANGUAGE = ÄNDRA APP-SPRÅK
# Label for a button that changes a selected date
CHANGE-DATE = ÄNDRA DATUM
# Label for a button that changes a selected date
Change-date = Ändra datum
# Label for a button that changes a selected end date
CHANGE-END-DATE = ÄNDRA SLUTDATUM
# Label for a button that changes a selected end date
Change-end-date = Ändra slutdatum
Change-project = Ändra projekt
# Label for a button that changes a selected start date
CHANGE-START-DATE = ÄNDRA STARTDATUM
# Label for a button that changes a selected start date
Change-start-date = Ändra startdatum
Change-taxon = Ändra taxon
# Button that changes the taxon filter on Explore
Change-taxon-filter = Ändra taxonfilter
Change-user = Ändra användare
# Label for a button that cycles through zoom levels for the camera
Change-zoom = Ändra zoom
Check-this-box-if-you-want-to-apply-a-Creative-Commons = Kryssa i denna ruta om du vill tillämpa en Creative Commons Erkännande-IckeKommersiell licens för uppladdat innehåll. Detta innebär att vem som helst kan kopiera och återanvända dina bilder och/eller fynd utan att be om tillstånd så länge de omnämner dig och inte använder verken kommersiellt. Du kan välja en annan licens eller ta bort licensen senare, men detta är den bästa licensen för delning med forskare.
# Notification that appears after pressing the reset password button
CHECK-YOUR-EMAIL = KOLLA DIN EPOST!
# Text for a button prompting the user to grant access to the gallery
CHOOSE-PHOTOS = VÄLJ BILDER
# Label for button that chooses a taxon
Choose-taxon = Välj taxon
# Label for button that chooses top taxon
Choose-top-taxon = Välj topptaxon
# Label for a button that clears content, like the text entered in a text
# field
Clear = Rensa
# Label for a button that closes a window or popup
Close = Stäng
# Accessibility label for a button that closes the permission request screen
Close-permission-request-screen = Stäng skärmen för behörighetsbegäran
# Label for a button that closes a search interface
Close-search = Stäng söket
Closes-new-observation-options = Stänger nya fyndalternativ.
Closes-withdraw-id-sheet = Stänger "Dra tillbaka bestämning"-blad
# Heading for a section that describes people and organizations that
# collaborate with iNaturalist
COLLABORATORS = MEDARBETARE
Collection-Project = Samlingsprojekt
# Button that combines multiple photos into a single observation
Combine-Photos = Kombinera bilder
# Title for a form that let's you enter a comment
COMMENT = KOMMENTAR
# Label for a button that shows options for a comment
Comment-options = Alternativ för kommentar
# Label for a setting that shows the common name first
Common-Name-Scientific-Name = Vardagligt namn (Vetenskapligt namn)
Community-Guidelines = Communityns riktlinjer
COMMUNITY-GUIDELINES = COMMUNITYNS RIKTLINJER
# Button that confirms a choice the user has made
CONFIRM = BEKRÄFTA
Connect-with-other-naturalists = Kom i kontakt med andra naturforskare och diskussioner.
Connection-problem-Please-try-again-later = Anslutningsproblem. Försök igen senare.
CONTACT-SUPPORT = KONTAKTA SUPPORT
Continue-to-iNaturalist = Fortsätt till iNaturalist
# Notification when coordinates have been copied
Coordinates-copied-to-clipboard = Koordinater kopierade till urklipp
# Button that copies coordinates to the clipboard
Copy-coordinates = Kopiera koordinater
# Right to control copies of a creative work; this string may be used as a
# heading to describe general information about rights, attribution, and
# licensing
Copyright = Upphovsrätt
# Error message when no camera can be found
Could-not-find-a-camera-on-this-device = Hittade ingen kamera på den här enheten
Couldnt-create-comment = Lyckades inte skapa kommentar
Couldnt-create-identification-error = Misslyckades skapa bestämning { $error }
Couldnt-create-identification-unknown-error = Misslyckades skapa bestämning, okänt fel.
CREATE-AN-ACCOUNT = SKAPA KONTO
Create-an-observation-evidence = Skapa ett fynd utan stöd
CREATE-YOUR-FIRST-OBSERVATION = SKAPA DITT FÖRSTA FYND
DATA-QUALITY = DATAKVALITET
DATA-QUALITY-ASSESSMENT = DATAKVALITETSBEDÖMNING
Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence = Kan community-taxonet förbättras ytterligare, utifrån givet stöd.
Data-quality-assessment-community-taxon-species-level-or-lower = Community-taxon på artnivå eller lägre
# Data Quality Assessment section label: whether or not the observation date is accurate
Data-quality-assessment-date-is-accurate = Datum är korrekt
# Data Quality Assessment section label: whether or not the observation date was specified
Data-quality-assessment-date-specified = Datum angivet
Data-quality-assessment-description-casual = Detta fynd uppfyller inte villkoren för statusen Forskningsklass.
Data-quality-assessment-description-needs-id = Detta fynd uppfyller ännu inte villkoren för statusen Forskningsklass.
# Data Quality Assessment explanation when quality is Research Grade
Data-quality-assessment-description-research = Den kan nu användas för forskning och visas på andra webbplatser.
# Data Quality Assessment metric
Data-quality-assessment-evidence-of-organism = Belägg för organism
# Data Quality Assessment metric
Data-quality-assessment-has-photos-or-sounds = Har bilder eller ljud
# Data Quality Assessment metric
Data-quality-assessment-id-supported-by-two-or-more = Med bestämning stödd av två eller fler
# Data Quality Assessment metric
Data-quality-assessment-location-is-accurate = Rimlig fyndplats
# Data Quality Assessment metric
Data-quality-assessment-location-specified = Position angiven
# Data Quality Assessment metric
Data-quality-assessment-organism-is-wild = Vild organism
# Data Quality Assessment metric
Data-quality-assessment-recent-evidence-of-organism = Färska tecken på en organism
# Data Quality Assessment metric
Data-quality-assessment-single-subject = Belägg kopplat till ett enskilt fall
# Data Quality Assessment description of the final quality grade when Casual
Data-quality-assessment-title-casual = Detta fynd är av Grundklass!
# Data Quality Assessment description of the final quality grade when Needs ID
Data-quality-assessment-title-needs-id = Detta fynd behöver bestämmas
# Data Quality Assessment description of the final quality grade when Research Grade
Data-quality-assessment-title-research = Detta fynd är av Forskningsklass!
Data-quality-casual-description = Detta fynd behöver mer bekräftad information för att anses verifierbart
Data-quality-needs-id-description = Detta fynd behöver fler bestämningar för att uppnå forskningsklass
Data-quality-research-description = Detta fynd har tillräckligt med bestämningar för uppnå forskningsklass
DATE = DATUM
# label in project requirements
Date = Datum
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
date-format-short = d/M-yy
DATE-OBSERVED = OBSERVATIONSDATUM
Date-observed = Observationsdatum
Date-observed-header-short = Observerad
DATE-OBSERVED-NEWEST = OBSERVATIONSDATUM - NYAST TILL ÄLDST
DATE-OBSERVED-OLDEST = OBSERVATIONSDATUM - ÄLDST TILL NYAST
# Label for controls over a range of dates
Date-Range = Datumintervall
# Label for controls over a range of dates
DATE-RANGE = DATUMINTERVALL
DATE-UPLOADED = UPPLADDNINGSDATUM
Date-uploaded = Uppladdningsdatum
Date-uploaded-header-short = Uppladdat
DATE-UPLOADED-NEWEST = UPPLADDNINGSDATUM - NYAST TILL ÄLDST
DATE-UPLOADED-OLDEST = UPPLADDNINGSDATUM - ÄLDST TILL NYAST
# Used when displaying a relative time - in this case, X days ago (e.g. 3d = 3 days ago)
datetime-difference-days = { $count }d
# Used when displaying a relative time - in this case, X hours ago (e.g. 3h = 3 hours ago)
datetime-difference-hours = { $count }h
# Used when displaying a relative time - in this case, X minutes ago (e.g. 3m = 3 minutes ago)
datetime-difference-minutes = { $count }m
# Used when displaying a relative time - in this case, X weeks ago (e.g. 3w = 3 weeks ago)
datetime-difference-weeks = { $count }w
# Longer datetime, e.g. on ObsEdit
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
datetime-format-long = yyyy-MM-dd, HH:mm
# Shorter datetime, e.g. on comments and IDs
# See complete list of formatting styles: https://date-fns.org/v2.29.3/docs/format
datetime-format-short = d/M-yy HH:mm
# Month of December
December = december
DELETE = RADERA
Delete-all-observations = Radera alla fynd
Delete-comment = Radera kommentar
DELETE-COMMENT--question = RADERA KOMMENTAR?
Delete-observation = Radera fynd
DELETE-OBSERVATION--question = RADERA FYND?
# Button label or accessibility label for an element that deletes a photo
Delete-photo = Radera bild
Delete-sound = Radera ljud
# Hint for a button that clears text you entered
Deletes-entered-text = Raderar inmatad text
# Shows the progress of deletions for X of Y observations, but omits the
# word "observations" so the message won't get cut off on small screens
Deleting-x-of-y = Raderar { $currentDeleteCount } av { $total }
# Shows the number of observations a user is currently deleting out of total on my observations page
Deleting-x-of-y-observations =
    Raderar { $currentDeleteCount } av { $total ->
        [one] 1 fynd
       *[other] { $total } fynd
    }
# Tab label or section title for content that describes further details, e.g.
# the details of an observation
DETAILS = DETALJER
Device-storage-full = Enhetens lagringsutrymme fullt
Device-storage-full-description = iNaturalist kanske inte kan spara dina bilder eller kan krascha.
# Button that disables the camera's flash
Disable-flash = Blixt av
# Disagreement notice with an identificaiton, <0/> will get replaced by a
# taxon name
Disagreement = *@{ $username } håller inte med om att detta är <0/>
# Button that discards changes or an item, e.g. a photo
DISCARD = SLÄNG
# Button that discards all items, e.g. imported photos
DISCARD-ALL = SLÄNG ALLA
# Button that discards changes
DISCARD-CHANGES = ÅNGRA ÄNDRINGAR
DISCARD-FILTER-CHANGES = ÅNGRA FILTERÄNDRINGAR
DISCARD-MEDIA--question = SLÄNG MEDIA?
DISCARD-OBSERVATION = SLÄNG FYND
DISCARD-PHOTOS--question = SLÄNG BILDER?
# Label for a button that discards a sound recording
DISCARD-RECORDING = SLÄNG INSPELNING
# Header of a popup confirming that the user wants to discard a sound
# recording
DISCARD-SOUND--question = SLÄNG LJUD?
DISCARD-X-OBSERVATIONS =
    { $count ->
        [one] SLÄNG FYND
       *[other] SLÄNG { $count } FYND
    }
DISMISS = AVFÄRDA
DONATE = DONERA
DONATE-TO-INATURALIST = DONERA TILL INATURALIST
# Label for a button the user taps when a task is complete
DONE = KLART
Dont-have-an-account = Har du inget konto? Registrera dig
During-app-start-no-model-found = Ingen modell för bildigenkänning kunde hittas vid app-starten. AI-kameran kommer inte fungera.
# Button for editing something
Edit = Redigera
EDIT-COMMENT = REDIGERA KOMMENTAR
Edit-comment = Redigera kommentar
# Label for button that edits an identification
Edit-identification = Redigera bestämning
EDIT-LOCATION = REDIGERA PLATS
# Label for interactive element that takes you to a location choosing screen
Edit-location = Redigera plats
Edit-Observation = Redigera fynd
# Label for button that edits an observation's taxon
Edits-this-observations-taxon = Redigerar detta fynds taxon
EDUCATORS = LÄRARE
EMAIL = EPOST
EMAIL-DEBUG-LOGS = MEJLA FELSÖKNINGSLOGG
# Button that enables the camera's flash
Enable-flash = Blixt på
# Indicates a species only occurs in a specific place
Endemic = Endemisk
# TODO this and many other uses of placeables are not currently translatable
# without knowing the vowel/consonant state of the first letter of the
# placeable
Endemic-to-place = Endemisk för { $place }
# Title for a section describing an error
Error = Fel
ERROR = FEL
ERROR-LOADING-DQA = FEL VID LADDNING AV DQA
# Title of dialog or section describing an error
Error-title = Fel
ERROR-VOTING-IN-DQA = FEL VID RÖSTNING I DQA
Error-voting-in-DQA-description = Din röst kanske inte har räknats med i DQA. Kontrollera din internetanslutning och försök igen.
# label in project requirements
Establishment = Invandringshistoria
ESTABLISHMENT-MEANS = INVANDRINGSHISTORIA
# Header for a section describing how a taxon arrived in a given place
ESTABLISHMENT-MEANS-header = INVANDRINGSHISTORIA
Every-observation-needs = Varje fynd behöver en plats, ett datum och en tid för att vara bestämmare behjälpligt. Du kan redigera geosekretessen om du är orolig för platsens integritet.
Every-time-a-collection-project = Varje gång sidan för ett samlingprojekt laddas, kommer iNaturalist att göra en snabb sökning och visa alla fynd som motsvarar projektets krav. Det är ett enkelt sätt att visa en uppsättning fynd, som för ett klassprojekt, en park eller en bioblitz, utan att deltagarna manuellt måste lägga till sina fynd i ett projekt i ett extra steg.
EVIDENCE = BELÄGG
Exact-Date = Exakt datum
EXACT-DATE = EXAKT DATUM
except = förutom
EXPAND-MAP = FÖRSTORA KARTA
Explore = Utforska
EXPLORE = UTFORSKA
Explore-Filters = Utforska filter
EXPLORE-IDENTIFIERS = UTFORSKA BESTÄMMARE
EXPLORE-OBSERVATIONS = UTFORSKA FYND
EXPLORE-OBSERVERS = UTFORSKA OBSERVATÖRER
EXPLORE-SPECIES = UTFORSKA ARTER
Failed-to-delete-sound = Lyckades inte radera ljud
# Error message with log in fails
Failed-to-log-in = Lyckades inte logga in
# Header for featured projects
FEATURED = UPPMÄRKSAMMADE
# Month of February
February = februari
FEEDBACK = SYNPUNKTER
Feedback-Submitted = Synpunkter inskickade
Fetching-location = Hämtar plats...
Filter = Filter
FILTER-BY-A-PROJECT = FILTRERA PÅ PROJEKT
FILTER-BY-A-USER = FILTRERA PÅ ANVÄNDARE
Filter-by-observed-between-dates = Filtrera på fynd gjorda mellan två specifika datum
Filter-by-observed-during-months = Filtrera på fynd gjorda under vissa månader
Filter-by-observed-on-date = Filtrera på fynd gjorda på ett särskilt datum
Filter-by-uploaded-between-dates = Filtrera på fynd uppladdade mellan två specifika datum
Filter-by-uploaded-on-date = Filtrera på fynd uppladdade på ett särskilt datum
Filters = Filter
Flag-An-Item = Flagga ett objekt
Flag-Item-Description =
    Med flaggning kan man uppmärksamma något hos webbplatsen frivilliga förvaltare.
    Flagga inte problem som du kan avhjälpa med bestämningar, bedömning av datakvalitet eller genom att prata med den som står för innehållet.
Flag-Item-Other = Flaggat som Annat beskrivningsfält
Flag-Item-Other-Description = Någon annan anledning du kan ange nedan.
Flag-Item-Other-Input-Hint = Ange orsaken till att du flaggar detta objekt
# Status when an item has been flagged
Flagged = Flaggat
Flash = blixt
# Label for a button that toggles between the front and back cameras
Flip-camera = Växla kamera
FOLLOW = FÖLJ
# Forgot password link
Forgot-Password = Glömt lösenord
GEOPRIVACY = GEOSEKRETESS
Geoprivacy-status = Geosekretess: { $status }
# Title of screen asking for permission to access location
Get-more-accurate-suggestions-create-useful-data = Få mer exakta förslag och skapa användbar data för vetenskapen med hjälp av din plats
# Preceded by the fragment, "By uploading your observation to iNaturalist, you can:"
Get-your-identification-verified-by-real-people = Få din bestämning bekräftad av riktiga människor i iNaturalist-communityn
# Label for button that returns to the previous screen
Go-back = Gå tillbaka
# Text for a button that asks the user to grant permission
GRANT-PERMISSION = GE TILLÅTELSE
# Title of a screen asking for permission
Grant-Permission-title = Ge tillåtelse
# Label for button to switch to a grid layout of observations
Grid-layout = Rutnätslayout
Group-Photos = Gruppfoton
# Onboarding for users learning to group photos in the camera roll
Group-photos-onboarding = Gruppera bilder som fynd– se till att det bara finns en art per fynd
HELP = HJÄLP
Hide = Dölj
Highest = Högsta
HIGHEST-RANK = HÖGSTA RANG
I-agree-to-the-Terms-of-Use = Jag godkänner användarvillkoren och integritetspolicyn, och jag har gått igenom communityns riktlinjer (obligatoriskt).
I-consent-to-allow-iNaturalist-to-store = Jag samtycker till att låta iNaturalist lagra och bearbeta begränsade typer av personuppgifter om mig för att kunna hantera mitt konto (obligatoriskt).
I-consent-to-allow-my-personal-information = Jag samtycker till att mina personuppgifter får överföras till USA (obligatoriskt)
Iconic-taxon-name = Organismgrupp: { $iconicTaxon }
# Identification Status
ID-Withdrawn = Bestämning ångrad
IDENTIFICATION = BESTÄMNING
# Accessibility label for a button that shows options for an identification
Identification-options = Bestämningsalternativ
IDENTIFICATIONS-WITHOUT-NUMBER =
    { $count ->
        [one] BESTÄMNING
       *[other] BESTÄMNINGAR
    }
Identifiers = Determinatörer
Identifiers-View = Determinatörsvy
Identify-an-organism = Betäm en organism
Identify-an-organism-with-the-iNaturalist-AI-Camera = Bestäm en organism med iNaturalists AI-kamera
If-an-account-with-that-email-exists = Om ett konto med den e-posten finns, har vi skickat instruktioner för att återställa lösenordet till din e-post.
If-you-want-to-collate-compare-promote = Om du vill sammanställa, jämföra eller gynna ett antal befintliga projekt, då är ett Paraplyprojekt det du ska använda. Ta till exempel 2018 City Nature Challenge, som sammanställde över 60 projekt, och blev en bra landningssida där vem som helst kunde jämföra och kontrastera varje stads fynd. Både Samlings- och Traditionella projekt kan användas i ett Paraplyprojekt och upp till 500 projekt kan sammanställas av ett Paraplyprojekt.
If-youre-seeing-this-error = Om du ser detta och du är online har iNat-personal redan underrättats. Tack för att du hittade en bugg! Om du är offline, ta en skärmdump och skicka oss ett mejl när du är tillbaka på internet.
IGNORE-LOCATION = BORTSE FRÅN PLATS
Import-Photos-From = Importera bilder från
# Shows the number of observations a user is about to import
IMPORT-X-OBSERVATIONS =
    IMPORTERA { $count ->
        [one] 1 FYND
       *[other] { $count } FYND
    }
IMPROVE-THESE-SUGGESTIONS-BY-USING-YOUR-LOCATION = FÖRBÄTTREA DESSA FÖRSLAG GENOM ATT ANVÄNDA DIN PLATS
# Identification category
improving--identification = Förbättrar
INATURALIST-ACCOUNT-SETTINGS = INATURALIST KONTOINSTÄLLNINGAR
iNaturalist-AI-Camera = iNaturalists AI-kamera
iNaturalist-can-save-photos-you-take-in-the-app-to-your-devices-gallery = iNaturalist kan spara bilder som du tar i appen till enhetens galleri.
INATURALIST-COMMUNITY = INATURALIST-COMMUNITYN
INATURALIST-FORUM = INATURALIST-FORUMET
iNaturalist-has-no-ID-suggestions-for-this-photo = iNaturalist har inga bestämningsförslag för denna bild.
INATURALIST-HELP-PAGE = INATURALISTS HJÄLPSIDA
iNaturalist-helps-you-identify = iNaturalist hjälper dig att bestämma växter och djur runt omkring dig samtidigt som du genererar data för vetenskapen och naturvården. Få kontakt med en community med miljontals vetenskapsmän och naturforskare som kan hjälpa dig att lära dig mer om naturen!
iNaturalist-identification-suggestions-are-based-on = iNaturalists bestämningsförslag bygger på fynd och bestämningar som gjorts av iNaturalist-communityn, inklusive { $user1 }, { $user2 }, { $user3 }, och många andra.
iNaturalist-is-a-501 = iNaturalist är en 501(c)(3) icke-vinstdrivande förening i Amerikas förenta stater (Tax-ID/EIN 92-1296468).
iNaturalist-is-a-community-of-naturalists = iNaturalist är en community av naturforskare som tillsammans verkar för att skapa och bestämma fynd av vild biologisk mångfald.
iNaturalist-is-loading-ID-suggestions = iNaturalist laddar bestämningsförslag...
iNaturalist-is-supported-by = iNaturalist stöds av en oberoende, 501(c)(3) icke-vinstdrivande organisation baserad i USA. Plattformen iNaturalist innehåller bland annat denna app, Seek av iNaturalist och iNaturalists webbplats.
iNaturalist-is-supported-by-community = iNaturalist stöds av vår fantastiska community. Från vanliga naturforskare som lägger till fynd och bestämningar, till förvaltare som hjälper till med taxonomi och moderering, till de frivilliga översättare som gör iNaturalist mer tillgängligt för en världsomspännande publik, till våra community-baserade donatorer är vi utomordentligt tacksamma för alla människor i vår community som gör iNaturalist till den plattform den är.
iNaturalist-mission-is-to-connect = iNaturalists mission är att få människor av knyta an till naturen och främja vetenskap om biologisk mångfald samt naturvård.
INATURALIST-MISSION-VISION = INATURALISTS MISSION & VISION
INATURALIST-NETWORK = INATURALIST-NÄTVERKET
INATURALIST-SETTINGS = INATURALIST-INSTÄLLNINGAR
# Label for the role a user plays on iNaturalist, e.g. "INATURALIST STAFF"
# or "INATURALIST CURATOR". Since the name "INATURALIST" should not be
# translated or locally it is inserted as a variable here, but it will always
# be "INATURALIST"
INATURALIST-STAFF = { $inaturalist } PERSONAL
INATURALIST-STORE = INATURALIST-BUTIKEN
INATURALIST-TEAM = INATURALIST-TEAMET
iNaturalist-users-who-have-left-an-identification = iNaturalist-användare som har lämnat en bestämning på en annan användares fynd
iNaturalist-users-who-have-observed = iNaturalist-användare som har observerat ett visst taxon vid en viss tidpunkt och plats
iNaturalist-uses-your-location-to-give-you = iNaturalist använder din plats för att ge dig bättre bestämningsförslag och vi kan automatiskt lägga till en plats till dina fynd, vilket hjälper forskare. Vi använder den också för att hjälpa dig att hitta organismer som observerats nära din plats.
iNaturalists-apps-are-designed-and-developed = iNaturalists appar designas, utvecklas och stöds av iNaturalist-teamet: Yaron Budowski, Amanda Bullington, Tony Iwane, Johannes Klein, Patrick Leary, Scott Loarie, Abhas Misraraj, Sylvain Morin, Carrie Seltzer, Alex Shepard, Thea Skaff, Angie Ta, Ken-ichi Ueda, Michelle Vryn, Jason Walthall & Jane Weeden.
iNaturalists-vision-is-a-world = iNaturalists vision är en värld där alla kan förstå och upprätthålla den biologiska mångfalden genom att observera vilda organismer och dela information om dem.
Individual-encounters-with-organisms = Individuella möten med organismer vid en viss tidpunkt och plats, vanligtvis med belägg
INFO-TRANSFER = INFO-ÖVERFÖRING
# Title for dialog telling the user that an Internet connection is required
Internet-Connection-Required = Internetanslutning krävs
Intl-number = { $val }
Introduced = Införd
Introduced-to-place = Införd till { $place }
It-may-take-up-to-an-hour-to-remove-content = Det kan ta upp till en timme att helt radera allt tillhörande innehåll
# Month of January
January = Januari
JOIN = GÅ MED
JOIN-PROJECT = GÅ MED I PROJEKT
Join-the-largest-community-of-naturalists = Gå med i den största communityn av naturforskare i världen!
# Header for joined projects
JOINED = GICK MED
# Shows date user joined iNaturalist on user profile
Joined-date = Gick med: { $date }
JOURNAL-POSTS-WITHOUT-NUMBER =
    { $count ->
        [one] DAGBOKSINLÄGG
       *[other] DAGBOKSINLÄGG
    }
# Month of July
July = juli
# Month of June
June = juni
Just-make-sure-the-organism-is-wild = Se bara till att organismen är vild (inte ett husdjur, ett djurparksdjur eller en trädgårdsväxt)
# Shows date user last active on iNaturalist on user profile
Last-Active-date = Senast aktiv: { $date }
# Latitude, longitude on a single line
Lat-Lon = { NUMBER($latitude, maximumFraktionDigits: 6) }, { NUMBER($longitude, maximumFraktionDigits: 6) }
# Latitude, longitude, and accuracy on a single line
Lat-Lon-Acc = Lat: { NUMBER($latitude, maximumFractionDigits: 6) }, Long: { NUMBER($longitude, maximumFractionDigits: 6) }, Acc: { $accuracy }
# Identification category
leading--identification = Leder
Learn-More = Läs mer
LEAVE = LÄMNA
LEAVE-PROJECT = LÄMNA PROJEKT
LEAVE-US-A-REVIEW = GE OSS EN RECENSION!
LICENSES = LICENSER
# Label for button to switch to a list layout of observations
List-layout = Listlayout
Loading-iNaturalists-AI-Camera = Laddar iNaturalists AI-kamera
Loads-content-that-requires-an-Internet-connection = Laddar innehåll som kräver en internetanslutning
LOCATION = POSITION
Location = Position
Location-accuracy-is-too-imprecise = Positionens noggrannhet är för inexakt för att hjälpa bestämmare. Vänligen zooma in.
LOCATION-TOO-IMPRECISE = POSITION FÖR INEXAKT
LOG-IN = LOGGA IN
# Second person imperative label to go to log in screen
Log-in = Logga in
Log-in-to-contribute-and-sync = Logga in för att bidra & synka
Log-in-to-contribute-your-observations = Logga in för att bidra med dina fynd till vetenskapen!
LOG-IN-TO-INATURALIST = LOGGA IN PÅ INATURALIST
Log-in-to-iNaturalist = Logga in på iNaturalist
LOG-OUT = LOGGA UT
LOG-OUT--question = LOGGA UT?
# Appears in the login screen
Login-sub-title = Dokumentera levande ting, bestäm organismer & bidra till vetenskapen
Lowest = Lägsta
LOWEST-RANK = LÄGSTA RANG
MAP = KARTA
Map-Area = Kartområde
# Month of March
March = mars
# Identification category
maverick--identification = Motförslag
# Month of May
May = maj
MEDIA = MEDIA
# label in project requirements
Media-Type = Mediatyp
MEMBERS-WITHOUT-NUMBER =
    { $count ->
        [one] MEDLEM
       *[other] MEDLEMMAR
    }
# Accessibility label for a button that opens a menu of options
Menu = Meny
Missing-Date = Datum saknas
MISSING-EVIDENCE = BELÄGG SAKNAS
Monthly-Donor = Månatlig bidragsgivare
Months = Månader
MONTHS = MÅNADER
More-info = Mer info
MOST-FAVED = MEST POPULÄRA
Most-faved = Mest populära
MY-OBSERVATIONS = MINA FYND
Native = Inhemsk
Native-to-place = Inhemsk i { $place }
Navigates-to-AI-camera = Går till AI-kamera
Navigates-to-bulk-importer = Går till bulkimport
Navigates-to-camera = Går till kamera
Navigates-to-explore = Går till utforska
Navigates-to-notifications = Går till aviseringar
Navigates-to-observation-details = Går till fyndinformationsfönster
Navigates-to-observation-edit-screen = Går till fyndredigeringsfönster
Navigates-to-photo-importer = Går till bildimport
Navigates-to-previous-screen = Går till föregående fönster
Navigates-to-project-details = Går till projektinformation
Navigates-to-sound-recorder = Går till ljudinspelare
Navigates-to-suggest-identification = Går till föreslå bestämning
Navigates-to-taxon-details = Går till taxoninformation
Navigates-to-user-profile = Går till användarprofil
# Label for button that takes you to your observations
Navigates-to-your-observations = Går till dina fynd
# Header or button label for content that is near the user's current location
NEARBY = I NÄRHETEN
# Header or button label for content that is near the user's current location
Nearby = I närheten
# Quality grade indicating observation still needs more identifications
Needs-ID--quality-grade = Behöver bestämmas
# Heading when creating a new observation
New-Observation = Nytt fynd
# Sort order, refers to newest or oldest date
Newest-to-oldest = Nyast till äldst
Next-observation = Nästa fynd
# Error message when no camera can be found
No-Camera-Available = Ingen kamera tillgänglig
# Alert dialog title when attempting to send email but no email is installed
No-email-app-installed = Ingen e-post-app installerad
No-email-app-installed-body = Om du kan skicka e-post på något annat sätt, är adressen { $address }
No-email-app-installed-body-check-other = Kolla din e-post i en webbläsare eller på en annan enhet.
No-Location = Ingen plats
No-Media = Ingen media
# As in a machine learning model that powers automated suggestions
No-model-found = Ingen modell hittades
No-Notifications-Found = Du har inga aviseringar! Kom igång genom att skapa dina egna fynd.
No-projects-match-that-search = Inga projekt matchar den sökningen
# Used for explore screen when search params lead to a search with no data
No-results-found-for-that-search = Inga resultat hittades för den sökningen.
No-results-found-try-different-search = Inga resultat hittades. Prova en annan sökning eller justera dina filter.
# license code
no-rights-reserved-cc0 = inga rättigheter förbehållna (CC0)
NONE = INGA
none = inga
# Error message title when not enough storage space on device, e.g. when the
# disk is full and you try to save a photo
Not-enough-space-left-on-device = Inte tillräckligt med utrymme kvar på enheten
# Error message description when not enough storage space on device, e.g. when
# the disk is full and you try to save a photo
Not-enough-space-left-on-device-try-again = Det inte finns inte tillräckligt med lagringsutrymme kvar på din enhet för att göra det. Rensa upp lite och försök igen.
# Header for observation description on observation detail
NOTES = ANTECKNINGAR
NOTIFICATIONS = AVISERINGAR
Notifications = Aviseringar
# notification when someone adds a comment to your observation
notifications-user-added-comment-to-observation-by-you = <0>{ $userName }</0> lade till en kommentar till ett av dina fynd
# notification when someone adds an identification to your observation
notifications-user-added-identification-to-observation-by-you = <0>{ $userName }</0> lade till en bestämning till ett av dina fynd
# Month of November
November = november
Obervations-must-be-manually-added = Fynd måste läggas till manuellt i ett traditionellt projekt, antingen i uppladdningsmomentet eller efter att fyndet har delats till iNaturalist. En användare måste även gå med i ett traditionellt projekt för att kunna lägga till sina fynd till det.
Obscured = Diffuserad
# Displayed when user views an obscured location on the ObsDetail map screen
Obscured-observation-location-map-description = Detta fynd plats är diffuserad. Du ser en slumpartad punkt inom diffuseringspolygonen.
Observation = Fynd
Observation-Attribution = Fynd: ©️ { $userName } · { $restrictions }
OBSERVATION-BUTTON = FYNDKNAPPEN
Observation-has-no-photos-and-no-sounds = Detta fynd har inga bilder och inga ljud.
Observation-Name = Fynd { $scientificName }
# Label for a menu that shows various actions you can take for an observation
Observation-options = Fyndalternativ
OBSERVATION-WAS-DELETED = FYNDET RADERADES
Observation-with-no-evidence = Fynd utan belägg
Observations = Fynd
Observations-created-on-iNaturalist = Fynd som skapats på iNaturalist används av forskare runt om i världen.
Observations-View = Fyndvy
# Might be used when the number is represented using an image or other
# element, not text
OBSERVATIONS-WITHOUT-NUMBER =
    { $count ->
        [one] FYND
       *[other] FYND
    }
# Onboarding text on MyObservations: Onboarding text on MyObservations: 11-50 observations
Observations-you-upload-to-iNaturalist = Fynd som du laddar upp till iNaturalist kan användas av vetenskapsmän och forskare över hela världen.
# Button that starts a new observation
Observe = Observera
# Title of screen asking for permission to access the gallery
Observe-and-identify-organisms-from-your-gallery = Observera och bestäm organismer från ditt galleri
# Title of screen asking for permission to access the camera
Observe-and-identify-organisms-in-real-time-with-your-camera = Observera och bestäm organismer i realtid med din kamera
# Text for a button prompting the user to grant access to the camera
OBSERVE-ORGANISMS = OBSERVERA ORGANISMER
Observers = Observatörer
# Section in Explore that shows people who added observations given a set of search filters
Observers-View = Observatörsvy
# Month of October
October = oktober
Offensive-Inappropriate = Stötande/Olämpligt
Offensive-Inappropriate-Examples = Vilseledande eller olagligt innehåll, rasistiska eller etniska glåpord, etc. För mer om vår definition av "lämpligt", se Vanliga frågor och svar.
Offline-DQA-description = DQA kanske inte fungerar korrekt. Kontrollera din internetanslutning och försök igen.
Offline-suggestions-do-not-use-your-location = Offline-förslag använder inte din plats och kan skilja sig från online-förslag. Taxon-bilder och vanliga namn kanske inte laddas.
# Generic confirmation, e.g. button on a warning alert
OK = OK
# Sort order, refers to newest or oldest date
Oldest-to-newest = Äldst till nyast
Once-you-create-and-upload-observations = När du börjat skapa och ladda upp fynd kan andra medlemmar i vår community lägga till bestämningar för att hjälpa dina fynd att nå forskningsklass.
One-last-step = Ett sista steg!
# Adjective, as in geoprivacy
Open = Öppen
Open-drawer = Öppna låda
OPEN-EMAIL = ÖPPNA E-POST
Open-menu = Öppna menyn.
# Text for a button that opens the operating system Settings app
OPEN-SETTINGS = ÖPPNA INSTÄLLNINGAR
Opens-add-comment-modal = Öppnar dialogfönstret "Lägg till kommentar".
Opens-add-observation-modal = Öppna dialogfönstret "Lägg till fynd".
Opens-AI-camera = Öppnar AI-kamera.
Opens-location-permission-prompt = Öppnar behörighetsprompten för plats
# Accessibility hint for button that opens the AI camera
Opens-the-AI-camera = Öppnar AI-kameran
Opens-the-side-drawer-menu = Öppnar sidomenyn.
# Picker prompt on observation edit
Organism-is-captive = Organismen är i fångenskap
Organisms-that-are-identified-to-species = Organismer som bestäms till artnivå eller lägre
# Generic option in a list for unanticipated cases, e.g. a choice to manually
# enter an explanation for why you are flagging something instead of choosing
# one of the existing options
Other = Annat
OTHER-DATA = MER DATA
OTHER-SUGGESTIONS = ANDRA FÖRSLAG
PASSWORD = LÖSENORD
PERSONAL-INFO = PERSONLIG INFO
Photo-importer = Bildimport
PHOTO-LICENSING = BILDLICENSIERING
Photos = Bilder
Photos-you-take-will-appear-here = Bilder du tar visas här
# Title of screen asking for permission to access the camera when access was denied
Please-allow-Camera-Access = Vänligen tillåt kameraåtkomst
# Title of screen asking for permission to access the gallery when access was denied
Please-Allow-Gallery-Access = Vänligen tillåt åtkomst till galleriet
# Title of screen asking for permission to access location when access was denied
Please-allow-Location-Access = Vänligen tillåt platsåtkomst
# Title of screen asking for permission to access the microphone when access was denied
Please-allow-Microphone-Access = Vänligen tillåt åtkomst till mikrofon
Please-click-the-link = Klicka på länken i mejlet inom 60 minuter för att bekräfta ditt konto
# Title of a screen asking for permission when permission has been denied
Please-Grant-Permission = Vänligen tillåt åtkomst
PLEASE-LOG-IN = VÄNLIGEN LOGGA IN
Please-try-again-when-you-are-connected-to-the-internet = Försök igen när du är ansluten till internet.
Please-try-again-when-you-are-online = Försök igen när du är online!
POTENTIAL-DISAGREEMENT = MÖJLIG OENIGHET
Potential-disagreement-description = <0>Är stödet tillräckligt för att bekräfta att detta är </0><1></1><0>?<0>
Potential-disagreement-disagree = <0>Nej, men detta är en medlem av </0><1></1>
Potential-disagreement-unsure = <0>Jag vet inte men jag är säker på att detta är </0><1></1>
# Help text for beginning a sound recording
Press-record-to-start = Tryck på spela in för att starta
Previous-observation = Föregående fynd
Privacy-Policy = Integritetspolicy
PRIVACY-POLICY = INTEGRITETSPOLICY
Private = Privat
# As in an iNat project, a collection of observations or observation search filters
PROJECT = PROJEKT
Project-Members-Only = Endast projektmedlemmar
PROJECT-REQUIREMENTS = PROJEKTKRAV
# As in iNat project, collections of observations or observation search filters
PROJECTS = PROJEKT
# As in iNat projects, collections of observations or observation search filters
Projects = Projekt
PROJECTS-X = PROJEKT ({ $projectCount })
QUALITY-GRADE = KVALITETSKLASS
# label in project requirements
Quality-Grade = Kvalitetsklass
# Screen reader label for the Casual quality grade label
Quality-Grade-Casual--label = Kvalitetsklass: Grund
# Screen reader label for the Needs ID quality grade label
Quality-Grade-Needs-ID--label = Kvalitetsklass: Behöver bestämmas
# Screen reader label for the Research quality grade label
Quality-Grade-Research--label = Kvalitetsklass: Forskning
Ranks-CLASS = KLASS
Ranks-Class = Klass
Ranks-COMPLEX = ARTKOMPLEX
Ranks-Complex = Artkomplex
Ranks-EPIFAMILY = EPIFAMILJ
Ranks-Epifamily = Epifamilj
Ranks-FAMILY = FAMILJ
Ranks-Family = Familj
Ranks-FORM = FORM
Ranks-Form = Form
Ranks-GENUS = SLÄKTE
Ranks-Genus = Släkte
Ranks-GENUSHYBRID = SLÄKTESHYBRID
Ranks-Genushybrid = Släkteshybrid
Ranks-HYBRID = HYBRID
Ranks-Hybrid = Hybrid
Ranks-INFRACLASS = INFRAKLASS
Ranks-Infraclass = Infraklass
Ranks-INFRAHYBRID = INFRAHYBRID
Ranks-Infrahybrid = Infrahybrid
Ranks-INFRAORDER = INFRAORDNING
Ranks-Infraorder = Infraordning
Ranks-KINGDOM = RIKE
Ranks-Kingdom = Rike
Ranks-ORDER = ORDNING
Ranks-Order = Ordning
Ranks-PARVORDER = PARVORDNING
Ranks-Parvorder = Parvordning
Ranks-PHYLUM = FYLUM
Ranks-Phylum = Fylum
Ranks-SECTION = SEKTION
Ranks-Section = Sektion
Ranks-SPECIES = ART
Ranks-Species = Art
Ranks-Statefmatter = Materia
Ranks-STATEOFMATTER = MATERIA
Ranks-SUBCLASS = UNDERKLASS
Ranks-Subclass = Underklass
Ranks-SUBFAMILY = UNDERFAMILJ
Ranks-Subfamily = Underfamilj
Ranks-SUBGENUS = UNDERSLÄKTE
Ranks-Subgenus = Undersläkte
Ranks-SUBKINGDOM = UNDERRIKE
Ranks-Subkingdom = Underrike
Ranks-SUBORDER = UNDERORDNING
Ranks-Suborder = Underordning
Ranks-SUBPHYLUM = UNDERFYLYUM
Ranks-Subphylum = Underfylum
Ranks-SUBSECTION = UNDERSEKTION
Ranks-Subsection = Undersektion
Ranks-SUBSPECIES = UNDERART
Ranks-Subspecies = Underart
Ranks-SUBTERCLASS = SUBTERKLASS
Ranks-Subterclass = Subterklass
Ranks-SUBTRIBE = UNDERTRIBUS
Ranks-Subtribe = Undertribus
Ranks-SUPERCLASS = ÖVERKLASS
Ranks-Superclass = Överklass
Ranks-SUPERFAMILY = ÖVERFAMILJ
Ranks-Superfamily = Överfamilj
Ranks-SUPERORDER = ÖVERORDNING
Ranks-Superorder = Överordning
Ranks-SUPERTRIBE = ÖVERTRIBUS
Ranks-Supertribe = Övertribus
Ranks-TRIBE = TRIBUS
Ranks-Tribe = Tribus
Ranks-VARIETY = VARIETET
Ranks-Variety = Varietet
Ranks-ZOOSECTION = ZOOSEKTION
Ranks-Zoosection = Zoosektion
Ranks-ZOOSUBSECTION = ZOOUNDERSEKTION
Ranks-Zoosubsection = Zooundersektion
Read-more-on-Wikipedia = Läs mer på Wikipedia
# Heading for the sound recorder
RECORD-NEW-SOUND = SPELA IN NYTT LJUD
# Title of screen asking for permission to access the microphone
Record-organism-sounds-with-the-microphone = Spela in organismljud med mikrofonen
# Text for a button prompting the user to grant access to the microphone
RECORD-SOUND = SPELA IN LJUD
Record-sounds = Spela in ljud med din mikrofon
# Imperative verb for recording a sound
Record-verb = Spela in
# Status while recording a sound
Recording-sound = Spelar in ljud
Recording-stopped-Tap-play-the-current-recording = Inspelning stoppad. Tryck på spela upp den aktuella inspelningen.
REDO-SEARCH-IN-MAP-AREA = GÖR OM SÖKNING I KARTOMRÅDE
# Label for a button that removes a vote of agreement
Remove-agreement = Ta bort medhåll
# Label for a button that removes a vote of disagreement
Remove-disagreement = Ta bort oenighet
Remove-favorite = Ta bort favorit
# Label for button that removes an identification
Remove-identification = Ta bort bestämning
Remove-Photos = Ta bort bilder
Remove-project-filter = Ta bort projektfilter
Remove-taxon-filter = Ta bort taxonfilter
Remove-user-filter = Ta bort användarfilter
# Label for button that removes an observation's taxon
Removes-this-observations-taxon = Tar bort detta fynds taxon
# Hint for a button that removes a vote of agreement
Removes-your-vote-of-agreement = Tar bort din röst för medhåll
# Hint for a button that removes a vote of disagreement
Removes-your-vote-of-disagreement = Tar bort din röst för oenighet
# Quality grade indicating observation is accurate and complete enough to
# share outside of iNat
Research-Grade--quality-grade = Forskningsklass
# Reset password button
RESET-PASSWORD = ÅTERSTÄLL LÖSENORD
# Label for a button that resets a sound recording
RESET-RECORDING = ÅTERSTÄLL INSPELNING
RESET-SEARCH = ÅTERSTÄLL SÖK
# Header of a popup confirming that the user wants to reset a sound
# recording
RESET-SOUND-header = ÅTERSTÄLL LJUD?
# Label for a button that resets the state of an interface, e.g. a button that
# resets the sound recorder to its original state
Reset-verb = Återställ
RESTART-APP = STARTA OM APPEN
# Label for button that restores a withdrawn identification
Restore = Återställ
Reveal = Visa
REVIEW-INATURALIST = RECENSERA INATURALIST
# Title for section of observation filters for controls over whether you have
# reviewed the observations or not
REVIEWED = GRANSKADE
Reviewed-observations-only = Endast granskade fynd
# Label for the satellite map type
Satellite--map-type = Satellit
# Label for a button that persists something
SAVE = SPARA
# Label for a button that persists something
Save = Spara
SAVE-ALL = SPARA ALLA
SAVE-CHANGES = SPARA ÄNDRINGAR
SAVE-FOR-LATER = SPARA TILL SENARE
SAVE-LOCATION = SPARA PLATS
SAVE-PHOTOS = SPARA BILDER
Save-photos-to-your-gallery = Spara bilder till ditt galleri
Saved-Observation = Sparat fynd, köat för uppladdning
Scan-the-area-around-you-for-organisms = Skanna området omkring dig efter organismer.
Scientific-Name = Vetenskapligt namn
Scientific-Name-Common-Name = Vetenskapligt namn (vardagligt namn)
# Title for a search interface
SEARCH = SÖK
# Title for a search interface
Search = Sök
Search-for-a-project = Sök efter ett projekt
SEARCH-FOR-A-TAXON = SÖK EFTER ETT TAXON
Search-for-a-taxon = Sök efter ett taxon
SEARCH-LOCATION = SÖK PLATS
SEARCH-PROJECTS = SÖK PROJEKT
Search-suggestions-with-location = Sök förslag med plats
Search-suggestions-without-location = Sök förslag utan plats
SEARCH-TAXA = SÖK TAXA
SEARCH-USERS = SÖK ANVÄNDARE
# Accessibility label for Explore button on MyObservations toolbar
See-all-your-observations-in-explore = Se alla dina fynd i utforska
# Accessibility label for Observations button on UserProfile screen
See-observations-by-this-user-in-Explore = Se fynd av den här användaren i Utforska
# Accessibility label for Explore button in MyObservationsEmpty for logged out user
See-observations-in-explore = Se fynd i utforska
# Accessibility label for Explore button on TaxonDetails screen
See-observations-of-this-taxon-in-explore = Se fynd  av detta taxon i utforska
# Accessibility label for navigating to project members screen
See-project-members = Se projektmedlemmar
# Accessibility label for Species button on UserProfile screen
See-species-observed-by-this-user-in-Explore = Se arter som observerats av den här användaren i Utforska
Select-a-date-and-time-for-observation = Välj ett datum och tid för fynd
Select-captive-or-cultivated-status = Välj status för i fångenskap eller odlad
Select-geoprivacy-status = Välj status för geosekretess
Select-or-drag-media = Välj eller dra media
Select-photo = Välj bild
SELECT-THIS-TAXON = VÄLJ DETTA TAXON
# Label for an element that let's you select a user
Select-user = Välj användare
Selects-iconic-taxon-X-for-identification = Väljer organismgrupp { $iconicTaxon } för bestämning.
Separate-Photos = Separera bilder
# Month of September
September = september
SETTINGS = INSTÄLLNINGAR
Share = Dela
SHARE-DEBUG-LOGS = DELA FELSÖKNINGSLOGG
Share-location = Dela fyndplats
Share-map = Dela karta
# Preceded by the fragment # Preceded by the fragment, "By uploading your observation to iNaturalist, you can:"
Share-your-observation-where-it-can-help-scientists = Dela ditt fynd där det kan hjälpa forskare runtom i världen att bättre förstå den biologiska mångfalden.
SHOP-INATURALIST-MERCH = KÖP INATURALIST-PRYLAR
Show-observation-options = Visa fyndalternativ.
# Label for button that shows identification suggestions
Shows-identification-suggestions = Visar bestämningsförslag
Shows-iNaturalist-bird-logo = Visar iNaturalists fågellogotyp.
# Accessibility hint for button that shows observation creation options
Shows-observation-creation-options = Visar alternativ för att skapa fynd
Some-data-privacy-laws = Vissa dataintegritetslagar, som Europeiska unionens allmänna dataskyddsförordning (GDPR), kräver uttryckligt samtycke för att överföra personuppgifter från deras jurisdiktioner till andra jurisdiktioner där det rättsliga skyddet för denna information inte anses vara tillräckligt. Från och med 2020 anser EU inte längre att USA är en jurisdiktion som ger ett adekvat rättsligt skydd för personuppgifter, särskilt på grund av möjligheten för den amerikanska regeringen att övervaka uppgifter som kommer in i USA. Det är möjligt att andra jurisdiktioner kan ha samma åsikt.
# Generic error message
Something-went-wrong = Något gick fel.
Sorry-this-observation-was-deleted = Tyvärr, detta fynd har raderats
# Error message if the app tries to open a URL the operating system can't
# handle
Sorry-we-dont-know-how-to-open-that-URL = Tyvärr, vi vet inte hur man öppnar denna URL: { $url }
SORT-BY = SORTERA EFTER
Sort-by = Sortera efter
# Character separating current position and total duration when playing a
# sound, e.g. 00:12 / 03:00 uses "/" as the separator. This can be anything,
# but it should be very short.
sound-playback-separator = /
Sound-recorder = Ljudinspelare
sound-recorder-help-A-recording-of = En inspelning på 5–15 sekunder är bästa hjälpen för artbestämmare.
sound-recorder-help-Get-as-close-as-you-can = Ta dig så nära du säkert kan för att spela in organismen.
sound-recorder-help-Get-closer = Ta dig närmare
sound-recorder-help-Keep-it-short = Håll det kort
sound-recorder-help-Make-sure = Se till att ljudet av dina egna rörelser inte dränker organismens ljud.
sound-recorder-help-One-organism = En organism
sound-recorder-help-Stop-moving = Var stilla
sound-recorder-help-Try-to-isolate = Försök att isolera ljudet av endast en organism. Om det inte går, se till att anteckna vilken organism det är du spelar in.
Sounds = Ljud
Source-List = <0>(Källor: </0><1>{ $source }</1><0>)</0>
Spam = Spam
Spam-Examples = Kommersiella ärenden, länkar som inte leder någonstans, m.m.
Species = Art
Species-View = Artvy
SPECIES-WITHOUT-NUMBER =
    { $count ->
        [one] ART
       *[other] ARTER
    }
# Label for the standard map type
Standard--map-type = Standard
Start-must-be-before-end = Startdatum måste vara före slutdatumet.
Start-time = Starttid: { $date }
Start-upload = Starta uppladdning
# Accessibility hint for button that starts recording a sound
Starts-recording-sound = Startar ljudinspelning
Stay-on-this-screen = Var kvar på den här sidan medan din plats laddas.
Still-need-help = Behöver du fortfarande hjälp? Du kan skicka in en supportförfrågan här.
# Button or accessibility label for an interactive element that stops an upload
Stop-upload = Stoppa uppladdning
# Imperative verb for stopping the recording of a sound
Stop-verb = Stoppa
# Accessibility hint for a button that stops the recording of a sound
Stops-recording-sound = Stoppar ljudinspelning
SUBMIT = SKICKA IN
SUBMIT-ID-SUGGESTION = SKICKA IN FÖRSLAG
SUGGEST-ID = FÖRESLÅ BESTÄMNING
# Label for element that suggest an identification
Suggest-ID = FÖRESLÅ ID
# Identification category
supporting--identification = Håller med
Switches-to-tab = Byter till { $tab }-flik.
Sync-observations = Synka fynd
Syncing = Synkar...
Take-photo = Ta bild
Take-photos-with-the-camera = Ta bilder på en enda organism med kameran
# label in project requirements
Taxa = Taxa
TAXON = TAXON
# Settings screen
TAXON-NAMES-DISPLAY = VISNING AV TAXONNAMN
TAXONOMIC-RANKS = TAXONOMISKA RANGER
# Header for a block of text describing a taxon's taxonomy
TAXONOMY-header = TAXONOMI
TEAM = TEAM
Terms-of-Use = Användarvillkor
TERMS-OF-USE = ANVÄNDARVILLKOR
Text-Box-to-Describe-Reason-for-Flag = Textruta för att beskriva anledning till flagga.
Thank-you-for-sharing-your-feedback = Tack för att du återkopplar och hjälper oss att bli bättre!
Thanks-for-using-any-suggestions = Tack för att du använder den här appen! Har du några förslag till de personer som gör den?
That-user-profile-doesnt-exist = Den användarprofilen finns inte
The-exact-location-will-be-hidden = Den exakta positionen kommer att döljas publikt, och i stället generaliseras till ett större område. (Hotade och känsliga arter diffuseras automatiskt).
The-iNaturalist-Network = iNaturalist-nätverket är en samling lokaliserade webbplatser som är fullt anslutna till den globala iNaturalist-communityn. Nätverksplatser stöds av lokala institutioner som främjar lokal användning och underlättar användningen av data från iNaturalist för att gynna lokal biologisk mångfald.
The-location-will-not-be-visible = Positionen kommer inte att synas för andra, vilket innebär att det kan bli svårt att bestämma.
The-models-that-suggest-species = Modellerna som föreslår arter baserat på visuell likhet och plats existerar bland annat tack vare samarbeten med Sara Beery, Tom Brooks, Elijah Cole, Christian Lange, Oisin Mac Aodha, Pietro Perona och Grant Van Horn.
There-is-no-way = Det är inte möjligt att ha ett iNaturalist-konto utan att spara personlig information, så det enda sättet att återkalla detta samtycke är genom att radera ditt konto.
#  Wild status sheet descriptions
This-is-a-wild-organism = Detta är en vild organism och placerades inte på denna plats av människor.
This-is-how-taxon-names-will-be-displayed = Så här kommer alla taxonnamn att visas för dig på iNaturalist:
This-observer-has-opted-out-of-the-Community-Taxon = Den här observatören har valt bort communityns taxon
This-organism-was-placed-by-humans = Denna organism placerades på denna plats av människor. Detta gäller för sådant som trädgårdsväxter, husdjur och djurparksdjur.
To-access-all-other-settings = För att komma åt alla andra kontoinställningar, klicka här:
To-learn-more-about-what-information = För att läsa mer om vilken information vi samlar in och hur vi använder den, vänligen se vår integritetspolicy och våra användarvillkor.
To-sync-your-observations-to-iNaturalist = För att synka dina fynd med iNaturalist, vänligen logga in.
To-view-nearby-organisms-please-enable-location = Aktivera plats för att se organismer i närheten.
To-view-nearby-projects-please-enable-location = Aktivera plats för att se projekt i närheten.
Toggle-map-type = Växla karttyp
TOP-ID-SUGGESTION = BÄSTA BESTÄMNINGSFÖRSLAG
Traditional-Project = Traditionellt projekt
Umbrella-Project = Paraplyprojekt
UNFOLLOW = SLUTA FÖLJA
UNFOLLOW-USER = SLUTA FÖLJA ANVÄNDAREN?
# Text to show when a taoxn rank is unknown or missing
Unknown--rank = Okänd
# Text to show when a taxon or identification is unknown or missing
Unknown--taxon = Okänd
# Text to show when a user (or their name) is unknown or missing
Unknown--user = Okänd
# Generic error message
Unknown-error = Okänt fel
Unknown-organism = Okänd organism
Unreviewed-observations-only = Endast ej granskade fynd
Upload-Complete = Uppladdning klar
Upload-in-progress = Uppladdning pågår
UPLOAD-NOW = LADDA UPP NU
Upload-photos-from-your-gallery = Ladda upp flera bilder från ditt galleri
Upload-photos-from-your-gallery-and-create-observations = Ladda upp bilder från ditt galleri och skapa fynd och få bestämningar av organismer som du redan har observerat!
Upload-Progress = Uppladdning { $uploadProgress } procent klar
UPLOAD-TO-INATURALIST = LADDA UPP TILL INATURALIST
# Shows the number of observations a user can upload to iNat from my observations page
Upload-x-observations =
    Ladda upp { $count ->
        [one] 1 fynd
       *[other] { $count } fynd
    }
# Describes whether a user made this observation from web, iOS, or Android
Uploaded-via-application = Uppladdad via: { $application }
# Shows the progress of uploads for X of Y observations, but omits the
# word "observations" so the message won't get cut off on small screens
Uploading-x-of-y = Laddar upp { $currentUploadCount } av { $total }
# Shows the number of observations a user is currently uploading out of total on my observations page
Uploading-x-of-y-observations =
    { $total ->
        [one] laddar upp { $currentUploadCount } fynd
       *[other] laddar upp { $currentUploadCount } av { $total } fynd
    }
Use-iNaturalists-AI-Camera = Använd iNaturalists AI-kamera för att bestämma organismer i realtid
# Text for a button prompting the user to grant access to location
USE-LOCATION = ANVÄND PLATS
Use-the-devices-other-camera = Använd enhetens andra kamera.
Use-the-iNaturalist-camera-to-observe = Använd iNaturalist-kameran för att observera och bestämma organismer på skärmen i realtid, och dela dem med vår communtiy för att få bestämningar och bidra till vetenskapen!
Use-your-devices-microphone-to-record = Använd din enhets mikrofon för att spela in ljud gjorda av organismer och dela dem med vår community för att få bestämningar och bidra till vetenskapen!
USER = ANVÄNDARE
User = Användare { $userHandle }
USERNAME = ANVÄNDARNAMN
# Appears above the text fields
USERNAME-OR-EMAIL = ANVÄNDARNAMN ELLER E-POST
# label in project requirements
Users = Användare
Using-iNaturalist-requires-the-storage = Att använda iNaturalist kräver lagring av personuppgifter som din e-postadress, all iNaturalist-data lagras i USA, och vi kan inte vara säkra på vilken jurisdiktion du är i när du använder iNaturalist, så för att följa integritetslagar som GDPR, måste du bekräfta att du förstår och accepterar denna risk och samtycker till att dina personuppgifter överförs till iNaturalists servrar i USA.
# Listing of app and build versions
Version-app-build = Version { $appVersion } ({ $buildVersion })
VIEW-ALL-X-PLACES = SE ALLA { $count } PLATSER
VIEW-ALL-X-PROJECTS = SE ALLA { $count } PROJEKT
VIEW-ALL-X-TAXA = SE ALLA { $count } TAXA
VIEW-ALL-X-USERS = SE ALLA { $count } ANVÄNDARE
VIEW-CHILDREN-TAXA = VISA UNDERLIGGANDE TAXA
VIEW-DATA-QUALITY-ASSESSMENT = SE DATAKVALITETSBEDÖMNING
VIEW-EDUCATORS-GUIDE = SE UNDERVISNINGSGUIDE
View-in-browser = Se i webbläsaren
VIEW-IN-EXPLORE = SE I UTFORSKA
VIEW-INATURALIST-HELP = SE INATURALIST-HJÄLP
# Button or accessibility label for an element that lets the user view a
# photo
View-photo = Se bild
View-photo-licensing-info = Se bildlicensinformation
VIEW-PROJECT-REQUIREMENTS = SE PROJEKTKRAV
# Button that lets user view a list of projects related to the observation or user profile they're viewing
VIEW-PROJECTS = SE PROJEKT
# Label for a button that shows identification suggestions for an observation
# or photo
View-suggestions = Se förslag
We-are-not-confident-enough-to-make-a-top-ID-suggestion = Vi är inte tillräckligt säkra för att göra ett enda bästa bestämningsförslag, men här är våra %1$d bästa förslag:
We-sent-a-confirmation-email = Vi skickade ett bekräftelsemejl till e-posten du registrerade dig med.
We-store-personal-information = Vi sparar personlig information som användarnamn och e-postadresser för att hantera konton på denna webbplats, och för att vi ska kunna följa integritetsslagar behöver du markera denna ruta för att ange att du samtycker till denna användning av personuppgifter. För att läsa mer om vilken information vi samlar in och hur vi använder den, vänligen se vår integritetspolicy och våra användarvillkor.
Welcome-to-iNaturalist = Välkommen till iNaturalist!
# Welcome user back to app
Welcome-user = <0>Välkommen tillbaka,</0><1>{ $userHandle }</1>
WHAT-IS-INATURALIST = VAD ÄR INATURALIST?
Whats-more-by-recording = Genom att registrera och dela dina observationer skapar du dessutom data av forskningskvalitet för forskare som arbetar för att bättre förstå och skydda naturen. Så om du gillar att dokumentera det du hittar utomhus, eller om du bara gillar att lära dig om livet, gå med i iNaturalist!
When-tapping-the-green-observation-button = När du trycker på den gröna observationsknappen, öppna:
WIKIPEDIA = WIKIPEDIA
Wild = Vild
WILD-STATUS = STATUS SOM VILD
# Label for a button that withdraws an identification
Withdraw = Dra tillbaka
# Button to Withdraw identification made by user
WITHDRAW-ID = DRA TILLBAKA BESTÄMNING
WITHDRAW-ID-QUESTION = DRA TILLBAKA BESTÄMNING?
Withdraws-identification = Drar tillbaka bestämning
Worldwide = Världsomfattande
WORLDWIDE = VÄRLDSOMFATTANDE
Would-you-like-to-discard-your-current-recording-and-start-over = Vill du slänga din nuvarande inspelning och börja om?
Would-you-like-to-suggest-the-following-identification = Vill du föreslå följande bestämning?
x-comments =
    { $count ->
        [one] { $count } kommentar
       *[other] { $count } kommentarer
    }
X-Identifications =
    { $count ->
        [one] { $count } bestämning
       *[other] { $count } bestämningar
    }
x-identifications =
    { $count ->
        [one] { $count } bestämning
       *[other] { $count } bestämningar
    }
X-Identifiers =
    { $count ->
        [one] { $count } bestämmare
       *[other] { $count } bestämmare
    }
# Subheader for number of project members screen
X-MEMBERS = { $count } MEDLEMMAR
# Shows number of observations in a variety of contexts
X-Observations =
    { $count ->
        [one] 1 Fynd
       *[other] { $count } Fynd
    }
# Shows number of observations in a variety of contexts
X-observations =
    { $count ->
        [one] 1 fynd
       *[other] { $count } fynd
    }
X-observations-deleted =
    { $count ->
        [one] 1 fynd raderad
       *[other] { $count } fynd raderade
    }
X-observations-uploaded =
    { $count ->
        [one] 1 fynd uppladdat
       *[other] { $count } fynd uppladdade
    }
X-Observers =
    { $count ->
        [one] { $count } Observatör
       *[other] { $count } Observatörer
    }
# Progress or position indicator, e.g. when viewing 2 of 3 observations, or 3
# of 10 photos
X-of-Y =
    { $x ->
        [one] 1
       *[other] { $x }
    } { $y ->
        [one] av { $y }
       *[other] av { $y }
    }
# Displays number of photos attached to an observation in the Media Viewer
X-PHOTOS =
    { $photoCount ->
        [one] 1 BILD
       *[other] { $photoCount } BILDER
    }
# Displays number of photos and observations a user has selected from the camera roll
X-PHOTOS-X-OBSERVATIONS =
    { $photoCount ->
        [one] 1 BILD
       *[other] { $photoCount } BILDER
    }, { $observationCount ->
        [one] 1 FYND
       *[other] { $observationCount } FYND
    }
# Displays number of photos and sounds attached to an observation in the Media
# Viewer
X-PHOTOS-Y-SOUNDS =
    { $photoCount ->
        [one] 1 BILD
       *[other] { $photoCount } BILDER
    }, { $soundCount ->
        [one] 1 LJUD
       *[other] { $soundCount } LJUD
    }
X-PROJECTS = { $projectCount } PROJEKT
# Displays number of sounds attached to an observation in the Media Viewer
X-SOUNDS =
    { $count ->
        [one] 1 LJUD
       *[other] { $count } LJUD
    }
X-Species =
    { $count ->
        [one] { $count } Art
       *[other] { $count } Arter
    }
x-uploads-failed =
    { $count ->
        [one] { $count } uppladdning misslyckades
       *[other] { $count } uppladdningar misslyckades
    }
Yes-license-my-photos = Ja, licensiera mina bilder, ljud och fynd så att forskare kan använda mina data (rekommenderas)
You-are-offline = Du är offline
You-are-offline-Tap-to-reload = Du är offline. Tryck för att ladda om.
You-are-offline-Tap-to-try-again = Du är offline. Tryck för att försöka igen.
You-can-add-up-to-20-media = Du kan lägga till upp till 20 bilder och 20 ljud per fynd.
You-can-also-check-out-merchandise = Du kan också kolla in varor för iNaturalist och Seek i vår butik nedan!
You-can-also-explore-existing-observations = Du kan också utforska befintliga fynd på iNaturalist för att upptäcka vad som finns omkring dig.
You-can-click-join-on-the-project-page = Du kan klicka på ”gå med” på projektsidan.
You-can-find-answers-on-our-help-page = Du kan hitta svar på vår hjälpsida.
You-can-only-add-20-photos-per-observation = Du kan bara lägga till 20 bilder per fynd
# Onboarding text on MyObservations: Onboarding text on MyObservations: 51-100 observations
You-can-search-observations-of-any-plant-or-animal = Du kan söka fynd av vilka växter eller djur som helst, var som helst i världen, med Utforska!
You-can-still-share-the-file = Du kan fortfarande dela filen med en annan app. Om du kan mejla den, skicka den till { $email }
You-can-upload-this-observation-to-our-community = Du kan ladda upp detta fynd till vår community för att få en bestämning av en riktig person, och hjälpa vår AI att förbättra sina bestämningar i framtiden
You-changed-filters-will-be-discarded = Du ändrade filter, men de tillämpades inte på dina sökresultat i utforska.
You-have-opted-out-of-the-Community-Taxon = Du har valt bort Communityns taxon
You-havent-joined-any-projects-yet = Du har inte gått med i några projekt ännu!
You-must-be-logged-in-to-view-messages = Du måste vara inloggad för att se meddelanden
# Error message when you try to do something that requires an Internet
# connection but such a connection is, tragically, missing
You-need-an-Internet-connection-to-do-that = Du behöver en internetanslutning för att göra det.
# Error message when you try to do something that requires log in
You-need-log-in-to-do-that = Du måste logga in för att göra det.
You-will-see-notifications = Du kommer se aviseringar här när du väl loggat in och laddat upp fynd.
Your-donation-to-iNaturalist = Din donation till iNaturalist stödjer förbättringar och stabilitet i mobilapparna och webbplatsen som knyter miljontals människor till naturen och möjliggör skydd av biologisk mångfald över hela världen!
Your-email-is-confirmed = Din e-postadress är bekräftad! Logga in för att fortsätta.
Your-location-uncertainty-is-over-x-km = Din platsosäkerhet är över { $x } km, vilket är för mycket för att vara till hjälp för bestämmare. Redigera positionen och zooma in tills noggrannhetscirkeln blir grön och är centrerad på platsen där du observerat organismen.
Youre-always-in-control-of-the-location-privacy = Du har alltid kontroll över positionssekretessen för varje fynd du skapar.
# Text prompting the user to open Settings to grant permission after
# permission has been denied
Youve-denied-permission-prompt = Du har nekat tillstånd. Vänligen ge tillstånd i inställningsappen.
Youve-previously-denied-camera-permissions = Du har tidigare nekat kamerabehörigheter - vänligen aktivera dem i inställningarna.
Youve-previously-denied-gallery-permissions = Du har tidigare nekat galleribehörigheter - vänligen aktivera dem i inställningarna.
Youve-previously-denied-location-permissions = Du har tidigare nekat platsbehörigheter - vänligen aktivera dem i inställningarna.
Youve-previously-denied-microphone-permissions = Du har tidigare nekat mikrofonbehörigheter - vänligen aktivera dem i inställningarna.
Zoom-in-as-much-as-possible-to-improve = Zooma in så mycket som möjligt för att förbättra positionens noggrannhet och få bättre bestämningar.
Zoom-to-current-location = Zooma till aktuell position
# Label for button that shows zoom level, e.g. on a camera
zoom-x = { $zoom }×
