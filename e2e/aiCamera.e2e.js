import {
  by, device, element, waitFor
} from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import closeOnboarding from "./sharedFlows/closeOnboarding";
import deleteObservation from "./sharedFlows/deleteObservation";
import signIn from "./sharedFlows/signIn";
import switchPowerMode from "./sharedFlows/switchPowerMode";
import uploadObservation from "./sharedFlows/uploadObservation";

describe( "AICamera", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it(
    "should open the ai camera, take photo, select a suggestion, upload and delete observation",
    async () => {
      await closeOnboarding( );
      /*
      / 1. Sign in
      */
      const username = await signIn();

      /*
      / 2. Switch UI to power user mode
      */
      await switchPowerMode();

      /*
      / 3. Take photo with AI Camera, select a suggestion, upload and delete observation
      */
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

      await uploadObservation( { upload: true } );

      // Check that the display taxon name is visible
      const displayTaxonName = element( by.id( `display-taxon-name.${taxonID}` ) ).atIndex(
        0
      );
      await waitFor( displayTaxonName ).toBeVisible().withTimeout( 10000 );
      await displayTaxonName.tap();

      // Delete the observation
      await deleteObservation( { uploaded: true } );

      // Make sure we're back on MyObservations
      await waitFor( username ).toBeVisible().withTimeout( 10000 );
    }
  );
} );
