import {
  by, device, element, expect, waitFor
} from "detox";
import Config from "react-native-config-node";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

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
    const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
    // 10000 timeout is for github actions, which was failing with a
    // shorter timeout period
    await waitFor( loginText ).toBeVisible().withTimeout( 10000 );
    await expect( loginText ).toBeVisible();
    await element( by.id( "log-in-to-iNaturalist-button.text" ) ).tap();
    const usernameInput = element( by.id( "Login.email" ) );
    await waitFor( usernameInput ).toBeVisible().withTimeout( 10000 );
    await expect( usernameInput ).toBeVisible();
    await element( by.id( "Login.email" ) ).tap();
    await element( by.id( "Login.email" ) ).typeText( Config.E2E_TEST_USERNAME );
    const passwordInput = element( by.id( "Login.password" ) );
    await expect( passwordInput ).toBeVisible();
    await element( by.id( "Login.password" ) ).tap();
    await element( by.id( "Login.password" ) ).typeText( Config.E2E_TEST_PASSWORD );
    const loginButton = element( by.id( "Login.loginButton" ) );
    await expect( loginButton ).toBeVisible();
    await element( by.id( "Login.loginButton" ) ).tap();
    const username = element( by.text( `@${Config.E2E_TEST_USERNAME}` ) ).atIndex(
      1
    );
    await waitFor( username ).toBeVisible().withTimeout( 10000 );
    await expect( username ).toBeVisible();

    /*
    / 2. Switch UI to power user mode
    */
    const drawerButton = element( by.id( "OPEN_DRAWER" ) );
    await waitFor( drawerButton ).toBeVisible().withTimeout( 10000 );
    await drawerButton.tap();
    // Tap the settings drawer menu item
    const settingsDrawerMenuItem = element( by.id( "settings" ) );
    await waitFor( settingsDrawerMenuItem ).toBeVisible().withTimeout( 10000 );
    await settingsDrawerMenuItem.tap();
    // Tap the settings radio button for power user mode
    const powerUserRadioButton = element( by.id( "all-observation-option" ) );
    await waitFor( powerUserRadioButton ).toBeVisible().withTimeout( 10000 );
    await powerUserRadioButton.tap();

    /*
    / 3. Create two observations
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
    const commentModalInput = element( by.id( "ObsEdit.notes" ) );
    await waitFor( commentModalInput ).toBeVisible().withTimeout( 10000 );
    // Add a comment
    await commentModalInput.tap();
    await commentModalInput.typeText( "This is a comment" );
    // Tap on the title of the modal to dismiss the keyboard
    const bottomSheetHeader = element( by.id( "bottom-sheet-header" ) );
    await bottomSheetHeader.tap();
    // Tap the submit button
    const commentModalSubmitButton = element( by.id( "ObsEdit.confirm" ) );
    await commentModalSubmitButton.tap();
    // Check that the comment is visible
    await element( by.id( `ObsDetails.${uuid}` ) ).scrollTo( "bottom" );
    const comment = element( by.text( "This is a comment" ) );
    await waitFor( comment ).toBeVisible().withTimeout( 10000 );
    await element( by.label( "Go back" ) ).tap( );
    await waitFor( username ).toBeVisible( ).withTimeout( 10000 );

    /*
    / 5. Delete the observations
    */
    await deleteObservationByUUID( uuid, username, { uploaded: true } );
    // TODO test to make sure the exact observation we created was deleted.
    // Testing for the empty list UI isn't adequate because other test runs
    // happening in parallel might cause other observations to be there
    const deletedObservationText = element( by.text( /1 observation deleted/ ) );
    await waitFor( deletedObservationText ).toBeVisible().withTimeout( 10000 );
  } );
} );
