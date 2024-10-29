import {
  by, device, element, expect, waitFor
} from "detox";
import Config from "react-native-config-node";

import { CHUCKS_PAD } from "../src/appConstants/e2e";
import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

describe( "AICamera", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it(
    "should open the ai camera, take photo, select a suggestion, upload and delete observation",
    async () => {
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

      // Tap to open AICamera
      const addObsButton = element( by.id( "add-obs-button" ) );
      await waitFor( addObsButton ).toBeVisible().withTimeout( 10000 );
      await addObsButton.tap();
      const aiCameraButton = element( by.id( "aicamera-button" ) );
      await waitFor( aiCameraButton ).toBeVisible().withTimeout( 10000 );
      await aiCameraButton.tap();

      // Check that the camera screen is visible
      const cameraContainer = element( by.id( "CameraWithDevice" ) );
      await waitFor( cameraContainer ).toBeVisible().withTimeout( 10000 );
      // Check that the mocked cv suggestion is visible
      const taxonResult = element( by.id( "AICamera.taxa.51779" ) );
      await waitFor( taxonResult ).toBeVisible().withTimeout( 10000 );
      // Tap the take photo button
      const takePhotoButton = element( by.id( "take-photo-button" ) );
      await waitFor( takePhotoButton ).toBeVisible().withTimeout( 10000 );
      await takePhotoButton.tap();
      // On suggestions find the first element in the suggestions list
      const firstSuggestion = element( by.id( /SuggestionsList\.taxa\..*/ ) ).atIndex(
        0
      );
      await waitFor( firstSuggestion ).toBeVisible().withTimeout( 10000 );
      const suggestionAttributes = await firstSuggestion.getAttributes();
      const taxonID = suggestionAttributes.elements
        ? suggestionAttributes.elements[0].identifier.split( "." ).pop()
        : suggestionAttributes.identifier.split( "." ).pop();
      await firstSuggestion.tap();
      // On Taxon Detail
      const selectTaxonButon = element( by.id( "TaxonDetails.SelectButton" ) );
      await waitFor( selectTaxonButon ).toBeVisible().withTimeout( 10000 );
      await selectTaxonButon.tap();
      // On ObsEdit
      // Check that the new observation screen is visible
      const newObservationText = element( by.id( "new-observation-text" ) );
      await waitFor( newObservationText ).toBeVisible().withTimeout( 10000 );
      // Ensure the location from the e2e-mock is being used so we don't end up
      // with tests flaking out due to time zone issues
      const pattern = new RegExp( `.*${CHUCKS_PAD.latitude.toFixed( 4 )}.*` );
      const locationText = element( by.text( pattern ) );
      await waitFor( locationText ).toBeVisible().withTimeout( 10000 );
      // Press Upload now button
      const uploadNowButton = element( by.id( "ObsEdit.uploadButton" ) );
      await expect( uploadNowButton ).toBeVisible();
      await uploadNowButton.tap();
      // Check that the display taxon name is visible
      const displayTaxonName = element( by.id( `display-taxon-name.${taxonID}` ) ).atIndex(
        0
      );
      await waitFor( displayTaxonName ).toBeVisible().withTimeout( 10000 );
      await displayTaxonName.tap();

      // Navigate to the edit screen
      const editButton = element( by.id( "ObsDetail.editButton" ) );
      await waitFor( editButton ).toBeVisible().withTimeout( 10000 );
      await editButton.tap();
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
  );
} );
