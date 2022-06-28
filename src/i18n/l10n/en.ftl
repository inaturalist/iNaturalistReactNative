# Header for a block of text describing a taxon
ABOUT-taxon-header = ABOUT

Add-Date-Time = Add Date/Time

Add-Location = Add Location

Add-optional-notes = Add optional notes

Add-to-projects = Add to projects

All = All

All-observations = All observations

Amphibians = Amphibians

Arachnids = Arachnids

Are-you-sure = Are you sure?

Are-you-sure-you-want-to-sign-out = Are you sure you want to sign out? This will delete all your observations on this device. It will not affect any observations you've uploaded to iNaturalist.

Birds = Birds

Cancel = Cancel

Captive-Cultivated = Captive/Cultivated

# Quality grade option
Casual = Casual

Combine-Photos = Combine Photos

# Onboarding for users learning to group photos in the camera roll
Combine-photos-onboarding = Combine photos into observations – make sure there is only one species per observation

CREATE-AN-OBSERVATION = CREATE AN OBSERVATION

Date = Date

Date-added-newest-to-oldest = Date added - newest to oldest

Date-added-oldest-to-newest = Date added - oldest to newest

Delete-comment = Delete comment

DELETE-X-OBSERVATIONS = DELETE {$count ->
    [one] 1 OBSERVATION
    *[other] {$count} OBSERVATIONS
}

Description-Tags = Description/Tags

Evidence = Evidence

Explore = Explore

Filters = Filters

Finish = Finish

Fish = Fish

Fungi = Fungi

Geoprivacy = Geoprivacy:

# Instruction for an Android user to go to the Settings app to grant
# permissions after they have asked never to be asked for that permission
# again
Go-to-the-Settings-app-to-grant-permissions =
    Go to the Settings app to grant iNaturalist the appropriate permissions.

# Verb phrase label for a button to grant the app a permission, e.g.
# permission to use the camera
Grant-Permission = Grant Permission

Group-Photos = Group Photos

Has-Photos = Has Photos

Has-Sounds = Has Sounds

High = High

IDENTIFICATION = IDENTIFICATION

Identification = Identification

Insects = Insects

Introduced = Introduced

Location = Location

Log-in = Log in

Low = Low

Mammals = Mammals

Media = Media

Mollusks = Mollusks

# The following Month- strings are the months of the year (in month order, not alphabetical order)
Month-January = January

Month-February = February

Month-March = March

Month-April = April

Month-May = May

Month-June = June

Month-July = July

Month-August = August

Month-September = September

Month-October = October

Month-November = November

Month-December = December

Months = Months

Most-faved = Most faved

Native = Native

# Quality grade option
Needs-ID = Needs ID

New-Observation = New Observation

Next = Next

No-Location = No Location

Obscured = Obscured

Observation = Observation

Open = Open

Other-Data = Other Data

Paused = Paused

Photo-Licensing = Photo Licensing

Photos-you-take-will-appear-here = Photos you take will appear here

Plants = Plants

# Help text for playing back a sound recording
Playing-Sound = Playing Sound

# Help text for beginning a sound recording
Press-Record-to-Start = Press Record to Start

Private = Private

Projects = Projects

Quality-Grade = Quality Grade

Rank = Rank

# The following Ranks- strings are taxonomic ranks (in taxonomic order, not alphabetical order)
Ranks-stateofmatter = state of matter

Ranks-kingdom = kingdom

Ranks-subkingdom = subkingdom

Ranks-phylum = phylum

Ranks-subphylum = subphylum

Ranks-superclass = superclass

Ranks-class = class

Ranks-subclass = subclass

Ranks-infraclass = infraclass

Ranks-superorder = superorder

Ranks-order = order

Ranks-suborder = suborder

Ranks-infraorder = infraorder

Ranks-subterclass = subterclass

Ranks-parvorder = parvorder

Ranks-zoosection = zoosection

Ranks-zoosubsection = zoosubsection

Ranks-superfamily = superfamily

Ranks-epifamily = epifamily

Ranks-family = family

Ranks-subfamily = subfamily

Ranks-supertribe = supertribe

Ranks-tribe = tribe

Ranks-subtribe = subtribe

Ranks-genus = genus

Ranks-genushybrid = genushybrid

Ranks-subgenus = subgenus

Ranks-section = section

Ranks-subsection = subsection

Ranks-complex = complex

Ranks-species = species

Ranks-hybrid = hybrid

Ranks-subspecies = subspecies

Ranks-variety = variety

Ranks-form = form

Ranks-infrahybrid = infrahybrid

Recently-observed = Recently observed

Record-a-sound = Record a sound

Record-new-sound = Record new sound

Recording-Sound = Recording Sound

Remove-Photo = Remove Photo

Remove-Photos = Remove Photos

Reptiles = Reptiles

# Quality grade option
Research-Grade = Research Grade

Reset = Reset

Reviewed = Reviewed

Reviewed-only = Reviewed only

Search-for-a-location = Search for a location

Search-for-a-project = Search for a project

Search-for-a-taxon = Search for a taxon

Search-for-a-user = Search for a user

Search-for-description-tags-text = Search for description/tags text

Select = Select

Separate-Photos = Separate Photos

Sign-out = Sign out

# Header for a section showing taxa similar to a single taxon
SIMILAR-SPECIES-header = SIMILAR SPECIES

Sort-by = Sort by

Status = Status

# Header for a block of text describing a taxon's conservation status
STATUS-header = STATUS

# Header in pop up explaining options for creating an observation
STEP-1-EVIDENCE = STEP 1. EVIDENCE

Submit-without-evidence = Submit without evidence

Take-a-photo-with-your-camera = Take a photo with your camera

Tap-to-search-for-taxa = Tap to search for taxa

Taxon = Taxon

# Header for a block of text describing a taxon's taxonomy
TAXONOMY-header = TAXONOMY

# Onboarding for users adding their first evidence of an organism
The-first-thing-you-need-is-evidence = The first thing you need is evidence of an organism. This helps others identify what you saw.

Threatened = Threatened

Unreviewed-only = Unreviewed only

Upload-a-photo-from-your-gallery = Upload a photo from your gallery

UPLOAD-OBSERVATION = UPLOAD OBSERVATION

# Shows the number of observations a user can upload to iNat from my observations page
Upload-X-Observations = Upload {$count ->
    [one] 1 Observation
    *[other] {$count} Observations
}

# Shows the number of photos a user selected from the camera roll for upload
Upload-X-photos = Upload {$count ->
    [one] 1 photo
    *[other] {$count} photos
}

# Shows the number of observations a user is currently uploading on my observations page
Uploading-X-Observations = Uploading {$count ->
    [one] 1 Observation
    *[other] {$count} Observations
}

User = User

Visually-search-iNaturalist-data = Visually search iNaturalist’s wealth of data. Search by a taxon in a location

# Banner above Explore Map showing total number of results
X-Observations = {$observationCount ->
    [one] 1 Observation
    *[other] {$observationCount} Observations
}

# Displays number of photos attached to an observation in the Media Viewer
X-Photos = {$photoCount ->
    [one] 1 Photo
    *[other] {$photoCount} Photos
}

# Displays number of photos and observations a user has selected from the camera roll
X-photos-X-observations = {$photoCount ->
    [one] 1 photo
    *[other] {$photoCount} photos
}, {$observationCount ->
    [one] 1 observation
    *[other] {$observationCount} observations
}

Yes-delete-photo = Yes, delete photo

# Message shown when a permission is required to use a part of the app
# (e.g. permission to access the camera) but the user denied the permission.
You-denied-iNaturalist-permission-to-do-that = You denied iNaturalist permission to do that

# Appears in the login screen
Login-header = Log in to use iNaturalist
Login-sub-title = Document living things, identify organisms & contribute to science

# Appears above the text fields
Username-or-Email = Username or Email
Password = Password

# Forgot password link
Forgot-Password = Forgot Password?

# Appears when the user enters invalid username/password
Invalid-login = The username or password is incorrect

# Appears in the reset password screen
Reset-password-header = Let's reset your password
# Appears above the email text field
Email = email
# Reset password button
Reset-Password = Reset Password

# When the user tries to reset password but enters a non-existent email
No-account-found = No account found with that email

# After pressing the reset password button
Check-your-email = Check your email! We've sent password reset instructions.
Return-to-login = Return to login

Sign-out = Sign out
Logged-in-as = Logged in as: { $username }
