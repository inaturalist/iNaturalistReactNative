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
### * Keys should match their content closely but not exceed 100 chars
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

# Subheader under logo in the login screen
A-global-community-for-nature = A global community for nature
# Onboarding observation story screen: checklist item completeing "An
# observation is:". Text in tags is bold
a-photo-or-sound-recording = <0>a </0><1>photo</1><0> or </0><1>sound recording</1>
# Header for a general description, e.g. of a user, or of iNaturalist itself
ABOUT = ABOUT
# Header on a project's details explaining what collection projects are, all
# caps as a header style
ABOUT-COLLECTION-PROJECTS = ABOUT COLLECTION PROJECTS
# Title in the header of the About iNaturalist screen, all caps as a header
# style
ABOUT-INATURALIST = ABOUT INATURALIST
# About the Data Quality Assessment
ABOUT-THE-DQA = ABOUT THE DQA
# Explanation of the Quality Grade at the top of the Data Quality Assessment
# screen
About-the-DQA-description = The Quality Grade summarizes the accuracy, precision, completeness, relevance, and appropriateness of an iNaturalist observation as biodiversity data. Some attributes are automatically determined, while others are subject to a vote by iNat users. iNaturalist shares licensed "Research Grade" observations with a number of data partners for use in science and conservation.
# Header on a project's details explaining what traditional projects are, all
# caps as a header style
ABOUT-TRADITIONAL-PROJECTS = ABOUT TRADITIONAL PROJECTS
# Header on a project's details explaining what umbrella projects are, all caps
# as a header style
ABOUT-UMBRELLA-PROJECTS = ABOUT UMBRELLA PROJECTS
# Label for a taxon when a user prefers to see or hear the common name first
accessible-comname-sciname = { $commonName } ({ $scientificName })
# Label for a taxon when a user prefers to see or hear the scientific name first
accessible-sciname-comname = { $scientificName } ({ $commonName })
# Alert message shown after account deletion
Account-Deleted = Account Deleted
# Label for button that shows all account settings
ACCOUNT-SETTINGS = ACCOUNT SETTINGS
# Tab label on the observation detail screen that shows identifications and
# comments (noun), all caps style
ACTIVITY = ACTIVITY
# Label for a button that adds a vote of agreement
Add-agreement = Add agreement
# Title in the header of the identification suggestions screen, where the user
# picks an ID (identification)
ADD-AN-ID = ADD AN ID
# Button in the footer of the identification suggestions screen to skip choosing
# an ID for now
Add-an-ID-Later = Add an ID Later
# Button that opens a form to add a comment to an identification, in the ID
# sheets on the observation detail screen
ADD-COMMENT = ADD COMMENT
# Placeholder in the observation editor's date field when the observation has no
# date and time yet
Add-Date-Time = Add Date/Time
# Label for a button that adds a vote of disagreement
Add-disagreement = Add disagreement
# Title of the sheet in the observation editor with options to add photos or
# sounds as evidence
ADD-EVIDENCE = ADD EVIDENCE
# Label for a button that shows options for adding evidence, e.g. camera,
# photo library, sound, etc
Add-evidence = Add evidence
# Accessibility label for the star button on an observation's photo that marks
# it as a favorite
Add-favorite = Add favorite
# Placeholder in the observation editor's location row when the observation has
# no location yet
Add-Location = Add Location
# Button on the Match screen that adds a location to the observation to get
# better ID suggestions
ADD-LOCATION-FOR-BETTER-IDS = ADD LOCATION FOR BETTER IDS
# Accessibility hint for adding a location to a new obseration in the Match screen new user flow
Add-location-to-refresh-suggestions = Add location to refresh suggestions
# Accessibility label for a button that starts the process of adding an
# observation, e.g. the button in the tab bar
Add-observations = Add observations
# Placeholder and accessibility label for the notes (description) field in the
# observation editor
Add-optional-notes = Add optional notes
# Row label in the observation editor that opens the screen for adding the
# observation to projects
Add-to-Projects = Add to Projects
# Title in the header of the screen for adding an observation to projects, all
# caps as a header style
ADD-TO-PROJECTS = ADD TO PROJECTS
# Toast shown after the user saves the current Explore search
Added-to-Saved-Searches = Added to Saved Searches
# Row label in the observation editor showing how many projects the observation
# is added to; $count is the number of projects
Added-to-X-Projects =
    Added to { $count } { $count ->
        [one] Project
       *[other] Projects
    }
# Hint for a button that adds an identification
Adds-ID = Adds ID
# Hint for a button that adds a vote of agreement
Adds-your-vote-of-agreement = Adds your vote of agreement
# Hint for a button that adds a vote of disagreement
Adds-your-vote-of-disagreement = Adds your vote of disagreement
# Label for toggling app mode between default and advanced settings
Advanced-Mode = Advanced Mode
# Header of the advanced search screen
ADVANCED-SEARCH = ADVANCED SEARCH
# Link to the advanced search screen with more search filters
Advanced-Search = Advanced Search
# Section header in Settings for advanced options, all caps as a header style
ADVANCED-SETTINGS = ADVANCED SETTINGS
# Line on a user profile showing the iNaturalist network site the user belongs
# to; $site is the site name
Affiliation = Affiliation: { $site }
# Label in Settings advanced options above radio buttons choosing which screen
# appears after taking or importing photos
After-capturing-or-importing-photos-show = After capturing or importing photos, show:
# Label for button that adds an identification of the same taxon as another identification
Agree = Agree
# Label for button that adds an identification of the same taxon as another identification
AGREE = AGREE
# Title of the sheet on the observation detail screen asking the user to confirm
# agreeing with an identification
AGREE-WITH-ID = AGREE WITH ID?
# Message in the sheet asking the user to confirm agreeing with an
# identification; the taxon is shown below it
Agree-with-ID-description = Would you like to agree with the ID and suggest the following identification?
# This is what we call the camera that
# overlays identification suggestions in real time
AI-Camera = AI Camera
# All-caps option meaning no restriction, shown on Explore filter dropdown
# buttons (e.g. date, taxonomic rank, photo license)
ALL = ALL
# Option in Explore filters meaning no restriction (e.g. all dates, all media
# types, wild and captive)
All = All
# Radio button option in Settings advanced options: the add-observation button
# shows all of the listed ways to observe
All-observation-options--list = All observation options: iNaturalist AI Camera, Standard Camera, Uploading from Photo Library, and Sound Recorder
# Option in the Explore filters reviewed-status filter: include both reviewed
# and unreviewed observations
All-observations = All observations
# Text in an onboarding card shown when the user can start sharing observations
# to iNaturalist
All-observations-need-a-date-and-location-to-be-used-for-science = All observations need a date and location to be used for science. Please edit observations if they need more information.
# Shown in the Explore header and saved searches when no taxon filter is
# selected
All-organisms = All organisms
# Status message on the Add to Projects screen when all required project fields
# are filled in
All-required-fields-have-been-filled = All required fields have been filled
# As in intellectual property rights over a photo or other creative work
all-rights-reserved = all rights reserved
# Default value for the Taxa requirement on a project's requirements screen when
# the project allows any taxon
All-taxa = All taxa
# Button on Explore and Projects that opens the location permission prompt so
# nearby results can be shown
ALLOW-LOCATION-ACCESS = ALLOW LOCATION ACCESS
# Button asking if user has an existing iNaturalist account
Already-have-an-iNaturalist-account = Already have an iNaturalist account?
# Display name for the iconic taxa category for amphibia
Amphibians = Amphibians
# Message at the bottom of an observation list when more observations can't load
# because the device is offline
An-Internet-connection-is-required = An Internet connection is required to load more observations.
# Onboarding observation story screen: introduces a checklist of what makes an
# observation; each item that follows completes this sentence
An-observation-is = An observation is:
# Message shown to the user after they have left the AI camera where they may
# have seen a species suggestion but before they land on the match screen,
# where they might see a better suggestion.
Analyzing-for-the-best-identification = Analyzing for the best identification...
# Title of a camera tip about insects
Antennae-legs-and-wings = Antennae, legs, and wings
# Option when choosing a value for an date filter that indicates any value is
# acceptable
Any--date = Any
# Option when choosing a value for an Establishment Means filter that
# indicates any value is acceptable
Any--establishment-means = Any
# Option when choosing a value for an media type filter that indicates any
# value is acceptable
Any--media-type = Any
# Option when choosing a value for an project filter that indicates any value
# is acceptable
Any--project = Any
# Option when choosing a value for an quality grade filter that indicates any
# value is acceptable
Any--quality-grade = Any
# Option when choosing a value for an user filter that indicates any value is
# acceptable
Any--user = Any
#  Geoprivacy sheet descriptions
Anyone-using-iNaturalist-can-see = Anyone using iNaturalist can see where this species was observed, and scientists can most easily use it for research.
# Section header in Settings and title of the language picker sheet, all caps as
# a header style
APP-LANGUAGE = APP LANGUAGE
# Combine pieces of a person's name provided by Apple. See
# https://developer.apple.com/documentation/foundation/nspersonnamecomponents
# for documentation of what the variables mean. The JOIN function will
# combine all the arguments and separate them by the "separator" option. For
# example, JOIN($givenName, $familyName) might result in a string like "Jane
# Doe". You can ommit pieces of the name, or choose not to use the JOIN
# function if you want, but the easiest thing to do is probably just to alter
# the order of the pieces.
apple-full-name = { JOIN($namePrefix, $givenName, $middleName, $nickname, $familyName, $nameSuffix, separator: " ") }
# Month of April
April = April
# Display name for the iconic taxa category for arachnida
Arachnids = Arachnids
# Text in the Help screen's Educators section, above a button that opens the
# educator's guide
Are-you-an-educator = Are you an educator wanting to use iNaturalist with your students?
# Confirmation message shown when the user taps Log out, warning that
# un-uploaded observations will be deleted
Are-you-sure-you-want-to-log-out = Are you sure you want to log out of your iNaturalist account? All observations that haven’t been uploaded to iNaturalist will be deleted.
# Accessibility hint for the close button on onboarding steps, which opens a sheet asking whether to exit
Asks-whether-to-exit = Asks whether to exit.
# Onboarding observation story screen: checklist item completing "An
# observation is:". Text in tags is bold
at-the-time-and-place-you-saw-it = <0>at the </0><1>time and place</1><0> you saw it.</0>
# Photo/observation license description in an observation's details, after the
# copyright owner; CC BY license code should stay as is
attribution-cc-by = some rights reserved (CC BY)
# Photo/observation license description in an observation's details, after the
# copyright owner; CC BY-NC license code should stay as is
attribution-cc-by-nc = some rights reserved (CC BY-NC)
# Photo/observation license description in an observation's details, after the
# copyright owner; CC BY-NC-ND license code should stay as is
attribution-cc-by-nc-nd = some rights reserved (CC BY-NC-ND)
# Photo/observation license description in an observation's details, after the
# copyright owner; CC BY-NC-SA license code should stay as is
attribution-cc-by-nc-sa = some rights reserved (CC BY-NC-SA)
# Photo/observation license description in an observation's details, after the
# copyright owner; CC BY-ND license code should stay as is
attribution-cc-by-nd = some rights reserved (CC BY-ND)
# Photo/observation license description in an observation's details, after the
# copyright owner; CC BY-SA license code should stay as is
attribution-cc-by-sa = some rights reserved (CC BY-SA)
# Month of August
August = August
# Title of a camera tip about reptiles
Back-and-full-body = Back and full body
# Title of a camera tip about amphibians
Back-of-the-animal = Back of the animal
# Returns user to login screen
BACK-TO-LOGIN = BACK TO LOGIN
# Explanation on observation details for an observation with casual quality grade
Because-this-observation-is-of-a-pet-garden-plant-or-zoo-animal = Because this observation is of a pet, garden plant, or zoo animal, it is not eligible for research grade.
# Display name for the iconic taxa category for aves
Birds = Birds
# Item in the main menu that opens the iNaturalist blog, all caps style
BLOG = BLOG
# Title of a camera tip about mollusks
Body-parts-and-colors = Body parts and colors
# Accessibility label for bulk import / photo import button
# These are used by screen readers to label actionable elements iOS: https://developer.apple.com/documentation/uikit/uiaccessibilityelement/1619577-accessibilitylabel
# iOS Guidelines "A string that succinctly identifies the accessibility element." Starts with capital letter, no ending punctuation.
Bulk-importer = Bulk importer
# Message in the sheet shown when leaving the observation editor with unsaved
# changes
By-exiting-changes-not-saved = By exiting, changes to your observation will not be saved.
# Message in the sheet shown when leaving the observation editor with a new,
# unsaved observation
By-exiting-observation-not-saved = By exiting, your observation will not be saved.
# Message in the sheet shown when leaving the observation editor with several
# unsaved observations
By-exiting-your-observations-not-saved = By exiting, your observations will not be saved. You can save them to your device, or you can delete them.
# Message in the sheet shown when leaving the camera with photos that have not
# been saved
By-exiting-your-photos-will-not-be-saved = By exiting, your photos will not be saved.
# Message in the sheet shown when leaving the sound recorder with a recording
# that has not been saved
By-exiting-your-recorded-sound-will-not-be-saved = By exiting, your recorded sound will not be saved.
# Button in explore filters to search for species or observations by the signed in user
BY-ME = BY ME
# Lead in to a list including "Get your identifcation verified..." and "Share your observation..."
By-uploading-your-observation-to-iNaturalist-you-can = By uploading your observation to iNaturalist, you can:
# Accessibility label for the button that opens the camera, in the
# add-observation and add-evidence sheets
Camera = Camera
# Label for a button on the camera that opens tips for taking good photos
Camera-tips = Camera tips
# Button that cancels and closes a confirmation sheet or dialog, all caps style
CANCEL = CANCEL
# Button that cancels an alert, e.g. when sharing a log file without an email
# app
Cancel = Cancel
# Option meaning the organism is captive or cultivated (not wild), used in the
# observation editor, Explore filters, and project rules
Captive-Cultivated = Captive/Cultivated
# Quality grade indicating observation does not quality for Needs ID or
# Research Grade, e.g. missing media, voted out, etc.
Casual--quality-grade = Casual
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
# Button in Settings that opens the sheet for choosing the app's language
CHANGE-APP-LANGUAGE = CHANGE APP LANGUAGE
# Label for a button that changes a selected date
CHANGE-DATE = CHANGE DATE
# Label for a button that changes a selected date
Change-date = Change date
# Label for a button that changes a selected end date
CHANGE-END-DATE = CHANGE END DATE
# Label for a button that changes a selected end date
Change-end-date = Change end date
# Accessibility label for a button that allows users to sort observations
Change-observations-sort-order = Change observations sort order
# Accessibility label for choosing a different project in the Explore filters
# project search
Change-project = Change project
# Accessibility label for a button that allows users to sort taxa
Change-species-sort-order = Change species sort order
# Label for a button that changes a selected start date
CHANGE-START-DATE = CHANGE START DATE
# Label for a button that changes a selected start date
Change-start-date = Change start date
# Accessibility label for the button that changes the selected taxon in Explore
# filters
Change-taxon = Change taxon
# Accessibility label for the button that changes the selected user in Explore
# filters
Change-user = Change user
# Label for a button that cycles through zoom levels for the camera
Change-zoom = Change zoom
# Notification that appears after pressing the reset password button
CHECK-YOUR-EMAIL = CHECK YOUR EMAIL!
# Placeholder for a date-type project field on the Add to Projects screen
Choose-a-date = Choose a date
# Placeholder for a date-and-time project field on the Add to Projects screen
Choose-a-date-time = Choose a date & time
# Button on the advanced search screen that opens the list of saved searches
CHOOSE-A-SAVED-SEARCH = CHOOSE A SAVED SEARCH
# Placeholder for a time-type project field on the Add to Projects screen
Choose-a-time = Choose a time
# Label for a text input field during sign up to choose a username
CHOOSE-A-USERNAME = CHOOSE A USERNAME
# Accessibility hint for a button that chooses a taxon
Chooses-taxon = Chooses taxon
# Accessibility hint for button that chooses the best suggestion among a list of suggested
# taxa for an identification
Chooses-top-taxon = Chooses top taxon
# Title of a camera tip about crustaceans
Claws-and-legs = Claws and legs
# Label for a button that closes a window or popup
Close = Close
# Accessibility label for a button that closes the permission request screen
Close-permission-request-screen = Close permission request screen
# Label for a button that closes a search interface
Close-search = Close search
# Body of the camera tip "Antennae, legs, and wings" for insects
Close-ups-of-these-including-the-veins-on-clear-wings-help-identifiers-sort-out-similar-groups = Close-ups of these, including the veins on clear wings, help identifiers sort out similar groups.
# Accessibility hint for button that closes the explanation card
Closes-explanation = Closes explanation
# Accessibility hint for button that closes the introductory slides that
# appear when you first install the app
Closes-introduction = Closes introduction
# Accessibility hint for button that closes the help that
Closes-withdraw-id-sheet = Closes "Withdraw ID" sheet
# Heading for a section that describes people and organizations that
# collaborate with iNaturalist
COLLABORATORS = COLLABORATORS
# Heading at the bottom of the Add to Projects screen, above an explanation of
# projects that include observations automatically
Collection-and-Umbrella-Projects = Collection & Umbrella Projects
# Label for the project type, shown in project lists and on a project's details
# screen
Collection-Project = Collection Project
# Title of a camera tip about birds
Colors-and-markings = Colors and markings
# Title of a camera tip about fishes
Colors-and-patterns = Colors and patterns
# Button that combines multiple photos into a single observation
Combine-Photos = Combine Photos
# Title for a form that let's you enter a comment
COMMENT = COMMENT
# Label for a button that shows options for a comment
Comment-options = Comment options
# Label for a setting that shows the common name first
Common-Name-Scientific-Name = Common Name (Scientific Name)
# Label for section of ObsDetails with community comments and ids
Community-Discussion = Community Discussion
# Link on the About iNaturalist screen that opens the community guidelines
Community-Guidelines = Community Guidelines
# Button on the sign-up Learn More screen, and title of the web page that opens,
# showing the community guidelines
COMMUNITY-GUIDELINES = COMMUNITY GUIDELINES
# Label on match screen for how much confidence there is for a suggestion (i.e. 99% confidence)
Confidence--label = Confidence
# Button that confirms a choice the user has made
CONFIRM = CONFIRM
# Join traditional project after choosing curator coordinate access
CONFIRM-AND-JOIN = CONFIRM & JOIN
# Title of the onboarding card shown after the user makes their first
# observation
Congratulations-You-made-your-first-observation = Congratulations! You made your first observation!
# Onboarding carousel header second screen
Connect-with-expert-naturalists = Connect with expert naturalists
# Text in the Help screen's iNaturalist Forum section, above a button that opens
# the forum
Connect-with-other-naturalists = Connect with other naturalists and engage in conversations.
# Error shown when an observation upload fails because of a network problem
Connection-problem-Please-try-again-later = Connection problem. Please try again later.
# Section header and button in the Help screen that opens a form to contact
# iNaturalist support
CONTACT-SUPPORT = CONTACT SUPPORT
# Shown in place of an identification, comment, photo, or sound that was hidden
# by moderators
Content-Hidden = Content Hidden
# Continue button in onboarding screen
CONTINUE = CONTINUE
# Notification when coordinates have been copied
Coordinates-copied-to-clipboard = Coordinates copied to clipboard
# Button that copies coordinates to the clipboard
Copy-coordinates = Copy Coordinates
# Right to control copies of a creative work; this string may be used as a
# heading to describe general information about rights, attribution, and
# licensing
Copyright = Copyright
# Error message when no camera can be found
Could-not-find-a-camera-on-this-device = Could not find a camera on this device
# Error alert shown when adding a comment on the observation detail screen fails
Couldnt-create-comment = Couldn't create comment
# Error alert shown when adding an identification fails; $error is the error
# message
Couldnt-create-identification-error = Couldn't create identification { $error }
# Error alert shown when adding an identification fails for an unknown reason
Couldnt-create-identification-unknown-error = Couldn't create identification, unknown error.
# Button on the last sign-up screen that creates the user's iNaturalist account
CREATE-AN-ACCOUNT = CREATE AN ACCOUNT
# Option in the add-observation sheet that creates an observation without photos
# or sounds
Create-observation-with-no-evidence = Create observation with no evidence
# Heading of a section of camera tips about crustaceans
Crustaceans = Crustaceans
# Section header on the observation detail screen's Details tab, all caps as a
# header style
DATA-QUALITY = DATA QUALITY
# Title of the Data Quality Assessment screen and the button on the observation
# detail screen that opens it
DATA-QUALITY-ASSESSMENT = DATA QUALITY ASSESSMENT
# Question on the Data Quality Assessment screen that users vote yes or no on
Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence = Based on the evidence, can the Community Taxon still be improved?
# Item in the Data Quality Assessment checklist of conditions for Research Grade
Data-quality-assessment-community-taxon-species-level-or-lower = Community taxon at species level or lower
# Data Quality Assessment section label: whether or not the observation date is accurate
Data-quality-assessment-date-is-accurate = Date is accurate
# Data Quality Assessment section label: whether or not the observation date was specified
Data-quality-assessment-date-specified = Date specified
# Description on the Data Quality Assessment screen for an observation with
# Casual quality grade
Data-quality-assessment-description-casual = This observation has not met the conditions for Research Grade status.
# Description on the Data Quality Assessment screen for a Needs ID observation;
# followed by a list of conditions
Data-quality-assessment-description-needs-id = This observation has not yet met the conditions for Research Grade status:
# Data Quality Assessment explanation when quality is Research Grade
Data-quality-assessment-description-research = It can now be used for research and featured on other websites.
# Data Quality Assessment metric
Data-quality-assessment-evidence-of-organism = Evidence of organism
# Data Quality Assessment metric
Data-quality-assessment-has-photos-or-sounds = Has Photos or Sounds
# Data Quality Assessment metric
Data-quality-assessment-id-supported-by-two-or-more = Has ID supported by two or more
# Data Quality Assessment metric
Data-quality-assessment-location-is-accurate = Location is accurate
# Data Quality Assessment metric
Data-quality-assessment-location-specified = Location specified
# Data Quality Assessment metric
Data-quality-assessment-organism-is-wild = Organism is wild
# Data Quality Assessment metric
Data-quality-assessment-recent-evidence-of-organism = Recent evidence of an organism
# Data Quality Assessment metric
Data-quality-assessment-single-subject = Evidence related to a single subject
# Data Quality Assessment description of the final quality grade when Casual
Data-quality-assessment-title-casual = This observation is Casual Grade
# Data Quality Assessment description of the final quality grade when Needs ID
Data-quality-assessment-title-needs-id = This observation Needs ID
# Data Quality Assessment description of the final quality grade when Research Grade
Data-quality-assessment-title-research = This observation is Research Grade!
# Section header on the observation detail screen's Details tab for observed and
# uploaded dates, all caps style
DATE = DATE
# label in project requirements
Date = Date
# Label for observations sort order, default option
Date-Added-Newest-Default = Date Added: Newest (Default)
# Label for observations sort order
Date-Added-Oldest = Date Added: Oldest
# Date formatting using date-fns
# Used for things like User Profile join date
# See complete list of formatting styles: https://date-fns.org/v3.6.0/docs/format
date-format-long = PP
# Used when displaying a relative time - in this case, shows only month+year (same year) - e.g. Jul 3
# See complete list of formatting styles: https://date-fns.org/v3.6.0/docs/format
date-format-month-day = MMM d
# Use when only showing an observations month and year
# See complete list of formatting styles: https://date-fns.org/v3.6.0/docs/format
date-format-month-year = MMM yyyy
# Short date, e.g. on notifications from over a year ago
# See complete list of formatting styles: https://date-fns.org/v3.6.0/docs/format
date-format-short = M/d/yy
# Section header in the Explore filters screen for filtering by the date
# observed, all caps style
DATE-OBSERVED = DATE OBSERVED
# Accessibility label for the date-observed filter in Explore filters, and sort
# option label in the Explore sort sheet
Date-observed = Date observed
# Label before the date an observation was made, in the observation detail
# screen's Details tab
Date-observed-header-short = Observed
# Label for observations or species sort order
Date-Observed-Newest = Date Observed: Newest
# Explore sort option shown on the sort dropdown button: by date observed,
# newest first
DATE-OBSERVED-NEWEST = DATE OBSERVED - NEWEST TO OLDEST
# Label for observations or species sort order
Date-Observed-Oldest = Date Observed: Oldest
# Explore sort option shown on the sort dropdown button: by date observed,
# oldest first
DATE-OBSERVED-OLDEST = DATE OBSERVED - OLDEST TO NEWEST
# Label for controls over a range of dates
Date-Range = Date Range
# Label for controls over a range of dates
DATE-RANGE = DATE RANGE
# Express a date range. d1 and d2 can be any expression of dates
date-to-date = { $d1 } - { $d2 }
# Section header in the Explore filters screen for filtering by the date
# uploaded, all caps style
DATE-UPLOADED = DATE UPLOADED
# Accessibility label for the date-uploaded filter in Explore filters, and sort
# option label in the Explore sort sheet
Date-uploaded = Date uploaded
# Label before the date an observation was uploaded, in the observation detail
# screen's Details tab
Date-uploaded-header-short = Uploaded
# Explore sort option shown on the sort dropdown button: by date uploaded,
# newest first
DATE-UPLOADED-NEWEST = DATE UPLOADED - NEWEST TO OLDEST
# Explore sort option shown on the sort dropdown button: by date uploaded,
# oldest first
DATE-UPLOADED-OLDEST = DATE UPLOADED - OLDEST TO NEWEST
# Label before the date an observation was uploaded, in the Details section of
# the observation detail screen
Date-uploaded-on-header-short = Uploaded on:
# Used when displaying a relative time - in this case, X days ago (e.g. 3d = 3 days ago)
datetime-difference-days = { $count }d
# Used when displaying a relative time - in this case, X hours ago (e.g. 3h = 3 hours ago)
datetime-difference-hours = { $count }h
# Used when displaying a relative time - in this case, X minutes ago (e.g. 3m = 3 minutes ago)
datetime-difference-minutes = { $count }m
# Used when displaying a relative time - in this case, X weeks ago (e.g. 3w = 3 weeks ago)
datetime-difference-weeks = { $count }w
# Longer datetime, e.g. when editing an observation
# See complete list of formatting styles: https://date-fns.org/v3.6.0/docs/format
datetime-format-long = Pp
# Longer datetime with time zone, e.g. when editing an observation and we know
# the time zone See complete list of formatting styles at
# https://date-fns.org/v3.6.0/docs/format and time zone formatting
# characters at
# https://github.com/marnusw/date-fns-tz?tab=readme-ov-file#formatintimezone
datetime-format-long-with-zone = Pp (zzz)
# Medium-length datetime with time zone, e.g. the sample observation in
# onboarding. See complete list of formatting styles at
# https://date-fns.org/v3.6.0/docs/format and time zone formatting
# characters at
# https://github.com/marnusw/date-fns-tz?tab=readme-ov-file#formatintimezone
datetime-format-medium-with-zone = PP · p zzz
# Shorter datetime, e.g. on observation detail view
# See complete list of formatting styles: https://date-fns.org/v3.6.0/docs/format
datetime-format-short = M/d/yy h:mm a
# Shorter datetime with time zone, e.g. on observation detail view
# See complete list of formatting styles at
# https://date-fns.org/v3.6.0/docs/format and time zone formatting
# characters at
# https://github.com/marnusw/date-fns-tz?tab=readme-ov-file#formatintimezone
datetime-format-short-with-zone = M/d/yy h:mm a zzz
# Month of December
December = December
# Confirm button in sheets for deleting an observation or a comment (verb)
DELETE = DELETE
# Menu item in the observation editor's menu, when editing several observations,
# that discards all of them
Delete-all-observations = Delete all observations
# Menu item in a comment's menu on the observation detail screen that deletes
# the comment
Delete-comment = Delete comment
# Title of the sheet asking the user to confirm deleting a comment
DELETE-COMMENT--question = DELETE COMMENT?
# Button that deletes the current observation in a batch of several observations
Delete-current-observation = Delete current observation
# Button that deletes an observation
Delete-observation = Delete observation
# Title of the sheet asking the user to confirm deleting an observation
DELETE-OBSERVATION--question = DELETE OBSERVATION?
# Button label or accessibility label for an element that deletes a photo
Delete-photo = Delete photo
# Accessibility label for the control that deletes a saved search
Delete-saved-search = Delete saved search
# Accessibility label for the button that deletes a sound in the media viewer
Delete-sound = Delete sound
# Shows the progress of deletions for X of Y observations, but omits the
# word "observations" so the message won't get cut off on small screens
# Deleting-x-of-y = Deleting { $currentDeleteCount } of { $total }
Deleting-x-of-y--observations =
    Deleting { $currentDeleteCount } { $total ->
        [one] of { $total }
       *[other] of { $total } observations
    }
# Shows the number of observations a user is currently deleting out of total on my observations page
Deleting-x-of-y-observations-2 =
    Deleting { $currentDeleteCount } { $total ->
        [one] observation
       *[other] of { $total } observations
    }
# Label for section of ObsDetails with information about copyright, upload date, etc.
Details = Details
# Tab label or section title for content that describes further details, e.g.
# the details of an observation
DETAILS = DETAILS
# Title of the alert shown in the camera when the device is almost out of
# storage
Device-storage-full = Device storage full
# Message of the alert shown in the camera when the device is almost out of
# storage
Device-storage-full-description = iNaturalist may not be able to save your photos or may crash.
# Button that disables the camera's flash
Disable-flash = Disable flash
# Button that disables the camera to use location for suggestions
Disable-location = Disable location
# Disagreement notice with an identificaiton, <0/> will get replaced by a
# taxon name
Disagreement = *@{ $username } disagrees this is <0/>
# Button that discards changes or an item, e.g. a photo
DISCARD = DISCARD
# Button that discards all items, e.g. imported photos
DISCARD-ALL = DISCARD ALL
# Button that discards changes
DISCARD-CHANGES = DISCARD CHANGES
# Title of the sheet shown when leaving Explore filters with unapplied changes
DISCARD-FILTER-CHANGES = DISCARD FILTER CHANGES
# Title of the sheet in the media viewer asking the user to confirm removing a
# photo or sound
DISCARD-MEDIA--question = DISCARD MEDIA?
# Title and confirm button of the sheet shown when leaving the observation
# editor with an unsaved observation
DISCARD-OBSERVATION = DISCARD OBSERVATION
# Title of the sheet shown when leaving the camera with photos that have not
# been saved
DISCARD-PHOTOS--question = DISCARD PHOTOS?
# Label for a button that discards a sound recording
DISCARD-RECORDING = DISCARD RECORDING
# Header of a popup confirming that the user wants to discard a sound
# recording
DISCARD-SOUND--question = DISCARD SOUND?
# Title of the sheet shown when leaving the observation editor with unsaved
# observations; $count is the number of observations
DISCARD-X-OBSERVATIONS =
    { $count ->
        [one] DISCARD OBSERVATION
       *[other] DISCARD { $count } OBSERVATIONS
    }
# Onboarding header (underneath the logo)
DISCOVER-NATURE-AROUND-YOU = DISCOVER NATURE AROUND YOU
# Label for a button that dismisses announcements
Dismiss-announcement = Dismiss announcement
# Heading on the match screen above a row of broad taxon group buttons the user
# can pick from
Do-you-know-what-group-this-is-in = Do you know what group this is in?
# Curator hidden-coordinate access when joining a traditional project
Do-you-want-private-coordinates-visible-to-curators = Do you want to make your private/obscured observation coordinates visible to the project curators?
# All-caps title of the Donate screen and label of the Donate item in the main
# menu
DONATE = DONATE
# All-caps section header and button label on the Donate screen; button opens
# the donation page
DONATE-TO-INATURALIST = DONATE TO INATURALIST
# Label for a button the user taps when a task is complete
DONE = DONE
# Body of the camera tip "Stay safe" for reptiles
Dont-handle-or-corner-the-animal-A-photo-from-a-safe-distance-is-still-useful-even-if-its-not = Don't handle or corner the animal. A photo from a safe distance is still useful, even if it's not perfect.
# Link below the login form that opens sign-up. <0> wraps the question in
# regular text, <1> wraps "Sign up" in bold
Dont-have-an-account = <0>Don't have an account? </0><1>Sign up</1>
# Body of the camera tip "Leave it where you found it" for crustaceans
Dont-pry-crabs-off-rocks-If-you-lift-a-rock-to-look-underneath-put-it-back-gently = Don't pry crabs off rocks. If you lift a rock to look underneath, put it back gently.
# Alert message shown at app start when the computer vision model files are
# missing, so the AI camera is unavailable
During-app-start-no-model-found = During app start there was no computer vision model found. There will be no AI camera.
# Heading of a section of camera tips about echinoderms
Echinoderms = Echinoderms
# Button for editing something
Edit = Edit
# All-caps button label in the identification sheets on observation details;
# opens the form to edit the comment attached to an identification
EDIT-COMMENT = EDIT COMMENT
# Menu item in the options menu of a comment in the observation activity list;
# opens the edit comment sheet
Edit-comment = Edit comment
# Label for button that edits an identification
Edit-identification = Edit identification
# All-caps button in Explore filters that opens the location picker; also the
# header of the location picker screen
EDIT-LOCATION = EDIT LOCATION
# Label for interactive element that takes you to a location choosing screen
Edit-location = Edit location
# Traditional project membership: edit curator access to hidden observation coordinates (not device GPS)
EDIT-LOCATION-PERMISSIONS = EDIT LOCATION PERMISSIONS
# Settings radio option to open the observation editor after taking photos; also
# accessibility label for an upload icon on an observation that needs editing
Edit-Observation = Edit Observation
# Description under the iNaturalist account settings header in Settings
Edit-your-profile-change-your-settings = Edit your profile, change your notifications settings, and manage all other parts of your account.
# Accessibility hint for button that edits an observation's taxon
Edits-this-observations-taxon = Edits this observation's taxon
# All-caps section header on the Help screen for information aimed at educators
EDUCATORS = EDUCATORS
# All-caps label above the email input field on the sign-up and forgot-password
# forms (noun)
EMAIL = EMAIL
# All-caps button on the developer/debug screen that emails recent app logs
# (verb: send by email)
EMAIL-DEBUG-LOGS = EMAIL DEBUG LOGS
# Common name of the frog Espadarana prosoblepon, shown in the sample
# observation on the onboarding observation story screen
Emerald-Glass-Frog = Emerald Glass Frog
# Button that enables the camera's flash
Enable-flash = Enable flash
# Button that enables the camera to use location for suggestions
Enable-location = Enable location
# Button that subscribes the user to notifications for an observation
Enable-notifications = Enable notifications
# Indicates a species only occurs in a specific place
Endemic = Endemic
# TODO this and many other uses of placeables are not currently translatable
# without knowing the vowel/consonant state of the first letter of the
# placeable
Endemic-to-place = Endemic to { $place }
# Placeholder for a numeric project field when adding an observation to projects
Enter-a-number = Enter a number
# Placeholder for a text project field when adding an observation to projects
Enter-a-response = Enter a response
# Title for a section describing an error
Error = Error
# All-caps heading shown on the user profile screen when the profile cannot be
# found
ERROR = ERROR
# All-caps header of a sheet shown when the Data Quality Assessment (DQA) for an
# observation fails to load
ERROR-LOADING-DQA = ERROR LOADING IN DQA
# Title of dialog or section describing an error
Error-title = Error
# All-caps header of a sheet shown when a vote in the Data Quality Assessment
# (DQA) fails
ERROR-VOTING-IN-DQA = ERROR VOTING IN DQA
# Message in the sheet shown when a Data Quality Assessment (DQA) vote fails
Error-voting-in-DQA-description = Your vote may not have been cast in the DQA. Check your internet connection and try again.
# Label in project requirements for a requirement related to Establishment
# Means, e.g. if a project only allowed observations of invasive species
Establishment = Establishment
# Header for a section describing how a taxon arrived in a given place
ESTABLISHMENT-MEANS = ESTABLISHMENT MEANS
# Onboarding observation story screen: encouragement shown above the Continue button
Even-a-photo-of-something-commonly-seen-in-your-area-can-help-science = Even a photo of something commonly seen in your area can help science!
# Body text of the Missing Evidence sheet in the observation editor, explaining
# required location, date, and time
Every-observation-needs = Every observation needs a location, date, and time to be helpful to identifiers. You can edit geoprivacy if you’re concerned about location privacy.
# Onboarding observation story screen: headline. The word "observation" is
# underlined for emphasis
Every-observation-tells-a-story = <0>Every </0><1>observation</1><0> tells a story.</0>
# Explanation of collection projects, shown in the About Collection Projects
# section of project details
Every-time-a-collection-project = Every time a collection project's page is loaded, iNaturalist will perform a quick search and display all observations that match the project's requirements. It is an easy way to display a set of observations, such as for a class project, a park, or a bioblitz without making participants take the extra step of manually adding their observations to a project.
# All-caps section header in the observation editor for photos, sounds,
# location, and date
EVIDENCE = EVIDENCE
# Option label in Explore filters for filtering observations by a single
# observed or uploaded date
Exact-Date = Exact Date
# All-caps button label in Explore filters showing the selected date filter mode
# (a single date)
EXACT-DATE = EXACT DATE
# Connector word in a project's requirements list, shown before the excluded
# items (e.g. taxa or places)
except = except
# Button confirming the user wants to leave onboarding sign-up
EXIT = EXIT
# Header of the sheet shown when closing an onboarding sign-up step
Exit-signup--question = Exit signup?
# All-caps button below a map preview on observation details and taxon details;
# opens a full-screen map
EXPAND-MAP = EXPAND MAP
# Onboarding carousel second screen description
Experts-help-verify-and-improve-IDs = Experts help verify and improve IDs
# Accessibility label for the Explore tab in the bottom tab bar
Explore = Explore
# Title of a camera tip about arachnids
Eyes-and-face = Eyes and face
# Title of a camera tip about mammals
Face-ears-and-markings = Face, ears, and markings
# Alert title shown in the observation editor when deleting a sound from the
# server fails
Failed-to-delete-sound = Failed to delete sound
# Error message with log in fails
Failed-to-log-in = Failed to log in
# Header for featured projects
FEATURED = FEATURED
# Month of February
February = February
# All-caps main menu item and header of the sheet where users type and submit
# app feedback
FEEDBACK = FEEDBACK
# Alert title shown after the user submits feedback from the main menu
Feedback-Submitted = Feedback Submitted
# Placeholder shown in the observation editor's location field while the device
# location is being fetched
Fetching-location = Fetching location...
# Accessibility label for the buttons in Explore filters that open the user or
# project picker (verb)
Filter = Filter
# All-caps button in Explore filters that opens a project picker to filter
# observations by project
FILTER-BY-A-PROJECT = FILTER BY A PROJECT
# All-caps button in Explore filters that opens a user picker to filter
# observations by user
FILTER-BY-A-USER = FILTER BY A USER
# Description of the Date Range option for the date observed filter in Explore
Filter-by-observed-between-dates = Filter by observations observed between two specific dates
# Description of the Months option for the date observed filter in Explore
Filter-by-observed-during-months = Filter by observations observed during specific months
# Description of the Exact Date option for the date observed filter in Explore
Filter-by-observed-on-date = Filter by observations observed on a specific date
# Description of the Date Range option for the date uploaded filter in Explore
Filter-by-uploaded-between-dates = Filter by observations uploaded between two specific dates
# Description of the Exact Date option for the date uploaded filter in Explore
Filter-by-uploaded-on-date = Filter by observations uploaded on a specific date
# Accessibility label for the button in the Explore header that opens the
# filters screen (noun, plural)
Filters = Filters
# Accessibility hint for the "Worldwide" default option in the location search
Filters-observations-to-anywhere-in-the-world = Filters observations to anywhere in the world.
# Accessibility hint for the "Nearby" default option in the location search
Filters-observations-to-your-current-location = Filters observations to your current location.
# Display name for the iconic taxa category for actinopterygii
Fish = Fish
# Heading of a section of camera tips about fishes
Fishes = Fishes
# Status when an item has been flagged
Flagged = Flagged
# Accessibility label for the camera flash toggle button
Flash = Flash
# Label for a button that toggles between the front and back cameras
Flip-camera = Flip camera
# Title of a camera tip about plants
Flowers-fruit-or-seeds = Flowers, fruit, or seeds
# All-caps button on a user profile to follow that user (verb)
FOLLOW = FOLLOW
# Subtitle for a screen showing the list of people a user is following
FOLLOWING-X-PEOPLE =
    { $count ->
        [one] FOLLOWING { $count } PERSON
       *[other] FOLLOWING { $count } PEOPLE
    }
# Body of the camera tip "Host plant" for insects
For-caterpillars-and-other-plant-feeders-include-a-photo-of-the-plant-theyre-on = For caterpillars and other plant-feeders, include a photo of the plant they're on.
# Explanatory text at the bottom of the Add to Projects screen about collection
# and umbrella projects
For-most-other-projects-observations-will-automatically-be-included = For most other projects, observations that meet project requirements will automatically be included in projects.
# Body of the camera tip "No shell? Show the body!" for mollusks
For-slugs-photograph-the-right-side-where-the-breathing-hole-is = For slugs, photograph the right side, where the breathing hole is.
# Body of the camera tip "Eyes and face" for arachnids
For-spiders-try-a-head-on-shot-The-way-the-eyes-are-arranged-can-help-identify-the-family = For spiders, try a head-on shot. The way the eyes are arranged can help identify the family.
# Forgot password link
Forgot-Password = Forgot Password
# Display name for the iconic taxa category for fungi
Fungi = Fungi
# All-caps header of the sheet in the observation editor for choosing the
# observation's geoprivacy (location privacy) setting
GEOPRIVACY = GEOPRIVACY
# Shows the observation's location privacy setting. { $status } is replaced with
# Open, Obscured, or Private
Geoprivacy-status = Geoprivacy: { $status }
# Onboarding message describing one of the reasons to use iNat
Get-an-instant-ID-of-any-plant-animal-fungus = Get an instant ID of any plant, animal, or fungus
# Body of the camera tip "Spines and texture" for echinoderms
Get-close-ups-of-the-surface-Small-details-can-separate-similar-sea-stars-and-urchins = Get close-ups of the surface. Small details can separate similar sea stars and urchins.
# Bullet point in the onboarding card shown after creating an account, listing a
# benefit of uploading
Get-feedback-from-naturalists-and-experts-who-will-help-verify = Get feedback from naturalists and experts who will help verify and refine your identifications.
# Body of the camera tip "Face, ears, and markings" for mammals
Get-images-of-any-markings-or-patterns-and-the-ear-shape-if-you-can-Keep-your-distance = Get images of any markings or patterns, and the ear shape if you can. Keep your distance!
# Body of the camera tip "Head from top and side" for amphibians
Get-the-eyes-snout-and-any-markings-in-the-shot = Get the eyes, snout, and any markings in the shot.
# Body of the camera tip "Head close-up" for fishes
Get-the-mouth-eyes-and-any-markings-on-the-head = Get the mouth, eyes, and any markings on the head.
# Preceded by the fragment, "By uploading your observation to iNaturalist, you can:"
Get-your-identification-verified-by-real-people = Get your identification verified by real people in the iNaturalist community
# Label for button that returns to the previous screen
Go-back = Go back
# Alert title on Android when the user tries to sign in with Google but Google
# Play Services is missing
Google-Play-Services-Not-Installed = Google Play Services Not Installed
# Text for a button that asks the user to grant permission
GRANT-PERMISSION = GRANT PERMISSION
# Title of a screen asking for permission
Grant-Permission-title = Grant Permission
# Title of the screen for grouping imported photos into observations
Group-Photos = Group Photos
# Onboarding for users learning to group photos in the camera roll
Group-photos-onboarding = Group photos into observations– make sure there is only one species per observation
# Title of a camera tip about birds
Head-beak-and-body = Head, beak, and body
# Title of a camera tip about fishes
Head-close-up = Head close-up
# Title of a camera tip about amphibians
Head-from-top-and-side--amphibians = Head from top and side
# Title of a camera tip about reptiles
Head-from-top-and-side--reptiles = Head from top and side
# All-caps title of the Help screen and label of the Help item in the main menu
HELP = HELP
# Bullet point in the onboarding card shown after creating an account, listing a
# benefit of uploading
Help-create-Research-Grade-data-used-in-science-and-conservation = Help create Research Grade data used in science and conservation.
# Onboarding message describing one of the reasons to use iNat
Help-protect-species = Help protect species
# Link in the app language setting that opens the Crowdin translation project
Help-us-translate-the-app = Help us translate the app!
# Onboarding location permission screen: a reason to allow location access
Help-you-find-species-nearby = Help you find species nearby
# Onboarding location permission screen: a reason to allow location access
Helps-with-science-and-community = Helps with science and community
# Button on the login screen that hides the typed password (verb, opposite of
# Reveal)
Hide = Hide
# Label in Explore filters for the dropdown selecting the highest taxonomic rank
# to include
Highest = Highest
# All-caps header of the sheet in Explore filters for choosing the highest
# taxonomic rank
HIGHEST-RANK = HIGHEST RANK
# Title of a camera tip about insects
Host-plant = Host plant
# Checkbox label on the sign-up screen. <0> wraps regular text, <1> wraps the
# word "required" in italics
I-agree-to-the-Terms-of-Use = <0>I agree to the Terms of Use and Privacy Policy, and I have reviewed the Community Guidelines (</0><1>required</1><0>).</0>
# Accessibility label for a broad taxon group button (e.g. plants, birds). {
# $iconicTaxon } is replaced with the group's name
Iconic-taxon-name = Iconic taxon name: { $iconicTaxon }
# Option in the add observation sheet that opens the AI camera to identify
# organisms live
ID-in-Camera = ID in Camera
# Settings radio option to show identification suggestions after taking or
# importing photos
ID-Suggestions = ID Suggestions
# Identification Status
ID-Withdrawn = ID Withdrawn
# All-caps section header in the observation editor for the observation's
# identification (taxon)
IDENTIFICATION = IDENTIFICATION
# Header for a project rule requiring an observation to be identified
Identification--project-rule = Identification
# Accessibility label for a button that shows options for an identification
Identification-options = Identification options
# All-caps label under a count on user profile and project details stats; the
# number is shown separately. Plural form depends on { $count }
IDENTIFICATIONS-WITHOUT-NUMBER =
    { $count ->
        [one] IDENTIFICATION
       *[other] IDENTIFICATIONS
    }
# Tab label in Explore that shows a list of identifiers (people who identify
# observations)
Identifiers = Identifiers
# Body of the camera tip "If you can, the feet!" for amphibians
Identifiers-sometimes-count-toes-so-try-to-show-the-feet-If-that-would-disturb-the-animal-skip-it = Identifiers sometimes count toes, so try to show the feet. If that would disturb the animal, skip it!
# Short for: Identify with AI. Label for a button that will load identifications for a given photo/sound
IDENTIFY = IDENTIFY
# Title of screen asking for permission to access the camera
Identify-organisms-in-real-time-with-your-camera = Identify organisms in real time with your camera
# Onboarding slides
Identify-species-anywhere = Identify species anywhere
# Message in the Check Your Email sheet shown after requesting a password reset
If-an-account-with-that-email-exists = If an account with that email exists, we've sent password reset instructions to your email.
# Description of an option in the sheet for leaving a project; fragment
# explaining when to choose revoking hidden coordinate access
If-the-only-reason-youre-leaving-is-to-stop-project-curators = If the only reason you're leaving is to stop project curators from viewing your hidden coordinates.
# Body of the camera tip "Flowers, fruit, or seeds" for plants
If-the-plant-has-any-get-a-close-up-Identifiers-often-need-these-to-name-the-species = If the plant has any, get a close-up. Identifiers often need these to name the species.
# Title of a camera tip about amphibians
If-you-can-the-feet = If you can, the feet!
# Body of an error alert when signing in with a third party fails (e.g. Apple, Google)
If-you-have-an-existing-account-try-sign-in-reset = If you have an existing iNat account, try signing in with your username and password, or try resetting your password using the email address associated with your account.
# Text on the match screen when no confident ID was found, encouraging the user
# to upload for community help
If-you-save-this-observation-and-upload-it-to-iNaturalist = If you save this observation and upload it to iNaturalist, other people may be able to help identify it.
# Explanation of umbrella projects, shown in the About Umbrella Projects section
# of project details
If-you-want-to-collate-compare-promote = If you want to collate, compare, or promote a set of existing projects, then an Umbrella project is what you should use. For example the 2018 City Nature Challenge, which collated over 60 projects, made for a great landing page where anyone could compare and contrast each city's observations. Both Collection and Traditional projects can be used in an Umbrella project, and up to 500 projects can be collated by an Umbrella project.
# Banner text on My Observations suggesting experienced users switch to Advanced
# Mode
If-youre-an-experienced-user-try-switching-to-Advanced-Mode = You have uploaded more than 100 observations. Try Advanced Mode for more ways to add and manage observations.
# Body text of the full-screen error shown when the app crashes, under
# "Something went wrong"
If-youre-seeing-this-error = If you're seeing this and you're online, iNat staff have already been notified. Thanks for finding a bug! If you're offline, please take a screenshot and send us an email when you're back on the Internet.
# All-caps button on the ID suggestions screen to get suggestions without using
# the observation's location
IGNORE-LOCATION = IGNORE LOCATION
# Button to stop recieving notifications about observation
Ignore-notifications = Ignore notifications
# Toast in the AI camera indicating location is not being used for suggestions
Ignoring-location = Ignoring location
# Title of the Android chooser dialog for picking which app to import photos
# from
Import-Photos-From = Import Photos From
# Shows the number of observations a user is about to import
IMPORT-X-OBSERVATIONS =
    IMPORT { $count ->
        [one] 1 OBSERVATION
       *[other] { $count } OBSERVATIONS
    }
# Title of screen asking for permission to access location
Improve-suggestions-by-using-your-location = Improve suggestions by using your location
# All-caps button on the ID suggestions screen that asks for location permission
# to improve suggestions
IMPROVE-THESE-SUGGESTIONS-BY-USING-YOUR-LOCATION = IMPROVE THESE SUGGESTIONS BY USING YOUR LOCATION
# Identification category
improving--identification = Improving
# All-caps section header in Settings for logged-in users' account settings
INATURALIST-ACCOUNT-SETTINGS = INATURALIST ACCOUNT SETTINGS
# Settings radio option making the AI camera the only add-observation option
iNaturalist-AI-Camera = iNaturalist AI Camera
# Title of the screen showing the iNaturalist blog
iNaturalist-Blog = iNaturalist Blog
# Body text of the location permission prompt explaining why iNaturalist asks
# for location
iNaturalist-can-use-your-location-to-give-you-better-identification-suggestions = iNaturalist can use your location to give you better identification suggestions. We also use it to help you find species seen nearby. Sharing your location makes it easier to create useful data for science.
# All-caps section header on the About iNaturalist screen
INATURALIST-COMMUNITY = INATURALIST COMMUNITY
# All-caps section header and button label on the Help screen; button opens the
# iNaturalist forum website
INATURALIST-FORUM = INATURALIST FORUM
# Message on the ID suggestions screen when no suggestions are available for the
# photo
iNaturalist-has-no-ID-suggestions-for-this-photo = iNaturalist has no ID suggestions for this photo.
# All-caps section header on the Help screen about the iNaturalist help website
INATURALIST-HELP-PAGE = INATURALIST HELP PAGE
# Onboarding location permission screen: headline
iNaturalist-helps-you-discover-your-local-nature = iNaturalist helps you discover your local nature, wherever in the world you are!
# Introductory paragraph on the About iNaturalist screen
iNaturalist-helps-you-identify = iNaturalist helps you identify the plants and animals around you while generating data for science and conservation. Get connected with a community of millions scientists and naturalists who can help you learn more about nature!
# Attribution text on the ID suggestions screen. { $user1 }, { $user2 }, {
# $user3 } are replaced with usernames of community members
iNaturalist-identification-suggestions-are-based-on = iNaturalist's identification suggestions are based on observations and identifications made by the iNaturalist community, including { $user1 }, { $user2 }, { $user3 }, and many others.
# Text on the Donate screen about iNaturalist's US nonprofit status; 501(c)(3)
# is a US tax category, keep as is
iNaturalist-is-a-501 = iNaturalist is a 501(c)(3) non-profit in the United States of America (Tax ID/EIN 92-1296468).
# Loading message on the ID suggestions screen
iNaturalist-is-loading-ID-suggestions = iNaturalist is loading ID suggestions...
# Paragraph on the About iNaturalist screen describing the nonprofit and its
# platforms
iNaturalist-is-supported-by = iNaturalist is supported by an independent, 501(c)(3) nonprofit organization based in the United States of America. The iNaturalist platform includes this app, Seek by iNaturalist, the iNaturalist website, and more.
# Paragraph under the iNaturalist Community header on the About iNaturalist
# screen
iNaturalist-is-supported-by-our-community = iNaturalist is supported by our amazing community. From everyday naturalists who add observations and identifications, to curators who manage our taxonomy and help with moderation, to the volunteer translators who make iNaturalist more accessible to worldwide audiences, to our community-based donors, we are extraordinarily grateful to all the people in our community who make iNaturalist the platform it is.
# Mission statement on the About iNaturalist screen
iNaturalist-mission-is-to-connect = iNaturalist's mission is to connect people to nature and advance biodiversity science and conservation.
# All-caps section header on the About iNaturalist screen
INATURALIST-MISSION-VISION = INATURALIST'S MISSION & VISION
# All-caps section header on the About iNaturalist screen about the iNaturalist
# Network partner sites
INATURALIST-NETWORK = INATURALIST NETWORK
# Accessibility label for the Account Settings button in Settings that opens
# iNaturalist web settings
INATURALIST-SETTINGS = INATURALIST SETTINGS
# Label for the role a user plays on iNaturalist, e.g. "INATURALIST STAFF"
# or "INATURALIST CURATOR". Since the name "INATURALIST" should not be
# translated or locally it is inserted as a variable here, but it will always
# be "INATURALIST"
INATURALIST-STAFF = { $inaturalist } STAFF
# All-caps section header on the Donate screen about the iNaturalist merchandise
# store
INATURALIST-STORE = INATURALIST STORE
# All-caps section header on the About iNaturalist screen above the list of team
# members
INATURALIST-TEAM = INATURALIST TEAM
# Paragraph under the iNaturalist Team header on the About iNaturalist screen;
# people's names should not be translated
iNaturalists-apps-are-designed-and-developed-3 = iNaturalist's apps are designed, developed, and supported by the iNaturalist team: Yaron Budowski, Amanda Bullington, Tony Iwane, Johannes Klein, Patrick Leary, Joanne Lin, Scott Loarie, Abhas Misraraj, Sylvain Morin, Carrie Seltzer, Alex Shepard, Thea Skaff, Angie Ta, Ken-ichi Ueda, Kirk van Gorkom, Jason Walthall, & Jane Weeden.
# Vision statement on the About iNaturalist screen
iNaturalists-vision-is-a-world = iNaturalist's vision is a world where everyone can understand and sustain biodiversity through the practice of observing wild organisms and sharing information about them.
# Body of the camera tip "Whole body from the side" for fishes
Include-every-fin-and-the-tail-spread-if-you-can-For-flat-fish-like-rays-shoot-from-above-instead = Include every fin and the tail, spread if you can. For flat fish like rays, shoot from above instead.
# Body of the camera tip "Web, burrow, or surroundings" for arachnids
Include-photos-of-the-web-burrow-or-where-you-found-it = Include photos of the web, burrow, or where you found it.
# Display name for the iconic taxa category for insecta
Insects = Insects
# Title for dialog telling the user that an Internet connection is required
Internet-Connection-Required = Internet Connection Required
# A localized number, e.g. activity counts or character counts in text input
# sheets. { $val } is replaced with the number; usually leave as is
Intl-number = { $val }
# Establishment means option (species not native to an area) in Explore filters
# and project requirements
Introduced = Introduced
# Establishment means on taxon details. { $place } is replaced with a place
# name, e.g. a country or state
Introduced-to-place = Introduced to { $place }
# Description of the Research Grade quality grade on observation details
It-can-now-be-shared-for-use-in-research = It can now be shared for use in research
# Onboarding Research Grade screen: checklist item completing "Your
# observation can become Research Grade when:". Text in <1> tags is bold
it-has-a-photo-or-sound-date-and-location = <0>it has a </0><1>photo or sound</1><0>, </0><1>date</1><0>, and </0><1>location</1>
# Alert message shown after the user deletes their account
It-may-take-up-to-an-hour-to-remove-content = It may take up to an hour to completely delete all associated content
# Label for suggested list of organisms from computer vision in the Match screen new user flow
It-might-also-be = It might also be
# Label for suggested list of organisms from computer vision in the Match screen new user flow when there is no top suggestion
It-might-be-one-of-these = It might be one of these
# Onboarding Research Grade screen: checklist item completing "Your
# observation can become Research Grade when:". Text in <1> tags is bold
it-passes-iNaturalists-standards-for-good-data = <0>it passes iNaturalist's standards for </0><1>good data</1>
# Month of January
January = January
# All-caps button on project details to join a project (verb); also the confirm
# button of the join project sheet
JOIN = JOIN
# Subheader under logo on sign up screen
Join-a-global-community-for-nature = Join a global community for nature
# All-caps section header on project details shown when the user is not a member
# of the project
JOIN-PROJECT = JOIN PROJECT
# Asking for confirmation if the user wants to join this project
JOIN-PROJECT--question = JOIN PROJECT?
# Header for joined projects
JOINED = JOINED
# Shows date user joined iNaturalist on user profile
Joined-date = Joined: { $date }
# Subtitle for a screen showing projects a user has joined
JOINED-X-PROJECTS =
    { $count ->
        [one] JOINED { $count } PROJECT
       *[other] JOINED { $count } PROJECTS
    }
# All-caps title of the screen showing a single journal post (noun)
JOURNAL-POST = JOURNAL POST
# All-caps label under a count in project details and user profile stats; the
# number is shown separately. Plural form depends on { $count }
JOURNAL-POSTS-WITHOUT-NUMBER =
    { $count ->
        [one] JOURNAL POST
       *[other] JOURNAL POSTS
    }
# Month of July
July = July
# Month of June
June = June
# Text in the Upload to iNaturalist sheet on taxon details, reminding users to
# only upload wild organisms
Just-make-sure-the-organism-is-wild = Just make sure the organism is wild (not a pet, zoo animal, or garden plant)
# Onboarding location permission screen: introduces a list of reassurances about how location is used
Just-so-you-know = Just so you know:
# All-caps secondary button in the Missing Info sheet on the Add to Projects
# screen; closes the sheet so the user can keep editing
KEEP-EDITING = KEEP EDITING
# Description under the option to remove all your observations from a project in
# the sheet shown when leaving a project
Keep-in-mind-that-project-curators = Keep in mind that project curators will still be able to add your observations to their project unless you change your account settings.
# Title of a camera tip about birds
Keep-it-sharp = Keep it sharp
# Title of a camera tip about echinoderms
Keep-it-underwater = Keep it underwater
# Display name for the iconic taxa category chromista
Kelp-and-Diatoms = Kelp & Diatoms
# Shows date user last active on iNaturalist on user profile
Last-Active-date = Last Active: { $date }
# Latitude, longitude on a single line
Lat-Lon = { NUMBER($latitude, maximumFractionDigits: 6) }, { NUMBER($longitude, maximumFractionDigits: 6) }
# Latitude, longitude, and accuracy on a single line
Lat-Lon-Acc = Lat: { NUMBER($latitude, maximumFractionDigits: 6) }, Lon: { NUMBER($longitude, maximumFractionDigits: 6) }, Acc: { $accuracy }
# Identification category
leading--identification = Leading
# Common name of the beetle family Chrysomelidae, shown in the sample activity
# feed on the onboarding community identification screen
Leaf-Beetles = Leaf Beetles
# Second line of text on an onboarding card shown after you have made five
# observations
Learn-from-people-who-verify-and-refine-your-identifications = Learn from people who verify and refine your identifications.
# Link on the sign-up screen, below the terms-of-use checkbox, that opens a page
# with more information
Learn-More = Learn More
# Button on the match screen and saved observation that opens details for the
# identified taxon when it is above species level (genus, family, etc.)
LEARN-MORE-ABOUT-THIS-GROUP = LEARN MORE ABOUT THIS GROUP
# Button on the match screen and saved observation that opens details for the
# identified species
LEARN-MORE-ABOUT-THIS-SPECIES = LEARN MORE ABOUT THIS SPECIES
# Label for species sort order
Least-Observed = Least Observed
# Confirm button (verb) in sheets for leaving a project, or leaving the
# add-to-projects screen with unfinished required info
LEAVE = LEAVE
# Title of a camera tip about crustaceans
Leave-it-where-you-found-it = Leave it where you found it
# Button on a project's details screen, for members, that starts leaving the
# project
LEAVE-PROJECT = LEAVE PROJECT
# Asking for confirmation if the user wants to leave this project
LEAVE-PROJECT--question = LEAVE PROJECT?
# Section heading on the Donate screen above a button to review iNaturalist in
# the app store
LEAVE-US-A-REVIEW = LEAVE US A REVIEW!
# Traditional project leave: keep observations in project
Leave-your-observations-in-this-project = Leave your observations in this project
# Traditional project leave: keep observations but revoke hidden coordinate access
Leave-your-observations-revoke-hidden-coordinates = Leave your observations in this project but prevent curators from viewing their hidden coordinates
# Title of a camera tip about plants
Leaves = Leaves
# Heading text on the forgot password screen
Lets-reset-your-password = Let’s reset your password.
# Button on the About screen that opens the list of open source software
# licenses, also used as that list's title
Licenses = Licenses
# Text shown on the AI camera while the identification model is loading
Loading-iNaturalists-AI-Camera = Loading iNaturalist's AI Camera
# Accessibility hint for the offline notice that can be tapped to reload content
# once online
Loads-content-that-requires-an-Internet-connection = Loads content that requires an Internet connection
# Section heading for location on the observation details screen and in Explore
# filters
LOCATION = LOCATION
# Accessibility label for location buttons/fields (e.g. camera location toggle,
# observation location), and the Location requirement on project requirements
Location = Location
# Warning on the location picker shown when the selected location's accuracy is
# too large
Location-accuracy-is-too-imprecise = Location accuracy is too imprecise to help identifiers. Please zoom in.
# Header for traditonal projects join flow: curator access to hidden observation coordinates (not device GPS)
LOCATION-PERMISSIONS = LOCATION PERMISSIONS
# Onboarding location permission screen: introduces a list of reasons to allow location access
Location-permissions--onboarding = Location permissions:
# Header for a project rule requiring the observer to let project curators see
# the true locations of their observations
Location-permissions--project-rule = Location permissions
# Title of the sheet in the observation editor explaining that the location
# uncertainty is too large
LOCATION-TOO-IMPRECISE = LOCATION TOO IMPRECISE
# Button label that logs the user in or goes to the login screen (login form,
# main menu, onboarding)
LOG-IN = LOG IN
# Button in the Please log in sheet on My Observations that opens the login
# screen
LOG-IN-TO-INATURALIST = LOG IN TO INATURALIST
# Text in the main menu header shown when not logged in; tapping it opens the
# login screen
Log-in-to-iNaturalist = Log in to iNaturalist
# Main menu item and confirm button that logs the user out
LOG-OUT = LOG OUT
# Title of the confirmation sheet shown when logging out
LOG-OUT--question = LOG OUT?
# Body of the camera tip "Colors and markings" for birds
Look-for-wing-bars-eye-rings-and-patterns-on-the-breast-Similar-species-often-differ-in-just-these = Look for wing bars, eye rings, and patterns on the breast. Similar species often differ in just these spots.
# When the user searches their own observations for something they haven't observed
Looks-like-you-havent-observed-this-yet-time-to-keep-exploring =
    Looks like you haven't observed this yet.
    Time to keep exploring!
# Label for the lowest taxonomic rank dropdown in the Explore filters' taxonomic
# ranks section
Lowest = Lowest
# Title of the picker sheet for choosing the lowest taxonomic rank in Explore
# filters
LOWEST-RANK = LOWEST RANK
# Display name for the iconic taxa category for mammalia
Mammals = Mammals
# Project detail section heading when the current user is a member
MANAGE-MEMBERSHIP = MANAGE MEMBERSHIP
# Section heading for the map on project details and taxon details screens
MAP = MAP
# Name for a custom map area used as location in Explore, and default title of
# the full-screen map
Map-Area = Map Area
# Month of March
March = March
# Radio button option for navigation flows in Settings
Match-Screen = Match Screen
# Identification category
maverick--identification = Maverick
# Month of May
May = May
# Section heading in Explore filters for filtering by media type (photos,
# sounds, none)
MEDIA = MEDIA
# Header for a project rule requiring an observation to have photos or sounds
Media--project-rule = Media
# label in project requirements
Media-Type = Media Type
# Label under the members count on a project's overview stats; the number is
# shown separately. Plural depends on $count
MEMBERS-WITHOUT-NUMBER =
    { $count ->
        [one] MEMBER
       *[other] MEMBERS
    }
# Alert shown when tapping Join on a project that only accepts members by
# invitation
Membership-in-this-project-is-by-invitation-only = Membership in this project is by invitation only. If you'd like to join, please contact one of the curators and request an invitation.
# Accessibility label for a button that opens a menu of options
Menu = Menu
# Shown in place of a date when an observation has no date
Missing-Date = Missing Date
# Title of the sheet in the observation editor explaining that an observation
# needs evidence
MISSING-EVIDENCE = MISSING EVIDENCE
# Title of the warning sheet on the add-to-projects screen when some projects
# still need required info
MISSING-INFO = MISSING INFO
# Display name for the iconic taxa category for mollusca
Mollusks = Mollusks
# Badge text on a user profile indicating the user is a monthly donor (currently
# not shown in the app)
Monthly-Donor = Monthly Donor
# Explore date filter option for observations observed during selected months
Months = Months
# All-caps version of the Months date filter option in Explore, used as a
# header/label style
MONTHS = MONTHS
# Label for section of ObsDetails with information about observation projects, DQA, etc.
More = More
# Accessibility label for a button on a taxon result that opens taxon details
More-info = More info
# All-caps version of the Most faved sort option in Explore, used as a
# header/label style
MOST-FAVED = MOST FAVED
# Sort option for observations: those with the most faves (favorites) appear
# first
Most-faved = Most faved
# Label for species sort order, this option is selected by default
Most-Observed-Default = Most Observed (Default)
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
must-be-captive-cultivated = must be captive / cultivated
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment; means observation must have coordinates
must-be-georeferenced = must be georeferenced
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
must-be-identified = must be identified
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment; $name is replaced with a taxon name
must-be-in-taxon = must be in taxon { $name }
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment; $placeName is replaced with a place name
must-be-observed-in-place = must be observed in { $placeName }
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment; observation's taxon must be on the project's list
must-be-on-list = must be on list
# Header for a project rule requiring an observation's taxon to be on the
# project's list of taxa
Must-be-on-Project-List--project-rule = Must be on Project List
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
must-be-verifiable = must be verifiable
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
must-be-wild = must be wild
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
must-have-a-photo = must have a photo
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
must-have-a-sound = must have a sound
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment; media means photos or sounds
must-have-media = must have media
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment; $name is replaced with the observation field's
# name
must-have-observation-field-x-filled-out = must have observation field "{ $name }" filled out
# Title for section in Notifications showing notifications about observations
# created by the viewer. Should be 16 characters or fewer or it will be ellipsized.
MY-CONTENT--notifications = MY CONTENT
# Header on the My Observations screen when the user is not logged in
My-Observations = My Observations
# Label for the bottom tab that shows your observations. Feel free to be
# flexible in translating this to keep it as short as possible. "My
# Observations" would be our preference in English, but it won't really fit,
# so we went with "Me". You have about ~7-20 characters before it gets cut
# off on the smallest screen sizes.
My-Observations--bottom-tab = Me
# Establishment means option (species native to an area) in Explore filters and
# project requirements
Native = Native
# Text on the taxon details screen; $place is replaced with the name of a place
# where the taxon is native
Native-to-place = Native to { $place }
# Accessibility hint for the AI camera button in the add observation sheet
Navigates-to-AI-camera = Navigates to AI camera
# Accessibility hint for the button that imports photos in the add evidence
# sheet of the observation editor
Navigates-to-bulk-importer = Navigates to bulk importer
# Accessibility hint for camera buttons in the add observation and add evidence
# sheets
Navigates-to-camera = Navigates to camera
# Accessibility hint for the Explore tab button and the explore button on taxon
# details
Navigates-to-explore = Navigates to explore
# Accessibility hint for a journal post in a list of journal posts
Navigates-to-journal-post = Navigates to journal post
# Accessibility hint for the main menu header when not logged in
Navigates-to-log-in-screen = Navigates to log in screen
# Accessibility hint for the main menu bottom tab
Navigates-to-main-menu = Navigates to main menu.
# Accessibility hint for the Notifications tab button in the bottom tab bar
Navigates-to-notifications = Navigates to notifications
# Accessibility hint for an observation in a list that opens its details screen
Navigates-to-observation-details = Navigates to observation details screen
# Accessibility hint for elements that open the observation editor (unsynced
# observation, no-evidence button, etc.)
Navigates-to-observation-edit-screen = Navigate to observation edit screen
# Accessibility hint for the photo library buttons in the camera and the add
# observation sheet
Navigates-to-photo-importer = Navigates to photo importer
# Accessibility hint for close buttons (e.g. in the camera) that go back to the
# previous screen
Navigates-to-previous-screen = Navigates to previous screen
# Accessibility label for a project in a list or search result that opens its
# details
Navigates-to-project-details = Navigates to project details
# Accessibility hint for sound recording buttons in the add observation and add
# evidence sheets
Navigates-to-sound-recorder = Navigates to sound recorder
# Accessibility hint for a button in the agree-with-ID sheet that opens the
# identification suggestion flow
Navigates-to-suggest-identification = Navigates to suggest identification
# Accessibility hint for buttons that open the taxon details screen
Navigates-to-taxon-details = Navigates to taxon details
# Accessibility hint for user names/avatars and list items that open a user's
# profile
Navigates-to-user-profile = Navigates to user profile
# Label for button that takes you to your observations
Navigates-to-your-observations = Navigates to your observations
# Header or button label for content that is near the user's current location
NEARBY = NEARBY
# Header or button label for content that is near the user's current location
Nearby = Nearby
# Quality grade indicating observation still needs more identifications
Needs-ID--quality-grade = Needs ID
# Heading when creating a new observation
New-Observation = New Observation
# Sort order, refers to newest or oldest date
Newest-to-oldest = Newest to oldest
# Accessibility label for the arrow button in the observation editor that goes
# to the next of several observations
Next-observation = Next observation
# Accessibility label for a button that goes to the next slide on onboarding cards
Next-slide = Next slide
# Onboarding community identification screen: a sample comment someone left on
# the user's observation, complimenting the photo
Nice-shot = Nice shot!
# As a categorical answer to the question presented on joining traditional projects: Do you want private coordinates be shared?
No = No
# Error message when no camera can be found
No-Camera-Available = No Camera Available
# Alert dialog title when attempting to send email but no email is installed
No-email-app-installed = No email app installed
# Alert message shown on iOS when no email app is installed; $address is
# replaced with the email address
No-email-app-installed-body = If you have another way of sending email, the address is { $address }
# Shown in place of a location when an observation has no location
No-Location = No Location
# Explore media filter option for observations without photos or sounds
No-Media = No Media
# As in a machine learning model that powers automated suggestions
No-model-found = No model found
# Empty-state text on the Projects screen when a search returns no projects
No-projects-match-that-search = No projects match that search
# Used for explore screen when search params lead to a search with no data
No-results-found-for-that-search = No results found for that search.
# Empty-state text on observation lists and Explore when a search returns no
# results
No-results-found-try-different-search = No results found. Try a different search or adjust your filters.
# license code
no-rights-reserved-cc0 = no rights reserved (CC0)
# Title of a camera tip about mollusks
No-shell-Show-the-body = No shell? Show the body!
# Displayed in place of positional accuracy when that value is missing
none--accuracy = none
# Option when selecting taxonomic ranks that indicates no rank was selected
NONE--ranks = NONE
# Button in explore filters to search for species or observations NOT by the signed in user
NOT-BY-ME = NOT BY ME
# Error message title when not enough storage space on device, e.g. when the
# disk is full and you try to save a photo
Not-enough-space-left-on-device = Not enough space left on device
# Error message description when not enough storage space on device, e.g. when
# the disk is full and you try to save a photo
Not-enough-space-left-on-device-try-again = There is not enough storage space left on your device to do that. Please free up some space and try again.
# Header for observation description on observation detail
NOTES = NOTES
# Label for section in ObsDetails with notes/description of observation
Notes = Notes
# Header title of the Notifications screen
NOTIFICATIONS = NOTIFICATIONS
# Label for the bottom tab that shows notifications. Feel free to be flexible
# in translating this to keep it as short as possible. "Notifications" would
# be our preference in English, but it won't really fit, so we went
# with "Activity". You have about ~7-20 characters before it gets cut off on
# the smallest screen sizes.
Notifications--bottom-tab = Activity
# notification when someone adds a comment to your observation
notifications-user-added-comment-to-observation-by-you = <0>{ $userName }</0> added a comment to an observation by you
# notification when someone adds an identification to your observation
notifications-user-added-identification-to-observation-by-you = <0>{ $userName }</0> added an identification to an observation by you
# notification when someone adds a comment to an observation by someone else
notifications-user1-added-comment-to-observation-by-user2 = <0>{ $user1 }</0> added a comment to an observation by { $user2 }
# notification when someone adds an identification to an observation by
# someone else
notifications-user1-added-identification-to-observation-by-user2 = <0>{ $user1 }</0> added an identification to an observation by { $user2 }
# Month of November
November = November
# Explanation of traditional projects in the About traditional projects section
# of project details
Obervations-must-be-manually-added = Observations must be manually added to a traditional project, either during the upload stage or after the observation has been shared to iNaturalist. A user must also join a traditional project in order to add their observations to it.
# Geoprivacy option (noun/adjective): the observation's exact location is hidden
# and shown only approximately
Obscured = Obscured
# Header title of the list of projects an observation belongs to (singular noun)
Observation = Observation
# Copyright/license line on the observation details screen; $userName is the
# observer's name, $restrictions is the license description
Observation-Attribution = Observation: © { $userName } · { $restrictions }
# Copyright/license line on the observation details screen; $userName is the
# observer's name, $restrictions is the license description
Observation-Copyright = Observation Copyright: © { $userName } · { $restrictions }
# Accessibility label for the placeholder shown on observation details when the
# observation has no media
Observation-has-no-photos-and-no-sounds = This observation has no photos and no sounds.
# Displayed when user views an obscured location on the ObsDetail map screen
Observation-location-obscured-randomized-point = This observation’s location is obscured. You are seeing a randomized point within the obscuration polygon.
# Displayed when user views an obscured location of their own observation
Observation-location-obscured-you-can-see-your-own = This observation’s location is obscured. You can always see the location of your own observations.
# Displayed when user views an obscured location of someone else's observation
# when they have permission to view the coordinates
Observation-location-obscured-you-have-permission = This observation’s location is obscured. You have permission to see this location.
# Subtitle on Add to Projects membership rule row (on_list?)
Observation-must-exactly-match = Observation must exactly match one of the taxa on the project's list. Please check the project page on the iNaturalist website for details.
# Label for a menu that shows various actions you can take for an observation
Observation-options = Observation options
# Title of the sheet shown on observation details when the observation has been
# deleted
OBSERVATION-WAS-DELETED = OBSERVATION WAS DELETED
# Accessibility label for the add observation sheet button that creates an
# observation with no photo or sound
Observation-with-no-evidence = Observation with no evidence
# Tab label (plural noun) on Explore and My Observations showing the observation
# count
Observations = Observations
# Description for observations sort order
Observations-added-least-recently-appear-first = Observations added least recently appear first
# Description for observations sort order
Observations-added-recently-appear-first = Observations added recently appear first
# Notice on My Observations, next to a pencil icon, about observations missing
# location or date
Observations-need-location-date--warning = iNaturalist observations need a location and date to be useful to scientists. Please check observations with this icon before uploading.
# Description for observations sort order
Observations-with-the-most-faves-appear-first = Observations with the most faves appear first
# Description for observations sort order
Observations-with-the-most-recent-date-appear-first = Observations with the most recent date appear first
# Description for observations sort order
Observations-with-the-oldest-date-appear-first = Observations with the oldest date appear first
# Might be used when the number is represented using an image or other
# element, not text
OBSERVATIONS-WITHOUT-NUMBER =
    { $count ->
        [one] OBSERVATION
       *[other] OBSERVATIONS
    }
# Text for a button prompting the user to grant access to the camera
OBSERVE-ORGANISMS = OBSERVE ORGANISMS
# This label is used in ObsDetails to describe the observation time
OBSERVED-AT--label = OBSERVED AT
# This label is used in ObsDetails to describe the observation location
OBSERVED-IN--label = OBSERVED IN
# Bulleted item in the list of observation requirements on a project's details
# screen; lowercase fragment
observer-must-allow-project-curators-to-view-coordinates = observer must allow project curators to view coordinates
# Tab label on the Explore screen (advanced mode) listing people who made
# observations
Observers = Observers
# Month of October
October = October
# Onboarding observation story screen: checklist item completing "An
# observation is:". Text in tags is bold
of-one-living-thing = <0>of </0><1>one living thing</1>
# Message in the error sheet shown when the Data Quality Assessment (DQA) can't
# load while offline
Offline-DQA-description = The DQA may not be accurate. Check your internet connection and try again.
# Explanation on the identification suggestions screen when offline suggestions
# are shown
Offline-suggestions-may-differ-from-online = Offline suggestions may differ from online suggestions, and taxon images and common names may not load.
# Generic confirmation, e.g. button on a warning alert
OK = OK
# Sort order, refers to newest or oldest date
Oldest-to-newest = Oldest to newest
# Explanation on observation details for an observation with needs ID quality grade
Once-enough-people-agree-on-the-identification = Once enough people agree on the identification, this observation can become research grade.
# Empty-state message on the Notifications screen for users who are not logged
# in
Once-you-create-and-upload-observations = Once you create & upload observations, other members of our community can add identifications to help your observations reach research grade.
# Message in the warning sheet on the add-to-projects screen when leaving with
# unfinished required info
One-or-more-projects-still-need-required-info = One or more projects still need required info. Leave and only the completed ones will be saved.
# Adjective, as in geoprivacy
Open = Open
# Button in the check-your-email sheet after requesting a password reset that
# opens the email app
OPEN-EMAIL = OPEN EMAIL
# Default accessibility hint for the three-dots (kebab) menu button
Open-menu = Open menu.
# Text for a button that opens the operating system Settings app
OPEN-SETTINGS = OPEN SETTINGS
# Accessibility hint for a button that opens a form for adding a comment
Opens-add-comment-form = Opens add comment form.
# Accessibility hint for button that opens the AI camera
Opens-AI-camera = Opens AI camera.
# Accessibility hint for a button that opens a form for editing a comment
Opens-edit-comment-form = Opens edit comment form.
# Accessibility hint for buttons that ask for location permission (Projects,
# Explore, suggestions)
Opens-location-permission-prompt = Opens location permission prompt
# Accessibility hint for search button in Explore header that navigates to the search interface
Opens-search-interface = Opens search interface.
# Accessibility hint for the camera tips button
Opens-tips-for-taking-good-photos = Opens tips for taking good photos.
# Connector placed between any number of alternative project rule sentences, e.g. "must be observed in Germany or must be observed in France"
or--project-rule = or
# Heading on the login screen above buttons for signing in with Apple or Google
OR-SIGN-IN-WITH = OR SIGN IN WITH
# Tip on the match screen when no confident identification could be made
Or-you-can-try-to-get-a-clearer-photo-by-zooming-in-getting-closer = Or, you can try to get a clearer photo by zooming in, getting closer, or trying a different angle.
# Picker prompt on observation edit
Organism-is-captive = Organism is captive
# Display name for the iconic taxa category for other: anything that doesn't fit into another category
Other = Other
# Display name for the iconic taxa category for animalia: anything that is an animal, but doesn't fit into a tighter category
Other-Animals = Other Animals
# Section heading for other data (geoprivacy, captive, etc.) on observation
# details and in the observation editor
OTHER-DATA = OTHER DATA
# Section heading on the identification suggestions screen for suggestions other
# than the top one
OTHER-SUGGESTIONS = OTHER SUGGESTIONS
# Tab on notifications showing notifications about content created by others.
# Should be 16 characters or fewer or it will be ellipsized.
OTHERS--notifications = OTHERS
# Onboarding community identification screen: explains the sample activity feed below it
Our-global-community-works-together-to-help-identify-the-species-youre-looking-at = Our global community works together to help identify the species you're looking at.
# Label and accessibility label for the password field on the login and sign-up
# screens
PASSWORD = PASSWORD
# Title showing user profile details about who a user follows and is following
PEOPLE--title = PEOPLE
# Header for a project rule requiring an observation to have a photo
Photo--project-rule = Photo
# Accessibility label for the photo library buttons in the camera and the add
# observation sheet
Photo-importer = Photo importer
# Section heading and sheet title in Explore filters for filtering by photo
# license
PHOTO-LICENSING = PHOTO LICENSING
# Body of the camera tip "Back of the animal" for amphibians
Photograph-it-from-above-to-show-its-pattern-and-skin-texture = Photograph it from above to show its pattern and skin texture.
# Body of the camera tip "Keep it underwater" for echinoderms
Photograph-it-in-place-Dont-lift-it-out-of-the-water-or-pry-it-off-rocks = Photograph it in place. Don't lift it out of the water or pry it off rocks.
# Body of the camera tip "Body parts and colors" for mollusks
Photograph-tentacles-gills-and-the-foot-Their-colors-matter-for-sea-slugs-squid-and-more = Photograph tentacles, gills, and the foot. Their colors matter for sea slugs, squid, and more.
# Body of the camera tip "Top view" for arachnids
Photograph-the-body-from-above-showing-the-abdomen-and-leg-markings = Photograph the body from above, showing the abdomen and leg markings.
# Body of the camera tip "Underside" for fungi
Photograph-the-gills-pores-or-teeth-under-the-cap-Most-mushrooms-cant-be-identified-without-this = Photograph the gills, pores, or teeth under the cap. Most mushrooms can't be identified without this view.
# Body of the camera tip "Leaves" for plants
Photograph-the-top-and-underside-of-a-leaf-and-where-the-leaves-attach-to-the-stem = Photograph the top and underside of a leaf, and where the leaves attach to the stem.
# Body of the camera tip "Shell from several angles" for mollusks
Photograph-the-top-the-side-and-the-opening-or-hinge-For-chitons-show-the-plates-and-the-band = Photograph the top, the side, and the opening or hinge. For chitons, show the plates and the band around them.
# Body of the camera tip "Back and full body" for reptiles
Photograph-the-whole-animal-from-above-so-its-colors-and-pattern-show = Photograph the whole animal from above so its colors and pattern show.
# Body of the camera tip "Top view" for crustaceans
Photograph-the-whole-body-from-above = Photograph the whole body from above.
# Media type option (plural noun) in Explore filters and project requirements
Photos = Photos
# Placeholder text in the camera's photo preview area before any photo is taken
Photos-you-take-will-appear-here = Photos you take will appear here
# Display name for the iconic taxa category for plantae
Plants = Plants
# Title of screen asking for permission to access the camera when access was denied
Please-allow-Camera-Access = Please allow Camera Access
# Title of screen asking for permission to access location when access was denied
Please-allow-Location-Access = Please allow Location Access
# Title of screen asking for permission to access the microphone when access was denied
Please-allow-Microphone-Access = Please allow Microphone Access
# Error on the sign-up screen when the chosen password is not allowed (e.g.
# password)
Please-choose-a-different-password = Please choose a different password.
# Title of a screen asking for permission when permission has been denied
Please-Grant-Permission = Please Grant Permission
# Title of the sheet on My Observations asking the user to log in to sync
# observations
PLEASE-LOG-IN = PLEASE LOG IN
# Alert title in the observation editor when a logged-out user tries to add an
# observation to projects
Please-log-in = Please log in
# Message on the login screen shown instead of the username field when the
# user's session must be refreshed
Please-log-in-again = Please log in again. We occasionally need to refresh your session to clear cached data and make sure the app is working its best.
# Error message on the sign-up screen when the entered password is too short
Please-make-sure-your-password-is-at-least-6-characters = Please make sure your password is at least 6 characters.
# Alert message shown when an action (e.g. opening account settings, logging in,
# adding media) requires an Internet connection
Please-try-again-when-you-are-connected-to-the-internet = Please try again when you are connected to the Internet.
# Alert message shown with "You are offline" when an action needs the Internet,
# e.g. in the menu or My Observations
Please-try-again-when-you-are-online = Please try again when you are online!
# Instruction text on the AI camera screen shown when the model is loaded but no
# suggestion is available yet
Point-the-camera-at-an-animal-plant-or-fungus = Point the camera at an animal, plant, or fungus
# Title of the sheet asking whether a new identification disagrees with the
# existing one; all caps as a header style
POTENTIAL-DISAGREEMENT = POTENTIAL DISAGREEMENT
# Question at the top of the potential disagreement sheet; <1></1> is replaced
# with the taxon name of the existing identification, <0> applies text styling
Potential-disagreement-description = <0>Is the evidence enough to confirm this is </0><1></1><0>?<0>
# Radio option on the potential disagreement sheet; <1></1> is replaced with the
# new, broader taxon name, <0> applies text styling
Potential-disagreement-disagree = <0>No, but this is a member of </0><1></1>
# Radio option on the potential disagreement sheet; <1></1> is replaced with the
# new, broader taxon name, <0> applies text styling
Potential-disagreement-unsure = <0>I don't know but I am sure this is </0><1></1>
# Tooltip on the add observation button explaining that a long press shows more
# ways to create an observation
Press-and-hold-to-view-more-options = Press and hold to view more options
# Accessibility label for the arrow button in the observation editor that goes
# to the previous observation when editing several at once
Previous-observation = Previous observation
# Accessibility label for a button that goes to the previous slide on onboarding cards
Previous-slide = Previous slide
# Link text on the About screen that opens the iNaturalist privacy policy
Privacy-Policy = Privacy Policy
# Button label on the login Learn More screen and title of the web view showing
# the privacy policy; all caps as a header/button style
PRIVACY-POLICY = PRIVACY POLICY
# Geoprivacy option meaning the observation's location is hidden from the
# public; adjective, shown in the observation editor and observation details
Private = Private
# As in an iNat project, a collection of observations or observation search filters
PROJECT = PROJECT
# Heading for administrators on the project detail page
PROJECT-ADMINS = PROJECT ADMINS
# Project requirements rule indicating only project members can add observations
Project-Members-Only = Project Members Only
# Header of the project requirements screen and of the requirements section on
# the project details screen; all caps as a header style
PROJECT-REQUIREMENTS = PROJECT REQUIREMENTS
# Heading for the rules section on the project detail page
PROJECT-RULES = PROJECT RULES
# Project date shown on project screens when there is only a start date; {
# $datetime } is replaced with the formatted start date and time
project-start-time-datetime = Start time: { $datetime }
# As in iNat project, collections of observations or observation search filters
PROJECTS = PROJECTS
# As in iNat projects, collections of observations or observation search filters
Projects = Projects
# Section header on the observation details screen; { $projectCount } is
# replaced with the number of projects the observation is in; all caps as a
# header style
PROJECTS-X = PROJECTS ({ $projectCount })
# Display name for the iconic taxa category for protozoa
Protozoans = Protozoans
# Accessibility label for pull-to-refresh on MyObservations list and grid view
Pull-to-refresh-and-sync-observations = Pull to refresh and sync observations
# Accessibility label for pull-to-refresh on Notifications list
Pull-to-refresh-notifications = Pull to refresh notifications
# Onboarding location permission screen: a reason to allow location access
Quality-data-and-good-identifications = Quality data and good identifications
# Section header for the quality grade filter on the Explore filters screen; all
# caps as a header style
QUALITY-GRADE = QUALITY GRADE
# label in project requirements
Quality-Grade = Quality Grade
# Screen reader label for the Casual quality grade label
Quality-Grade-Casual--label = Quality Grade: Casual
# Screen reader label for the Needs ID quality grade label
Quality-Grade-Needs-ID--label = Quality Grade: Needs ID
# Screen reader label for the Research quality grade label
Quality-Grade-Research--label = Quality Grade: Research
# Taxonomic rank "class", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-CLASS = CLASS
# Taxonomic rank "class", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Class = Class
# Taxonomic rank "complex", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-COMPLEX = COMPLEX
# Taxonomic rank "complex", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Complex = Complex
# Taxonomic rank "epifamily", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-EPIFAMILY = EPIFAMILY
# Taxonomic rank "epifamily", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Epifamily = Epifamily
# Taxonomic rank "family", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-FAMILY = FAMILY
# Taxonomic rank "family", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Family = Family
# Taxonomic rank "form", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-FORM = FORM
# Taxonomic rank "form", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Form = Form
# Taxonomic rank "genus", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-GENUS = GENUS
# Taxonomic rank "genus", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Genus = Genus
# Taxonomic rank "genushybrid", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-GENUSHYBRID = GENUSHYBRID
# Taxonomic rank "genushybrid", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Genushybrid = Genushybrid
# Taxonomic rank "hybrid", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-HYBRID = HYBRID
# Taxonomic rank "hybrid", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Hybrid = Hybrid
# Taxonomic rank "infraclass", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-INFRACLASS = INFRACLASS
# Taxonomic rank "infraclass", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Infraclass = Infraclass
# Taxonomic rank "infrahybrid", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-INFRAHYBRID = INFRAHYBRID
# Taxonomic rank "infrahybrid", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Infrahybrid = Infrahybrid
# Taxonomic rank "infraorder", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-INFRAORDER = INFRAORDER
# Taxonomic rank "infraorder", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Infraorder = Infraorder
# Taxonomic rank "kingdom", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-KINGDOM = KINGDOM
# Taxonomic rank "kingdom", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Kingdom = Kingdom
# Taxonomic rank "order", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-ORDER = ORDER
# Taxonomic rank "order", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Order = Order
# Taxonomic rank "parvorder", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-PARVORDER = PARVORDER
# Taxonomic rank "parvorder", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Parvorder = Parvorder
# Taxonomic rank "phylum", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-PHYLUM = PHYLUM
# Taxonomic rank "phylum", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Phylum = Phylum
# Taxonomic rank "section", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SECTION = SECTION
# Taxonomic rank "section", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Section = Section
# Taxonomic rank "species", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SPECIES = SPECIES
# Taxonomic rank "species", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Species = Species
# Taxonomic rank "state of matter", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Statefmatter = State of matter
# Taxonomic rank "state of matter" (top-level rank, e.g. Life), all caps, used
# as a header above the taxon name on taxon details
Ranks-STATEOFMATTER = STATE OF MATTER
# Taxonomic rank "subclass", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SUBCLASS = SUBCLASS
# Taxonomic rank "subclass", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subclass = Subclass
# Taxonomic rank "subfamily", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SUBFAMILY = SUBFAMILY
# Taxonomic rank "subfamily", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subfamily = Subfamily
# Taxonomic rank "subgenus", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SUBGENUS = SUBGENUS
# Taxonomic rank "subgenus", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subgenus = Subgenus
# Taxonomic rank "subkingdom", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subkingdom = Subkingdom
# Taxonomic rank "suborder", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SUBORDER = SUBORDER
# Taxonomic rank "suborder", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Suborder = Suborder
# Taxonomic rank "subphylum", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SUBPHYLUM = SUBPHYLUM
# Taxonomic rank "subphylum", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subphylum = Subphylum
# Taxonomic rank "subsection", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUBSECTION = SUBSECTION
# Taxonomic rank "subsection", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subsection = Subsection
# Taxonomic rank "subspecies", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUBSPECIES = SUBSPECIES
# Taxonomic rank "subspecies", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subspecies = Subspecies
# Taxonomic rank "subterclass", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUBTERCLASS = SUBTERCLASS
# Taxonomic rank "subterclass", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subterclass = Subterclass
# Taxonomic rank "subtribe", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-SUBTRIBE = SUBTRIBE
# Taxonomic rank "subtribe", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Subtribe = Subtribe
# Taxonomic rank "superclass", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUPERCLASS = SUPERCLASS
# Taxonomic rank "superclass", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Superclass = Superclass
# Taxonomic rank "superfamily", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUPERFAMILY = SUPERFAMILY
# Taxonomic rank "superfamily", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Superfamily = Superfamily
# Taxonomic rank "superorder", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUPERORDER = SUPERORDER
# Taxonomic rank "superorder", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Superorder = Superorder
# Taxonomic rank "supertribe", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-SUPERTRIBE = SUPERTRIBE
# Taxonomic rank "supertribe", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Supertribe = Supertribe
# Taxonomic rank "tribe", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-TRIBE = TRIBE
# Taxonomic rank "tribe", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Tribe = Tribe
# Taxonomic rank "variety", all caps, used as a header above the taxon name on
# taxon details and as a rank option in Explore filters
Ranks-VARIETY = VARIETY
# Taxonomic rank "variety", shown before a scientific name (e.g. in the taxonomy
# list on taxon details)
Ranks-Variety = Variety
# Taxonomic rank "zoosection", all caps, used as a header above the taxon name
# on taxon details and as a rank option in Explore filters
Ranks-ZOOSECTION = ZOOSECTION
# Taxonomic rank "zoosection", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Zoosection = Zoosection
# Taxonomic rank "zoosubsection", all caps, used as a header above the taxon
# name on taxon details and as a rank option in Explore filters
Ranks-ZOOSUBSECTION = ZOOSUBSECTION
# Taxonomic rank "zoosubsection", shown before a scientific name (e.g. in the
# taxonomy list on taxon details)
Ranks-Zoosubsection = Zoosubsection
# Link on the taxon details screen below the Wikipedia summary that opens the
# full Wikipedia article
Read-more-on-Wikipedia = Read more on Wikipedia
# Onboarding community identification screen: headline. The word "identify" is
# underlined for emphasis
Real-people-will-identify-your-observation = <0>Real people will </0><1>identify</1><0> your observation.</0>
# Heading above the list of recently used searches
Recent-searches = Recent searches
# Help text for the button that opens the sound recorder
Record-a-sound = Record a sound
# Title of screen asking for permission to access the microphone
Record-animal-sounds = Record animal sounds
# Heading for the sound recorder
RECORD-NEW-SOUND = RECORD NEW SOUND
# Text for a button prompting the user to grant access to the microphone
RECORD-SOUND = RECORD SOUND
# Imperative verb for recording a sound
Record-verb = Record
# Status while recording a sound
Recording-sound = Recording sound
# Help text on the sound recorder screen after recording is stopped
Recording-stopped-Tap-to-play-the-current-recording = Recording stopped. Tap to play the current recording.
# Button on the Explore map that repeats the search for the area currently
# visible on the map; all caps as a button style
REDO-SEARCH-IN-MAP-AREA = REDO SEARCH IN MAP AREA
# Label for a button that removes a vote of agreement
Remove-agreement = Remove agreement
# Traditional project leave: remove all observations from project, showing a count of how many obs will be removed
Remove-all-your-observations-from-this-project-X = Remove all your observations from this project ({ $count })
# Label for a button that removes a vote of disagreement
Remove-disagreement = Remove disagreement
# Accessibility label for the star button on observation details when the
# observation is already favorited
Remove-favorite = Remove favorite
# Label for button that removes an identification
Remove-identification = Remove identification
# Accessibility label for the trash button on the photo grouping screen that
# removes selected photos from import
Remove-Photos = Remove Photos
# Accessibility label for the button that removes the selected project filter on
# the Explore filters screen
Remove-project-filter = Remove project filter
# Accessibility label for the button that removes the selected taxon filter on
# the Explore filters screen
Remove-taxon-filter = Remove taxon filter
# Accessibility label for the star button when the current search is already saved
Remove-this-saved-search = Remove this saved search
# Accessibility label for the button that removes the selected user filter on
# the Explore filters screen
Remove-user-filter = Remove user filter
# Toast shown after the user un-saves a saved Explore search
Removed-from-Saved-Searches = Removed from Saved Searches
# Label for button that removes an observation's taxon
Removes-this-observations-taxon = Removes this observation's taxon
# Hint for a button that removes a vote of agreement
Removes-your-vote-of-agreement = Removes your vote of agreement
# Hint for a button that removes a vote of disagreement
Removes-your-vote-of-disagreement = Removes your vote of disagreement
# Display name for the iconic taxa category for reptilia
Reptiles = Reptiles
# Label next to a project rule or project observation field indicating it is
# mandatory, on the add to projects screen; adjective
Required = Required
# Quality grade indicating observation is accurate and complete enough to
# share outside of iNat
Research-Grade--quality-grade = Research Grade
# Quality grade label meaning the observation has community-agreed ID; shown on
# observation list items and in onboarding; all caps as a label style
RESEARCH-GRADE--quality-grade = RESEARCH GRADE
# Onboarding Research Grade screen: shown above the Continue button. Text in
# <1> tags is bold
Research-Grade-observations-can-more-easily-be-used-to = <0>Research Grade observations can more easily be used to </0><1>make new discoveries</1><0> and </0><1>protect nature.</1>
# Reset password button
RESET-PASSWORD = RESET PASSWORD
# Label for a button that resets a sound recording
RESET-RECORDING = RESET RECORDING
# Button shown when a search has no results (Projects, My Observations search)
# that clears the search; all caps as a button style
RESET-SEARCH = RESET SEARCH
# Header of a popup confirming that the user wants to reset a sound
# recording
RESET-SOUND-header = RESET SOUND?
# Label for a button that resets the state of an interface, e.g. a button that
# resets the sound recorder to its original state
Reset-verb = Reset
# Button on the error screen shown after the app crashes that restarts the app;
# all caps as a button style
RESTART-APP = RESTART APP
# Label for button that restores a withdrawn identification
Restore = Restore
# Button on the advanced search screen that switches to the simpler search screen
RETURN-TO-STANDARD-SEARCH = RETURN TO STANDARD SEARCH
# Toggle on the login screen that shows the typed password; verb, alternates
# with "Hide"
Reveal = Reveal
# Button on the Donate screen that opens the app store so the user can leave a
# review of the app
REVIEW-INATURALIST = REVIEW INATURALIST
# Title for section of observation filters for controls over whether you have
# reviewed the observations or not
REVIEWED = REVIEWED
# Filter option in Explore advanced search to show only observations the user
# has reviewed
Reviewed-observations-only = Reviewed observations only
# Label for the satellite map type
Satellite--map-type = Satellite
# Label for a button that persists something
SAVE = SAVE
# Button in the discard warning sheet in the observation editor that saves all
# unsaved observations instead of discarding them
SAVE-ALL = SAVE ALL
# Button that saves all observations in a batch of multiple observations
Save-all-observations = Save all observations
# Button at the bottom of the observation editor that saves edits to an existing
# observation
SAVE-CHANGES = SAVE CHANGES
# Button in the upload prompt sheet on the taxon details screen that saves the
# observation without uploading it now
SAVE-FOR-LATER = SAVE FOR LATER
# Button at the bottom of the location picker that confirms the chosen location
# for the observation
SAVE-LOCATION = SAVE LOCATION
# Accessibility label for the star button that saves the current search
Save-this-search = Save this search
# Accessibility label for the upload status icon when an observation is saved
# and waiting in the upload queue
Saved-Observation = Saved observation, in queue to upload
# Toast shown when the user tries to save a search but has already saved as many
# as we can keep. { $count } is the maximum number of saved searches we keep
Saved-search-not-added-maximum-of-X = Saved search not added, maximum of { $count }
# Heading above the list of searches the user has saved
Saved-searches = Saved searches
# Heading of the saved searches section on the advanced search screen
SAVED-SEARCHES = SAVED SEARCHES
# Option in Settings for how taxon names are displayed: show only the scientific
# name
Scientific-Name = Scientific Name
# Option in Settings for how taxon names are displayed: scientific name first,
# followed by the common name in parentheses
Scientific-Name-Common-Name = Scientific Name (Common Name)
# Title for a search interface
SEARCH = SEARCH
# Title for a search interface
Search = Search
# Label for the button that submits a search on the universal search screen
SEARCH--button = SEARCH
# Placeholder for the location field in universal search
Search-for-a-location = Search for a location
# Placeholder text in the search field on the Projects screen
Search-for-a-project = Search for a project
# Button in Explore advanced search that opens taxon search to filter results by
# a taxon
SEARCH-FOR-A-TAXON = SEARCH FOR A TAXON
# Accessibility label for the taxon search text field
Search-for-a-taxon = Search for a taxon
# Placeholder for the taxon/user/project field in universal search
Search-for-species-user-or-project = Search for species, user, or project
# Header of the Explore screen for searching for a location to filter by
SEARCH-LOCATION = SEARCH LOCATION
# Header of the Explore screen for searching for a project to filter by
SEARCH-PROJECTS = SEARCH PROJECTS
# Accessibility label for a saved search, combining what is being searched for with where,
# e.g. "Fungi, California"
Search-subject-comma-place = { $subject }, { $place }
# Accessibility label for a button on the ID suggestions screen that reloads
# suggestions using the observation's location
Search-suggestions-with-location = Search suggestions with location
# Accessibility label for a button on the ID suggestions screen that reloads
# suggestions ignoring the observation's location
Search-suggestions-without-location = Search suggestions without location
# Header of the Explore screen for searching for a taxon to filter by. Taxa =
# plural of taxon
SEARCH-TAXA = SEARCH TAXA
# Header of the Explore screen for searching for a user to filter by
SEARCH-USERS = SEARCH USERS
# Accessibility label for navigating to journal posts screen
See-journal-posts = See journal posts
# Accessibility label for Observations button on UserProfile screen
See-observations-by-this-user-in-Explore = See observations by this user in Explore
# Accessibility label for Explore button on TaxonDetails screen
See-observations-of-this-taxon-in-explore = See observations of this taxon in explore
# Accessibility label for navigating to project members screen
See-project-members = See project members
# Accessibility label for Species button on UserProfile screen
See-species-observed-by-this-user-in-Explore = See species observed by this user in Explore
# Accessibility label for the date/time field in the observation editor that
# opens a date and time picker
Select-a-date-and-time-for-observation = Select a date and time for observation
# Placeholder for a project observation field with a list of allowed values;
# also the picker sheet header if the field has no name
Select-a-response = Select a response
# Placeholder for a project observation field that takes a taxon; tapping it
# opens taxon search
Select-a-species = Select a species
# Accessibility label for the field in the observation editor that opens the
# wild vs. captive/cultivated status options
Select-captive-or-cultivated-status = Select captive or cultivated status
# Accessibility label for the field in the observation editor that opens the
# geoprivacy (location privacy) options
Select-geoprivacy-status = Select geoprivacy status
# Accessibility label for a photo thumbnail in the observation editor; tap to
# select it, long-press to drag and reorder
Select-or-drag-media = Select or drag media
# Accessibility label for a photo thumbnail on the ID suggestions screen that
# selects which photo to get suggestions for
Select-photo = Select photo
# Button on the taxon details screen that chooses this taxon as the
# identification for the observation
SELECT-THIS-TAXON = SELECT THIS TAXON
# Label for an element that let's you select a user
Select-user = Select user
# Accessibility hint for an iconic taxon button (e.g. Birds, Plants) in the
# observation editor. { $iconicTaxon } is the group name
Selects-iconic-taxon-X = Selects iconic taxon { $iconicTaxon }.
# Accessibility label for a button on the group photos screen (photo import)
# that splits a selected multi-photo observation into separate observations
Separate-Photos = Separate Photos
# Month of September
September = September
# Header of the Settings screen and label of the Settings item in the main menu
SETTINGS = SETTINGS
# Verb. Label for actions that open the system share sheet, e.g. sharing an
# observation link from observation details
Share = Share
# Button on the developer/debug screen that shares the app's debug log file
SHARE-DEBUG-LOGS = SHARE DEBUG LOGS
# Menu item in the location section of observation details that opens the
# observation's coordinates in another maps app
Share-location = Share Location
# Accessibility label for a floating button on the observation map that shares
# the location via another app
Share-map = Share map
# Preceded by the fragment # Preceded by the fragment, "By uploading your observation to iNaturalist, you can:"
Share-your-observation-where-it-can-help-scientists = Share your observation, where it can help scientists across the world better understand biodiversity.
# Title of a camera tip about mollusks
Shell-from-several-angles = Shell from several angles
# Button on the Donate screen that opens the iNaturalist merchandise store
# website
SHOP-INATURALIST-MERCH = SHOP INATURALIST MERCH
# Accessibility hint for the kebab (three-dot) menu button in the header of
# observation details
Show-observation-options = Show observation options.
# Body of the camera tip "Top and side views" for insects
Show-the-body-shape-and-wing-patterns-For-butterflies-try-to-get-the-underside-of-the-wings-too = Show the body shape and wing patterns. For butterflies, try to get the underside of the wings too.
# Body of the camera tip "Top of the cap" for fungi
Show-the-color-and-texture-of-the-cap-and-its-shape = Show the color and texture of the cap, and its shape.
# Body of the camera tip "Top view" for echinoderms
Show-the-full-shape-and-colors-For-sea-stars-include-every-arm = Show the full shape and colors. For sea stars, include every arm.
# Body of the camera tip "Stem and what it grows on" for fungi
Show-the-very-base-even-if-its-partly-buried-and-whether-its-growing-on-wood-soil-or-leaves = Show the very base, even if it's partly buried, and whether it's growing on wood, soil, or leaves.
# Body of the camera tip "Claws and legs" for crustaceans
Show-their-size-color-and-shape-Similar-crabs-often-differ-here = Show their size, color, and shape. Similar crabs often differ here.
# Message when offline search results are being displayed
Showing-offline-search-results--taxa = Showing offline search results. To search for more species, try again when connected to the Internet.
# Label for button that shows identification suggestions
Shows-identification-suggestions = Shows identification suggestions
# Accessibility hint for button that shows observation creation options
Shows-observation-creation-options = Shows observation creation options
# Accessibility label for a button that allows user to sign in with their Apple account
Sign-in-with-Apple = Sign in with Apple
# Title of an error alert when Sign in with Apple fails
Sign-in-with-Apple-Failed = Sign in with Apple Failed
# Accessibility label for button that allows user to sign in with their Google account
Sign-in-with-Google = Sign in with Google
# Title of the alert shown when signing in with a Google account fails
Sign-in-with-Google-Failed = Sign in with Google Failed
# Body of the camera tip "Whole body from the side" for mammals
Size-shape-and-tail-length-can-tell-identifiers-a-lot-especially-for-larger-mammals = Size, shape, and tail length can tell identifiers a lot, especially for larger mammals.
# Button on an onboarding pop-up card that dismisses it without opening Settings
Skip-for-now = Skip for now
# Generic error message
Something-went-wrong = Something went wrong.
# Message in a warning sheet when the user opens an observation that has since
# been deleted
Sorry-this-observation-was-deleted = Sorry, this observation was deleted
# Error message if the app tries to open a URL the operating system can't
# handle
Sorry-we-dont-know-how-to-open-that-URL = Sorry, we don't know how to open that URL: { $url }
# Section header and sheet header in Explore advanced search for choosing the
# sort order of results
SORT-BY = SORT BY
# Accessibility label for the sort order option buttons in Explore advanced
# search
Sort-by = Sort by
# Accessibility label for a button that allows users to sort observations
# Label for observations sort menu
SORT-OBSERVATIONS = SORT OBSERVATIONS
# Label for species sort menu
SORT-SPECIES = SORT SPECIES
# Header for a project rule requiring an observation to have a sound
Sound--project-rule = Sound
# Character separating current position and total duration when playing a
# sound, e.g. 00:12 / 03:00 uses "/" as the separator. This can be anything,
# but it should be very short.
sound-playback-separator = /
# Accessibility label for the option that opens the sound recorder, in the add
# observation and add evidence menus
Sound-recorder = Sound recorder
# Tip in the sound recorder help sheet, shown under the heading 'Keep it short'
sound-recorder-help-A-recording-of = A recording of 5-15 seconds is best to help identifiers.
# Tip in the sound recorder help sheet, shown under the heading 'Get closer'
sound-recorder-help-Get-as-close-as-you-can = Get as close as you safely can to record the organism.
# Short heading of a tip in the sound recorder help sheet
sound-recorder-help-Get-closer = Get closer
# Short heading of a tip in the sound recorder help sheet
sound-recorder-help-Keep-it-short = Keep it short
# Tip in the sound recorder help sheet, shown under the heading 'Stop moving'
sound-recorder-help-Make-sure = Make sure the sound of your own movement doesn’t cover up the sound of the organism.
# Short heading of a tip in the sound recorder help sheet
sound-recorder-help-One-organism = One organism
# Short heading of a tip in the sound recorder help sheet
sound-recorder-help-Stop-moving = Stop moving
# Tip in the sound recorder help sheet, shown under the heading 'One organism'
sound-recorder-help-Try-to-isolate = Try to isolate the sound of a single organism. If you can’t, make sure to leave a note of which organism you’re recording.
# Noun, plural. Media type option (audio recordings), e.g. as an Explore
# advanced search filter and in project requirements
Sounds = Sounds
# Note on the taxon details screen naming the list that establishment means data
# comes from. { $source } is the list title; <1> is a link to it
Source-List = <0>(Source List: </0><1>{ $source }</1><0>)</0>
# Noun, plural. Tab label for species counts, e.g. on the Explore screen and My
# Observations
Species = Species
# Description of the Date Observed: Oldest species sort order
Species-first-observed-least-recently-appear-first = Species first observed least recently appear first
# Description of the Date Observed: Newest species sort order
Species-first-observed-recently-appear-first = Species first observed recently appear first
# Option in Explore search to show only species the current user has not
# observed yet
Species-I-havent-observed = Species I haven't observed
# Description of the 'Least observed' sort option for species lists
Species-with-the-least-observations-appear-first = Species with the least observations appear first
# Description of the 'Most observed' sort option for species lists
Species-with-the-most-observations-appear-first = Species with the most observations appear first
# Label under the species count on user profiles and project details; the number
# is shown separately. Plural forms by { $count }
SPECIES-WITHOUT-NUMBER =
    { $count ->
        [one] SPECIES
       *[other] SPECIES
    }
# Header for a project rule requiring an observation to be identified as one
# of the taxa listed below it
Specific-identification--project-rule = Specific identification
# Header for a project rule requiring an observation to be in a place chosen
# by the project
Specific-location--project-rule = Specific location
# Title of a camera tip about echinoderms
Spines-and-texture = Spines and texture
# Body of the camera tip "Colors and patterns" for fishes
Spots-stripes-and-bars-are-often-what-tells-similar-species-apart = Spots, stripes, and bars are often what tells similar species apart.
# Common name of the beetle species Diabrotica undecimpunctata, shown in the
# sample activity feed on the onboarding community identification screen
Spotted-Cucumber-Beetle = Spotted Cucumber Beetle
# Label for the standard map type
Standard--map-type = Standard
# Error shown in the Explore date filter when the start date is after the end
# date
Start-must-be-before-end = The start date must be before the end date.
# Accessibility label for the upload icon on an observation that has not been
# uploaded yet
Start-upload = Start upload
# Accessibility hint for button that starts recording a sound
Starts-recording-sound = Starts recording sound
# Message shown in the observation editor's location field while the device
# location is still being fetched
Stay-on-this-screen = Stay on this screen while your location loads.
# Title of a camera tip about reptiles
Stay-safe = Stay safe
# Title of a camera tip about fungi
Stem-and-what-it-grows-on = Stem and what it grows on
# Body of the camera tip "Whole plant" for plants
Step-back-and-get-the-whole-plant-plus-a-bit-of-whats-around-it = Step back and get the whole plant, plus a bit of what's around it.
# Message shown on the notifications screen when loading takes longer than
# expected
Still-loading = Still loading...
# Text on the Help screen above the button that opens a support request form
Still-need-help = Still need help? You can file a support request here.
# Button or accessibility label for an interactive element that stops an upload
Stop-upload = Stop upload
# Imperative verb for stopping the recording of a sound
Stop-verb = Stop
# Accessibility hint for a button that stops the recording of a sound
Stops-recording-sound = Stops recording sound
# Button that submits a form, e.g. the feedback sheet in the main menu or the
# potential disagreement sheet
SUBMIT = SUBMIT
# Button on observation details that opens the form to suggest an
# identification; also the header of that sheet
SUGGEST-ID = SUGGEST ID
# Identification category
supporting--identification = Supporting
# Accessibility hint for a tab. { $tab } is the tab's name
Switches-to-tab = Switches to { $tab } tab.
# Accessibility label for the button on My Observations that syncs observations
# with the server
Sync-observations = Sync observations
# Status text in the upload banner on My Observations while observations are
# syncing
Syncing = Syncing...
# Help text for the button that opens the multi-capture camera
Take-photo = Take photo
# Option in the add observation menu that opens the camera
Take-photos = Take photos
# Link in a banner on My Observations that switches the app to Advanced Mode
Tap-here-to-switch-to-Advanced-Mode = Tap here to switch to Advanced Mode
# Shown in place of a group of observations that failed to load, prompting the user to
# request them again
Tap-to-try-loading-again = Tap to try loading again
# label in project requirements
Taxa = Taxa
# Section header in Explore advanced search for the taxon filter
TAXON = TAXON
# Settings screen
TAXON-NAMES-DISPLAY = TAXON NAMES DISPLAY
# Section header in Explore advanced search for filtering by taxonomic rank
TAXONOMIC-RANKS = TAXONOMIC RANKS
# Header for a block of text describing a taxon's taxonomy
TAXONOMY-header = TAXONOMY
# Tab label on the About screen that shows information about the iNaturalist
# team
TEAM = TEAM
# Link on the About screen that opens the iNaturalist Terms of Use
Terms-of-Use = Terms of Use
# Link button on the sign-up Learn More screen and title of the web view showing
# the iNaturalist Terms of Use
TERMS-OF-USE = TERMS OF USE
# Message of the alert shown after the user submits feedback from the main menu
Thank-you-for-sharing-your-feedback = Thank you for sharing your feedback to help us improve!
# Description text in the feedback sheet opened from the main menu
Thanks-for-using-any-suggestions = Thanks for using this app! Do you have any suggestions for the people who make it?
# Error on the sign-up form when the entered email is already used by an account
That-email-is-already-associated-with-an-account = That email is already associated with an account.
# Message on the user profile screen when the requested user cannot be found
That-user-profile-doesnt-exist = That user profile doesn't exist
# Error on the sign-up confirmation form when the chosen username is already
# taken
That-username-is-unavailable = That username is unavailable
# Title on the match screen, when there is no top suggestion but other suggestions with low confidence
The-AI-is-not-confident-It-may-be-one-of-the-IDs-below = The AI is not confident. It may be one of the IDs below.
# Text on Match screen when there are no suggestions found at all for a user photo
The-AI-is-not-confident-Upload-to-ask-the-community = The AI is not confident. Upload to ask the community.
# Explanation on observation details for an observation with Research Grade quality grade
The-community-agrees-on-an-identification = The community agrees on an identification, and this observation can now more easily be used to make new discoveries and protect nature.
# Onboarding Research Grade screen: checklist item completing "Your
# observation can become Research Grade when:". Text in <1> tags is bold
the-community-vets-the-identification = <0>the community </0><1>vets the identification</1>
# Description of the 'Obscured' option in the geoprivacy sheet of the
# observation editor
The-exact-location-will-be-hidden = The exact location will be hidden publicly, and instead generalized to a larger area. (Threatened and endangered species are automatically obscured).
# Description for modal that pops up when user first logs in and goes to notifications screen
The-iNaturalist-community-will-help-verify-and-refine-identifications = The iNaturalist community will help verify and refine identifications on your observations to create Research Grade data for science and conservation.
# Paragraph on the About screen explaining the iNaturalist Network of local
# partner sites
The-iNaturalist-Network = The iNaturalist network is a collection of localized websites that are fully connected to the global iNaturalist community. Network sites are supported by local institutions that promote local use and facilitate the use of data from iNaturalist to benefit local biodiversity.
# Describes what happens when geoprivacy is set to private
The-location-will-not-be-visible-to-others = The location will not be visible to others, which might make the observation impossible to identify.
# Paragraph on the About screen crediting collaborators on the species
# suggestion models
The-models-that-suggest-species = The models that suggest species based on visual similarity and location are thanks in part to collaborations with Sara Beery, Tom Brooks, Elijah Cole, Christian Lange, Oisin Mac Aodha, Pietro Perona, and Grant Van Horn.
# Body of the camera tip "Tracks and scat" for mammals
These-count-too-Put-something-near-them-for-scale-like-a-coin-or-your-shoe = These count, too! Put something near them for scale, like a coin or your shoe.
# Shown on observation details in place of a comment that was hidden by
# moderators
This-comment-was-hidden-for-violating-community-guidelines-or-terms = This comment was hidden for violating Community Guidelines or Terms of Use.
# Shown on observation details in place of an identification that was hidden by
# moderators
This-identification-was-hidden-for-violating-community-guidelines-or-terms = This identification was hidden for violating Community Guidelines or Terms of Use.
# Shown on observation details in place of a photo that was hidden by moderators
This-image-was-hidden-for-violating-community-guidelines-or-terms = This photo was hidden for violating Community Guidelines or Terms of Use.
#  Wild status sheet descriptions
This-is-a-wild-organism = This is a wild organism and wasn't placed in this location by humans.
# Text in the taxon names section of Settings, followed by the display format
# options
This-is-how-taxon-names-will-be-displayed = This is how all taxon names will be displayed to you across iNaturalist:
# Text shown only for new users on their own ID on their first few observations
This-is-your-identification-other-people-may-help-confirm-it = This is your identification. Other people may help confirm it!
# Body of the camera tip "Head from top and side" for reptiles
This-matters-most-for-snakes-since-the-scales-on-the-head-are-often-what-identifiers-use-to-name = This matters most for snakes, since the scales on the head are often what identifiers use to name the species.
# Message on the loading screen shown while the app finds a species match for
# the photo
This-may-take-a-few-seconds = This may take a few seconds.
# Empty-state message in the community/activity section of observation details
This-observation-has-no-comments-or-identifications-yet = This observation has no comments or identifications yet.
# Description of the Casual quality grade in the data quality section of
# observation details
This-observation-has-not-met-the-conditions-required-to-meet-Research-Grade = This observation has not met the conditions required to meet Research Grade status
# Title on observation details for an observation with casual quality grade
This-observation-is-casual = This observation is casual.
# Title on observation details for an observation with Research Grade quality grade
This-observation-is-Research-Grade = This observation is Research Grade
# Subtitles on Add to Projects membership rule rows
This-observation-must-be-in-a-specific-location = This observation must be in a specific location specified by the project. Please check the project page for details.
# Project requirement shown when adding an observation to a project
This-observation-must-be-marked-captive-cultivated = This observation must be marked captive/cultivated.
# Project requirement shown when adding an observation to a project
This-observation-must-be-marked-wild = This observation must be marked wild.
# Project requirement shown when adding an observation to a project (verifiable
# observations only)
This-observation-must-be-marked-wild-have-photo = This observation must be marked wild, have photo or sound evidence, have a date, and have a location.
# Project requirement shown when adding an observation to a project
This-observation-must-have-a-location = This observation must have a location.
# Project requirement shown when adding an observation to a project
This-observation-must-have-an-identification = This observation must have an identification.
# Project requirement shown when adding an observation to a project; followed by
# the taxon name
This-observation-must-have-an-identification-in-the-following-taxon = This observation must have an identification in the following taxon:
# Project requirement shown when adding an observation to a project
This-observation-must-have-photo-evidence = This observation must have photo evidence.
# Project requirement shown when adding an observation to a project
This-observation-must-have-photo-or-sound-evidence = This observation must have photo or sound evidence.
# Project requirement shown when adding an observation to a project
This-observation-must-have-sound-evidence = This observation must have sound evidence.
# Description of the Needs ID quality grade in the data quality section of
# observation details
This-observation-needs-more-identifications = This observation needs more identifications to reach Research Grade status
# Title on observation details for an observation with needs ID quality grade
This-observation-needs-more-identifications--status-title = This observation needs more identifications
# Note on observation details explaining the observer opted out of the community
# taxon
This-observer-has-opted-out-of-the-Community-Taxon = This observer has opted out of the Community Taxon
# Description of the captive/cultivated option in the wild status sheet of the
# observation editor
This-organism-was-placed-by-humans = This organism was placed in this location by humans. This applies to things like garden plants, pets, and zoo animals.
# Shown on observation details in place of a sound that was hidden by moderators
This-sound-was-hidden-for-violating-community-guidelines-or-terms = This sound was hidden for violating Community Guidelines or Terms of Use.
# Empty-state message on a user's followers list
This-user-has-no-followers = This user has no followers.
# Empty-state message on the list of projects a user has joined
This-user-has-not-joined-any-projects = This user has not joined any projects.
# Empty-state message on the list of users a user is following
This-user-is-not-following-anyone = This user is not following anyone.
# Warning shown under a project on the Add to Projects screen (opened from the
# observation editor) when the observation is missing required project fields
To-add-to-this-project-all-required-fields-must-be-filled = To add to this project, all required fields must be filled
# Message in the sheet on My Observations prompting a logged-out user to log in
# so their observations can sync
To-sync-your-observations-to-iNaturalist = To sync your observations to iNaturalist, please log in.
# Message on the Explore screen shown when location permission is off and nearby
# results can't be shown
To-view-nearby-organisms-please-enable-location = To view nearby organisms, please enable location.
# Message on the Nearby tab of the Projects screen shown when location
# permission is off
To-view-nearby-projects-please-enable-location = To view nearby projects, please enable location.
# Explanatory text at the bottom of the Add to Projects screen (opened from the
# observation editor) about Collection and Umbrella Projects
To-view-this-observations-Collection-and-Umbrella-Projects = To view this observation’s Collection and Umbrella Projects, go to its observation page once it’s uploaded.
# Onboarding Research Grade screen: headline. Text in <1> tags is underlined
Together-we-help-observations-reach-Research-Grade = <0>Together, we help observations reach </0><1>Research Grade</1><0>.</0>
# Accessibility hint for the map button that switches between map types (e.g.
# standard and satellite)
Toggle-map-type = Toggle map type
# Accessibility hint for tapping a collapsible section header
Toggles-the-section-open-or-closed = Toggles the section open or closed.
# Title of a camera tip about insects
Top-and-side-views = Top and side views
# Section header on the ID suggestions screen above the top suggested taxon; all
# caps is a header style
TOP-ID-SUGGESTION = TOP ID SUGGESTION
# Title of a camera tip about fungi
Top-of-the-cap = Top of the cap
# Title of a camera tip about arachnids
Top-view--arachnids = Top view
# Title of a camera tip about crustaceans
Top-view--crustaceans = Top view
# Title of a camera tip about echinoderms
Top-view--echinoderms = Top view
# Title of a camera tip about mammals
Tracks-and-scat = Tracks and scat
# Project type label shown in project lists and on the project details screen
Traditional-Project = Traditional Project
# Section heading on the Add to Projects screen (opened from the observation
# editor) for projects you can manually add observations to
Traditional-Projects = Traditional Projects
# Body of the camera tip "Head, beak, and body" for birds
Try-to-get-the-head-beak-and-body-in-focus-Their-shapes-say-a-lot-about-what-kind-of-bird-it-is = Try to get the head, beak, and body in focus. Their shapes say a lot about what kind of bird it is.
# Project type label shown in project lists and on the project details screen
Umbrella-Project = Umbrella Project
# Title of a camera tip about fungi
Underside = Underside
# Button on a user profile (and in the confirmation sheet) to stop following
# that user; verb
UNFOLLOW = UNFOLLOW
# Title of the confirmation sheet shown when unfollowing a user from their
# profile
UNFOLLOW-USER = UNFOLLOW USER?
# Text to show when a taoxn rank is unknown or missing
Unknown--rank = Unknown
# Text to show when a taxon or identification is unknown or missing
Unknown--taxon = Unknown
# Text to show when a user (or their name) is unknown or missing
Unknown--user = Unknown
# Generic error message
Unknown-error = Unknown error
# Placeholder name shown in identification sheets (agree, suggest, withdraw ID)
# when the identification has no taxon
Unknown-organism = Unknown organism
# Header title for the Explore context showing species the user has not observed
Unobserved = Unobserved
# Option in the Reviewed filter in Explore advanced search filters
Unreviewed-observations-only = Unreviewed observations only
# Accessibility label for an observation's upload status icon once uploading is
# finished
Upload-Complete = Upload Complete
# Accessibility label for the icon shown while an observation is uploading
Upload-in-progress = Upload in progress
# Button in the observation editor (and in the upload sheet on the taxon details
# screen) that uploads the observation right away
UPLOAD-NOW = UPLOAD NOW
# Option in the add-observation menu (opened from the green observation button)
# to create an observation from existing photos
Upload-photos = Upload photos
# Accessibility label for an observation's upload status icon; { $uploadProgress
# } is the percentage uploaded so far
Upload-Progress = Upload { $uploadProgress } percent complete
# Title of the sheet on the taxon details screen explaining the benefits of
# uploading the observation
UPLOAD-TO-INATURALIST = UPLOAD TO INATURALIST
# Shows the number of observations a user can upload to iNat from my observations page
Upload-x-observations =
    Upload { $count ->
        [one] 1 observation
       *[other] { $count } observations
    }
# Body text of an onboarding card shown after the user has made several
# observations
Upload-your-observations-to-contribute-data-to-help-save-species = Upload your observations to contribute data to help save species.
# Describes whether a user made this observation from web, iOS, or Android
Uploaded-via-application = Uploaded via: { $application }
# Shows the progress of uploads for X of Y observations, but omits the
# word "observations" so the message won't get cut off on small screens
Uploading-x-of-y = Uploading { $currentUploadCount } of { $total }
# Shows the number of observations a user is currently uploading out of total on my observations page
Uploading-x-of-y-observations =
    { $total ->
        [one] Uploading { $currentUploadCount } observation
       *[other] Uploading { $currentUploadCount } of { $total } observations
    }
# Large intro text on the empty My Observations screen; tapping it opens the
# camera
Use-iNaturalist-to-identify-any-living-thing = Use iNaturalist to identify any living thing
# Text for a button prompting the user to grant access to location
USE-LOCATION = USE LOCATION
# Accessibility hint for the camera button that switches between the front and
# back camera
Use-the-devices-other-camera = Use the device's other camera.
# Body text of the screen asking the user to grant camera permission
Use-the-iNaturalist-camera-to-see-real-time-identifications-and-take-photos = Use the iNaturalist camera to see real-time identifications and take photos!
# Body text of the screen asking the user to grant microphone permission before
# recording sounds
Use-your-devices-microphone-to-record-animal-sounds-and-share-them = Use your device’s microphone to record animal sounds and share them to get identifications and contribute to science!
# Section heading in Explore advanced search filters for filtering by user; all
# caps is a header style
USER = USER
# Accessibility label for a tappable username that opens the user's profile; {
# $userHandle } is the user's username
User = User { $userHandle }
# Onboarding community identification screen: header of a sample activity feed
# entry where another person commented on the user's observation. userName is
# a username. Text in <1> tags is bold
user-added-a-comment = <1>{ $userName }</1><0> added a comment</0>
# Onboarding community identification screen: header of a sample activity feed
# entry where another person identified the user's observation. userName is a
# username. Text in <1> tags is bold
user-identified-your-observation = <1>{ $userName }</1><0> identified your observation!</0>
# Appears above the text fields
USERNAME-OR-EMAIL = USERNAME OR EMAIL
# label in project requirements
Users = Users
# Toast in the AI camera indicating that the user's location is being used to
# improve suggestions
Using-location = Using location
# Header for a project rule requiring an observation to be eligible for
# Research Grade
Verifiable--project-rule = Verifiable
# Onboarding carousel slide 3 description
Verified-IDs-are-used-for-science-and-conservation = Verified IDs are used for science and conservation
# Listing of app and build versions
Version-app-build = Version { $appVersion } ({ $buildVersion })
# Button in project requirements that expands the list of place rules; { $count
# } is the total number of places
VIEW-ALL-X-PLACES = VIEW ALL { $count } PLACES
# Button in project requirements that expands the list of project rules; {
# $count } is the total number of projects
VIEW-ALL-X-PROJECTS = VIEW ALL { $count } PROJECTS
# Button in project requirements that expands the list of taxon rules; { $count
# } is the total number of taxa
VIEW-ALL-X-TAXA = VIEW ALL { $count } TAXA
# Button in project requirements that expands the list of user rules; { $count }
# is the total number of users
VIEW-ALL-X-USERS = VIEW ALL { $count } USERS
# Button in the taxonomy section of the taxon details screen that shows the
# taxon's child taxa
VIEW-CHILDREN-TAXA = VIEW CHILDREN TAXA
# Button on the Details tab of the observation detail screen that opens the Data
# Quality Assessment
VIEW-DATA-QUALITY-ASSESSMENT = VIEW DATA QUALITY ASSESSMENT
# Button on the Help screen that opens the iNaturalist educator's guide in a web
# browser
VIEW-EDUCATORS-GUIDE = VIEW EDUCATOR'S GUIDE
# Button on user profile that displays a list of users that follow that user
VIEW-FOLLOWERS = VIEW FOLLOWERS
# Button on user profile that displays a list of users that the user is following
VIEW-FOLLOWING = VIEW FOLLOWING
# Link or menu item that opens the current observation, project, or taxon on the
# iNaturalist website
View-in-browser = View in browser
# Button in the Map section of the project details screen that shows the
# project's observations in Explore
VIEW-IN-EXPLORE = VIEW IN EXPLORE
# Button on the Help screen that opens the iNaturalist help pages in a web
# browser
VIEW-INATURALIST-HELP = VIEW INATURALIST HELP
# Button or accessibility label for an element that lets the user view a
# photo
View-photo = View photo
# Accessibility label for the photo licensing dropdown in Explore advanced
# search filters
View-photo-licensing-info = View photo licensing info
# Button on the project details screen that opens the project's requirements
VIEW-PROJECT-REQUIREMENTS = VIEW PROJECT REQUIREMENTS
# Button that lets user view a list of projects related to the observation or user profile they're viewing
VIEW-PROJECTS = VIEW PROJECTS
# Label for a button that shows identification suggestions for an observation
# or photo
View-suggestions = View suggestions
# Title of an onboarding card about notifications
Watch-your-notifications-for-identifications = Watch your notifications for identifications!
# Message on the ID suggestions screen shown instead of a top suggestion when
# the AI isn't confident enough
We-are-not-confident-enough-to-make-a-top-ID-suggestion = We’re not confident enough to make a top ID suggestion, but here are some other suggestions:
# Onboarding location permission screen: reassurance about how location is used
We-dont-sell-your-data = We don’t sell your data
# Onboarding location permission screen: reassurance about how location is used
We-only-use-this-for-observations-you-upload-to-iNaturalist = We only use this for observations you upload to iNaturalist
# Title of a camera tip about arachnids
Web-burrow-or-surroundings = Web, burrow, or surroundings
# Title of an onboarding card shown to returning users
Welcome-back = Welcome back!
# Onboarding observation story screen: label for the row showing what was seen
# in the sample observation
What = What
# Section heading on the About screen; all caps is a header style
WHAT-IS-INATURALIST = WHAT IS INATURALIST?
# Paragraph in the What is iNaturalist section of the About screen
Whats-more-by-recording = What's more, by recording and sharing your observations, you'll create research-quality data for scientists working to better understand and protect nature. So if you like recording your findings from the outdoors, or if you just like learning about life, join us!
# Onboarding observation story screen: label for the row showing when the
# sample observation was made
When = When
# Label in Advanced Settings above options for what the green observation button
# opens; followed by a list of choices
When-tapping-the-green-observation-button = When tapping the green observation button, open:
# Onboarding observation story screen: label for the row showing where the
# sample observation was made
Where = Where
# Onboarding observation story screen: label for the row showing who made the
# sample observation
Who = Who
# Title of a camera tip about fishes
Whole-body-from-the-side--fishes = Whole body from the side
# Title of a camera tip about mammals
Whole-body-from-the-side--mammals = Whole body from the side
# Title of a camera tip about plants
Whole-plant = Whole plant
# Section heading on the taxon details screen above the Wikipedia summary; all
# caps is a header style
WIKIPEDIA = WIKIPEDIA
# Option meaning the organism is wild (not captive or cultivated), used in the
# wild status sheet, Explore filters, and project rules
Wild = Wild
# Title of the wild status sheet in the observation editor and section heading
# in Explore advanced search filters
WILD-STATUS = WILD STATUS
# Label for a button that withdraws an identification
Withdraw = Withdraw
# Button to Withdraw identification made by user
WITHDRAW-ID = WITHDRAW ID
# Title of the sheet on the observation detail screen confirming withdrawal of
# your identification
WITHDRAW-ID-QUESTION = WITHDRAW ID?
# Accessibility hint for the confirm button in the withdraw identification sheet
Withdraws-identification = Withdraws identification
# Location option meaning anywhere in the world, used in Explore location
# filters and project requirements
Worldwide = Worldwide
# Button on the Explore location search screen that resets the location to
# worldwide
WORLDWIDE = WORLDWIDE
# Message in the sound recorder's warning sheet shown when resetting a recording
Would-you-like-to-discard-your-current-recording-and-start-over = Would you like to discard your current recording and start over?
# Header of the sheet shown when closing an onboarding education step
Would-you-like-to-exit-the-demo = Would you like to exit the demo?
# Message in the sheet confirming a suggested identification on an observation
Would-you-like-to-suggest-the-following-identification = Would you like to suggest the following identification?
# Accessibility label for the comment count on an observation; { $count } is the
# number of comments
x-comments =
    { $count ->
        [one] { $count } comment
       *[other] { $count } comments
    }
# Number of observations with an upload failure in ObsEdit multiple observation screen
x-failed =
    { $count ->
        [one] { $count } failed
       *[other] { $count } failed
    }
# Number of filters applied to a saved search
X-filters =
    { $count ->
        [one] { $count } filter
       *[other] { $count } filters
    }
# Subtitle for a screen showing the list of followers a user has
X-FOLLOWERS =
    { $count ->
        [one] { $count } FOLLOWER
       *[other] { $count } FOLLOWERS
    }
# Count shown next to a user in user lists (e.g. Explore identifiers); { $count
# } is the number of identifications
X-Identifications =
    { $count ->
        [one] { $count } Identification
       *[other] { $count } Identifications
    }
# Accessibility label for the identification count on an observation; { $count }
# is the number of identifications
x-identifications =
    { $count ->
        [one] { $count } identification
       *[other] { $count } identifications
    }
# Label for a count of identifiers that appears above this text
X-IDENTIFIERS--below-number =
    { $count ->
        [one] IDENTIFIER
       *[other] IDENTIFIERS
    }
# Subtitle for a screen showing a list of journal posts
X-JOURNAL_POSTS =
    { $count ->
        [one] { $count } JOURNAL POST
       *[other] { $count } JOURNAL POSTS
    }
# Subheader for number of project members screen
X-MEMBERS =
    { $count ->
        [one] { $count } MEMBER
       *[other] { $count } MEMBERS
    }
# Shows number of observations in a variety of contexts
X-Observations =
    { $count ->
        [one] 1 Observation
       *[other] { $count } Observations
    }
# Label for a count of observations that appears above this text
X-OBSERVATIONS--below-number =
    { $count ->
        [one] OBSERVATION
       *[other] OBSERVATIONS
    }
# Status text in the upload banner on My Observations after observations are
# deleted; { $count } is the number deleted
X-observations-deleted =
    { $count ->
        [one] 1 observation deleted
       *[other] { $count } observations deleted
    }
# Status text in the upload banner on My Observations after uploading; { $count
# } is the number uploaded
X-observations-uploaded =
    { $count ->
        [one] 1 observation uploaded
       *[other] { $count } observations uploaded
    }
# Label for a count of observers that appears above this text
X-OBSERVERS--below-number =
    { $count ->
        [one] OBSERVER
       *[other] OBSERVERS
    }
# Progress or position indicator, e.g. when viewing 2 of 3 observations, or 3
# of 10 photos
X-of-Y =
    { $x ->
        [one] 1
       *[other] { $x }
    } { $y ->
        [one] of { $y }
       *[other] of { $y }
    }
# Percentage shown for an AI suggestion's confidence; { $count } is the
# confidence number
X-percent = { $count }%
# Confidence shown for each additional AI suggestion on the match screen; {
# $count } is the percentage
X-percent-confidence = { $count }% confidence
# Displays number of photos attached to an observation in the Media Viewer
X-PHOTOS =
    { $photoCount ->
        [one] 1 PHOTO
       *[other] { $photoCount } PHOTOS
    }
# Displays number of photos and observations a user has selected from the camera roll
X-PHOTOS-X-OBSERVATIONS =
    { $photoCount ->
        [one] 1 PHOTO
       *[other] { $photoCount } PHOTOS
    }, { $observationCount ->
        [one] 1 OBSERVATION
       *[other] { $observationCount } OBSERVATIONS
    }
# Displays number of photos and sounds attached to an observation in the Media
# Viewer
X-PHOTOS-Y-SOUNDS =
    { $photoCount ->
        [one] 1 PHOTO
       *[other] { $photoCount } PHOTOS
    }, { $soundCount ->
        [one] 1 SOUND
       *[other] { $soundCount } SOUNDS
    }
# Subtitle on the list of projects an observation belongs to; { $projectCount }
# is the number of projects
X-PROJECTS = { $projectCount } PROJECTS
# Number of observations saved in ObsEdit multiple observation screen
x-saved =
    { $count ->
        [one] { $count } saved
       *[other] { $count } saved
    }
# Displays number of sounds attached to an observation in the Media Viewer
X-SOUNDS =
    { $count ->
        [one] 1 SOUND
       *[other] { $count } SOUNDS
    }
# Label for a count of observations that appears above this text
X-SPECIES--below-number =
    { $count ->
        [one] SPECIES
       *[other] SPECIES
    }
# Number of observations uploaded in ObsEdit multiple observation screen
x-uploaded =
    { $count ->
        [one] { $count } uploaded
       *[other] { $count } uploaded
    }
# Number of observations with upload in progress in ObsEdit multiple observation screen
x-uploading =
    { $count ->
        [one] { $count } uploading
       *[other] { $count } uploading
    }
# Error text in the upload banner on My Observations; { $count } is the number
# of failed uploads
x-uploads-failed =
    { $count ->
        [one] { $count } upload failed
       *[other] { $count } uploads failed
    }
# Radio option in the project sheet asking whether project curators may see your
# hidden coordinates
Yes-but-only-if-I-add-the-observation-to-the-project-myself = Yes, but only if I add the observation to the project myself
# Button confirming the user wants to leave the onboarding demo
YES-EXIT = YES, EXIT
# Radio option in the project sheet asking whether project curators may see your
# hidden coordinates
Yes-no-matter-who-adds-the-observation-to-the-project = Yes, no matter who adds the observation to the project
# Onboarding Research Grade screen: shown in place of a username on a sample
# observation, to show it as the user's own
you--observer = you
# Title of an alert shown when an action needs an internet connection
You-are-offline = You are offline
# Message on the ID suggestions screen when offline; tapping it retries
You-are-offline-Tap-to-reload = You are offline. Tap to reload.
# Message with an offline icon shown in various screens when content can't load;
# tapping it retries
You-are-offline-Tap-to-try-again = You are offline. Tap to try again.
# Text in the sheet for adding photos or sounds to an observation in the
# observation editor
You-can-add-up-to-20-media = You can add up to 20 photos and 20 sounds per observation.
# Onboarding location permission screen: reassurance about how location is used
You-can-adjust-your-location-privacy-on-every-observation = You can adjust your location privacy on every observation
# Text on the Donate screen introducing the link to the iNaturalist store
You-can-also-check-out-merchandise = You can also check out merchandise for iNaturalist and Seek at our store below!
# Body of the sheet shown when closing an onboarding education step; the demo can be replayed from Settings
You-can-always-revisit-this-later-in-settings = You can always revisit this later in settings.
# Empty-state hint on the Joined tab of the Projects screen, shown below the
# 'not joined any projects' message
You-can-click-join-on-the-project-page = You can click “join” on the project page.
# Text under the iNaturalist Help Page heading on the Help screen
You-can-find-answers-on-our-help-page = You can find answers on our help page.
# Explanatory text under the Traditional Projects heading on the Add to Projects
# screen
You-can-manually-add-observations-to-Traditional-Projects-you-have-joined = You can manually add observations to Traditional Projects you have joined.
# Body text of an onboarding card shown after the user creates an account
You-can-now-upload-your-observations-to-iNaturalist-and-contribute = You can now upload your observations to iNaturalist and contribute to global biodiversity research.
# Snackbar message in the camera when the photo limit per observation is reached
You-can-only-add-20-photos-per-observation = You can only add 20 photos per observation
# Body of the sheet shown when closing an onboarding sign-up step
You-can-only-get-identifications-from-other-people-by-creating-an-account = You can only get identifications from other people by creating an account.
# Alert message when sending app logs and no email app is installed (iOS); {
# $email } is the support email address
You-can-still-share-the-file = You can still share the file with another app. If you can email it, please send it to { $email }
# Onboarding community identification screen: a note left with a sample
# identification of a spotted beetle, explaining how the identifier knew what
# it was
You-can-tell-because-of-the-spots = You can tell because of the spots!
# Message on the ID suggestions screen when the AI has no suggestions for a
# photo taken with the camera
You-can-upload-this-observation-to-our-community = You can upload this observation to our community to get an identification from a real person, and help our AI improve its identifications in the future
# Explanatory text at the bottom of the Add to Projects screen about Collection
# and Umbrella Projects
You-cant-add-or-remove-observations-from-collection-and-umbrella-projects = You can’t add or remove observations from collection and umbrella projects.
# Message in the warning sheet shown when leaving Explore filters without
# applying changes
You-changed-filters-will-be-discarded = You changed filters, but they were not applied to your explore search results.
# Onboarding community identification screen: first entry in a sample activity
# feed about the user's own observation. Text in <1> tags is bold
you-created-an-observation-with-an-identification = <1>you</1><0> created an observation with an identification</0>
# Empty-state message on the Notifications screen for your own observations
You-have-no-notifications-get-started-by-creating-your-own-observations = You have no notifications! Get started by creating your own observations.
# Empty-state message on the Notifications screen's tab for others' observations
# you've identified or commented on
You-have-no-notifications-you-will-see-updates-to-obs-you-have-left-IDs-or-comments-on = You have no notifications! You will see updates to observations you have left IDs or comments on here.
# Note on your own observation's detail screen saying you opted out of the
# Community Taxon
You-have-opted-out-of-the-Community-Taxon = You have opted out of the Community Taxon
# Empty-state message on the Joined tab of the Projects screen
You-havent-joined-any-projects-yet = You haven’t joined any projects yet!
# Empty-state message on the Add to Projects screen (opened from the observation
# editor)
You-havent-joined-any-Traditional-Projects-yet = You haven’t joined any Traditional Projects yet!
# Empty-state message on the species view of My Observations
You-havent-observed-any-species-yet = You haven't observed any species yet.
# Text on the match screen above the suggested taxon when the AI is fairly
# confident at a rank above species
You-likely-observed-a-species-in-this-group = You likely observed a species in this group
# Text on the match screen above the suggested species when the AI is fairly
# confident
You-likely-observed-this-species = You likely observed this species
# Text on the match screen above the suggested taxon when the AI has low
# confidence at a rank above species
You-may-have-observed-a-species-in-this-group = You may have observed a species in this group
# Text on the match screen above the suggested species when the AI has low
# confidence
You-may-have-observed-this-species = You may have observed this species
# Description for modal that pops up if user logs in and has more than 50 observations
You-may-notice-changes-to-how-things-look-and-flow = You may notice changes to how things look and flow. You can control your options in the settings.
# Error alert on the login screen when signing in with Google on an Android
# device without Google Play Services
You-must-install-Google-Play-Services-to-sign-in-with-Google = You must install Google Play Services to sign in with Google.
# Error message when you try to do something that requires an Internet
# connection but such a connection is, tragically, missing
You-need-an-Internet-connection-to-do-that = You need an Internet connection to do that.
# Error message when you try to do something that requires log in
You-need-log-in-to-do-that = You need to log in to do that.
# Alert message in the observation editor when a logged-out user taps Projects
You-need-to-be-logged-in-to-add-observations-to-projects = You need to be logged in to add observations to projects.
# Text on the match screen above the suggested taxon when the AI is highly
# confident at a rank above species
You-observed-a-species-in-this-group = You observed a species in this group
# Text on the match screen above the suggested species when the AI is highly
# confident
You-observed-this-species = You observed this species
# Second line of the empty Notifications screen shown to logged-out users
You-will-see-notifications = You’ll see notifications here once you log in & upload observations.
# Paragraph on the Donate screen explaining what donations support
Your-donation-to-iNaturalist = Your donation to iNaturalist supports the improvement and stability of the mobile apps and website that connects millions of people to nature and enables the protection of biodiversity worldwide!
# Confirmation message shown above the login form after the user confirms their
# email
Your-email-is-confirmed = Your email is confirmed! Please log in to continue.
# Text in the Location Too Imprecise sheet in the observation editor; { $x } is
# the maximum allowed uncertainty in kilometers
Your-location-uncertainty-is-over-x-km = Your location uncertainty is over { $x } km, which is too high to be helpful to identifiers. Edit the location and zoom in until the accuracy circle turns green and is centered on where you observed the organism.
# Onboarding Research Grade screen: introduces a checklist of the
# requirements for an observation to become Research Grade
Your-observation-can-become-Research-Grade-when = Your observation can become Research Grade when:
# Title for modal shown to users after they make five observations
Your-observations-can-help-science = Your observations can help science!
# Explanation under the option to keep your observations in the project, in the
# sheet for leaving a project
Your-observations-will-stay-in-the-project = Your observations will stay in the project and curators will still be able to view their hidden coordinates.
# Subtitle on Add to Projects membership rule row (coordinates_shareable_by_project_curators?)
Your-project-membership-settings-must-allow = Your project membership settings must allow project curators to access the true locations of your project observations. You change location permissions on the project's page.
# Title for modal shown after account creation
Youre-ready-to-share-your-observations = You’re ready to share your observations!
# Text prompting the user to open Settings to grant permission after
# permission has been denied
Youve-denied-permission-prompt = You’ve denied permission. Please grant permission in the settings app.
# Message on the camera permission screen when permission was previously denied
Youve-previously-denied-camera-permissions = You've previously denied camera permissions, so please enable them in settings.
# Message on the location permission prompt when permission was previously
# denied
Youve-previously-denied-location-permissions = You’ve previously denied location permissions, so please enable them in settings.
# Message on the microphone permission screen when permission was previously
# denied
Youve-previously-denied-microphone-permissions = You’ve previously denied microphone permissions, so please enable them in settings.
# Body of the camera tip "Keep it sharp" for birds
Zoom-in-as-far-as-you-can-without-the-photo-getting-blurry-A-clear-photo-from-farther-away-is-more = Zoom in as far as you can without the photo getting blurry. A clear photo from farther away is more useful.
# Warning text on the location picker map when the location accuracy is
# acceptable but could be better
Zoom-in-as-much-as-possible-to-improve = Zoom in as much as possible to improve location accuracy and get better identifications.
# Accessibility label for the map button that centers the map on the user's
# current location
Zoom-to-current-location = Zoom to current location
# Label for button that shows zoom level, e.g. on a camera
zoom-x = { $zoom }×
