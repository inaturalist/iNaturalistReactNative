import {
  by, device, element, expect, waitFor,
} from "detox";

import { iNatE2eAfterEach, iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import closeOnboarding from "./sharedFlows/closeOnboarding";
import signIn from "./sharedFlows/signIn";
import uploadObservation from "./sharedFlows/uploadObservation";

const TIMEOUT = 10_000;

function delay( ms ) {
  return new Promise( resolve => { setTimeout( resolve, ms ); } );
}

describe( "Signed in user", () => {
  beforeAll( async ( ) => iNatE2eBeforeAll( device ) );
  beforeEach( async ( ) => iNatE2eBeforeEach( device ) );
  afterEach( async ( ) => iNatE2eAfterEach( device ) );

  async function createAndUploadObservation( options = { upload: false } ) {
    const addObsButton = element( by.id( "add-obs-button" ) );
    await waitFor( addObsButton ).toBeVisible().withTimeout( TIMEOUT );
    await addObsButton.tap();
    await expect( element( by.id( "observe-without-evidence-button" ) ) ).toBeVisible();
    // Observe without evidence
    const obsWithoutEvidenceButton = element(
      by.id( "observe-without-evidence-button" ),
    );
    await expect( obsWithoutEvidenceButton ).toBeVisible();
    await obsWithoutEvidenceButton.tap();

    await uploadObservation( options );

    const obsListItem = element( by.id( /MyObservations\.obsListItem\..*/ ) ).atIndex( 0 );
    const obsListItemAttributes = await obsListItem.getAttributes( );
    const uuid = obsListItemAttributes.elements
      ? obsListItemAttributes.elements[0].identifier.split( "." ).pop( )
      : obsListItemAttributes.identifier.split( "." ).pop( );

    const listItem = element( by.id( `MyObservations.obsListItem.${uuid}` ) );
    await waitFor( listItem ).toBeVisible().withTimeout( TIMEOUT );

    return uuid;
  }

  async function deleteObservationByUUID( uuid, username ) {
    const obsListItem = element( by.id( `MyObservations.obsListItem.${uuid}` ) );
    await obsListItem.tap();

    const editButton = element( by.id( "ObsDetail.editButton" ) );
    await waitFor( editButton ).toBeVisible().withTimeout( TIMEOUT );
    // Navigate to the edit screen
    await editButton.tap();

    // Check that the edit screen is visible
    await waitFor( element( by.text( "EVIDENCE" ) ) )
      .toBeVisible()
      .withTimeout( TIMEOUT );
    // Press header kebab menu
    const headerKebabMenu = element( by.id( "KebabMenu.Button" ) );
    await expect( headerKebabMenu ).toBeVisible();
    await headerKebabMenu.tap();
    // Press delete observation
    const deleteObservationMenuItem = element( by.id( "Header.delete-observation" ) );
    await waitFor( deleteObservationMenuItem ).toBeVisible().withTimeout( TIMEOUT );
    await deleteObservationMenuItem.tap();
    // Check that the delete button is visible
    const deleteObservationButton = element( by.text( "DELETE" ) );
    await waitFor( deleteObservationButton ).toBeVisible().withTimeout( TIMEOUT );
    // Press delete observation
    await deleteObservationButton.tap();

    // Make sure we're back on MyObservations
    await waitFor( username ).toBeVisible().withTimeout( TIMEOUT );
  }

  it( "should create an observation, add a comment, and delete the observation", async () => {
    await closeOnboarding( );
    /*
    / 1. Sign in
    */
    const username = await signIn( );

    // Switch to list view as well
    const listToggle = element( by.id( "SegmentedButton.list" ) );
    await waitFor( listToggle ).toBeVisible( ).withTimeout( TIMEOUT );
    await listToggle.tap();

    /*
    / 2. Create two observations without evidence
    */
    const uuid = await createAndUploadObservation( { upload: true } );
    // Create a second b/c later we want to test that the deleted status text
    // is visible in the toolbar, and the toolbar will disappear if there are
    // zero observations
    await createAndUploadObservation( );

    /*
    / 3. Update the observation by adding a comment
    */
    const obsListItem = element( by.id( `MyObservations.obsListItem.${uuid}` ) );
    await obsListItem.tap();
    const commentButton = element( by.id( "ObsDetail.commentButton" ) );
    await waitFor( commentButton ).toBeVisible().withTimeout( TIMEOUT );
    await commentButton.tap();
    // Check that the comment modal is visible
    const commentModalInput = element( by.id( "TextInputSheet.notes" ) );
    await waitFor( commentModalInput ).toBeVisible().withTimeout( TIMEOUT );
    // Add a comment
    await commentModalInput.tap();
    await commentModalInput.typeText( "This is a comment" );
    // Tap on the title of the modal to dismiss the keyboard
    const bottomSheetHeader = element( by.id( "bottom-sheet-header" ) );
    await bottomSheetHeader.tap();
    // Tap the submit button
    const commentModalSubmitButton = element( by.id( "TextInputSheet.confirm" ) );
    await commentModalSubmitButton.tap();
    // Check that the comment is visible
    await element( by.id( `ObsDetails.${uuid}` ) ).scrollTo( "bottom" );
    const comment = element( by.text( "This is a comment" ) );
    await waitFor( comment ).toBeVisible().withTimeout( TIMEOUT );
    await element( by.id( "header-back-button" ) ).tap( );
    await waitFor( username ).toBeVisible( ).withTimeout( TIMEOUT );

    /*
    / 4. Delete the two observations without evidence
    */
    await deleteObservationByUUID( uuid, username );
    // It would be nice to test for the "1 observation deleted" status text in
    // the toolbar, but that message appears ephemerally and sometimes this
    // test doesn't pick it up on the Github runner. Since we created two
    // observations, the upload prompt will be the stable status text at this
    // point, and we can confirm deletion by testing for the absence of the
    // list item for the observation we deleted.
    await waitFor( element( by.text( /Upload 1 observation/ ) ) ).toBeVisible( ).withTimeout( 20_000 );

    // the timing of syncing deletions seems to be different in the actual app versus these
    // e2e tests, so deleting an observation here still shows the observation
    // in the list unless this delay( ) is added
    await delay( 10000 );
    await expect( obsListItem ).toBeNotVisible( );
  } );
} );
