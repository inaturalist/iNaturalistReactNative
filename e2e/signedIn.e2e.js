import {
  by, device, element, expect, waitFor
} from "detox";

// This needs to be a relative path for the e2e-mock version to be used
import { CHUCKS_PAD } from "../src/appConstants/e2e";
import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import signIn from "./sharedFlows/signIn";
import switchPowerMode from "./sharedFlows/switchPowerMode";

describe( "Signed in user", () => {
  beforeAll( async ( ) => iNatE2eBeforeAll( device ) );
  beforeEach( async ( ) => iNatE2eBeforeEach( device ) );

  async function createAndUploadObservation( options = { upload: false } ) {
    const addObsButton = element( by.id( "add-obs-button" ) );
    await waitFor( addObsButton ).toBeVisible().withTimeout( 10000 );
    await addObsButton.tap();
    await expect( element( by.id( "identify-text" ) ) ).toBeVisible();
    // Observe without evidence
    const obsWithoutEvidenceButton = element(
      by.id( "observe-without-evidence-button" )
    );
    await expect( obsWithoutEvidenceButton ).toBeVisible();
    await obsWithoutEvidenceButton.tap();
    // Check that the new observation screen is visible
    await waitFor( element( by.id( "new-observation-text" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    // Ensure the location from the e2e-mock is being used so we don't end up
    // with tests flaking out due to time zone issues
    const pattern = new RegExp( `.*${CHUCKS_PAD.latitude.toFixed( 4 )}.*` );
    await waitFor( element( by.text( pattern ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    if ( options.upload ) {
      // Press Upload now button
      const uploadNowButton = element( by.id( "ObsEdit.uploadButton" ) );
      await expect( uploadNowButton ).toBeVisible();
      await uploadNowButton.tap();
    } else {
      // Press Save button
      const saveButton = element( by.id( "ObsEdit.saveButton" ) );
      await expect( saveButton ).toBeVisible();
      await saveButton.tap();
    }

    // Check that the comments count component for the obs we just created is
    // visible. Since it just saved and there's an animation the runs before
    // this component becomes visible, and there may be other observations in
    // the list, we need to wait for the right CommentsCount component to be
    // visible
    const obsListItem = element( by.id( /MyObservations\.obsListItem\..*/ ) ).atIndex( 0 );
    const obsListItemAttributes = await obsListItem.getAttributes( );
    const uuid = obsListItemAttributes.elements
      ? obsListItemAttributes.elements[0].identifier.split( "." ).pop( )
      : obsListItemAttributes.identifier.split( "." ).pop( );

    if ( options.upload ) {
      const commentCount = element(
        by.id( "ObsStatus.commentsCount" )
          .withAncestor( by.id( `MyObservations.obsListItem.${uuid}` ) )
      );
      await waitFor( commentCount ).toBeVisible().withTimeout( 10000 );
    }

    return uuid;
  }

  async function deleteObservationByUUID( uuid, username, options = { uploaded: false } ) {
    const obsListItem = element( by.id( `MyObservations.obsListItem.${uuid}` ) );
    await obsListItem.tap();
    if ( options.uploaded ) {
      const editButton = element( by.id( "ObsDetail.editButton" ) );
      await waitFor( editButton ).toBeVisible().withTimeout( 10000 );
      // Navigate to the edit screen
      await editButton.tap();
    }
    // Check that the edit screen is visible
    await waitFor( element( by.text( "EVIDENCE" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    // Press header kebab menu
    const headerKebabMenu = element( by.id( "KebabMenu.Button" ) );
    await expect( headerKebabMenu ).toBeVisible();
    await headerKebabMenu.tap();
    // Press delete observation
    const deleteObservation = element( by.id( "Header.delete-observation" ) );
    await waitFor( deleteObservation ).toBeVisible().withTimeout( 10000 );
    await deleteObservation.tap();
    // Check that the delete button is visible
    const deleteObservationButton = element( by.text( "DELETE" ) );
    await waitFor( deleteObservationButton ).toBeVisible().withTimeout( 10000 );
    // Press delete observation
    await deleteObservationButton.tap();
    // Make sure we're back on MyObservations
    await waitFor( username ).toBeVisible().withTimeout( 10000 );
  }

  it( "should create an observation, add a comment, and delete the observation", async () => {
    /*
    / 1. Sign in
    */
    const username = await signIn( );

    /*
    / 2. Switch UI to power user mode
    */
    await switchPowerMode( );

    /*
    / 3. Create two observations without evidence
    */
    const uuid = await createAndUploadObservation( { upload: true } );
    // Create a second b/c later we want to test that the deleted status text
    // is visible in the toolbar, and the toolbar will disappear if there are
    // zero observations
    await createAndUploadObservation( );

    /*
    / 4. Update the observation by adding a comment
    */
    const obsListItem = element( by.id( `MyObservations.obsListItem.${uuid}` ) );
    await obsListItem.tap();
    const commentButton = element( by.id( "ObsDetail.commentButton" ) );
    await waitFor( commentButton ).toBeVisible().withTimeout( 10000 );
    await commentButton.tap();
    // Check that the comment modal is visible
    const commentModalInput = element( by.id( "TextInputSheet.notes" ) );
    await waitFor( commentModalInput ).toBeVisible().withTimeout( 10000 );
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
    await waitFor( comment ).toBeVisible().withTimeout( 10000 );
    await element( by.id( "ObsDetails.BackButton" ) ).tap( );
    await waitFor( username ).toBeVisible( ).withTimeout( 10000 );

    /*
    / 5. Delete the two observations without evidence
    */
    await deleteObservationByUUID( uuid, username, { uploaded: true } );
    // It would be nice to test for the "1 observation deleted" status text in
    // the toolbar, but that message appears ephemerally and sometimes this
    // test doesn't pick it up on the Github runner. Since we created two
    // observations, the upload prompt will be the stable status text at this
    // point, and we can confirm deletion by testing for the absence of the
    // list item for the observation we deleted.
    await waitFor( element( by.text( /Upload 1 observation/ ) ) ).toBeVisible( ).withTimeout( 20_000 );
    await expect( obsListItem ).toBeNotVisible( );
  } );
} );
