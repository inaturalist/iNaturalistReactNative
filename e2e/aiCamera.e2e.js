import {
  by, device, element, waitFor,
} from "detox";

import { iNatE2eAfterEach, iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import closeOnboarding from "./sharedFlows/closeOnboarding";
import signIn from "./sharedFlows/signIn";
import uploadObservation from "./sharedFlows/uploadObservation";

const TIMEOUT = 10_000;

describe( "AICamera", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );
  afterEach( async () => iNatE2eAfterEach( device ) );

  it(
    "should open the ai camera, take photo, select a suggestion, upload and delete observation",
    async () => {
      await closeOnboarding( );
      /*
      / 1. Sign in
      */
      await signIn();

      /*
      / 2. Take photo with AI Camera, select a suggestion, upload and delete observation
      */
      // Tap to open AICamera
      const addObsButton = element( by.id( "add-obs-button" ) );
      await waitFor( addObsButton ).toBeVisible().withTimeout( TIMEOUT );
      await addObsButton.tap();
      const aiCameraButton = element( by.id( "aicamera-button" ) );
      await waitFor( aiCameraButton ).toBeVisible().withTimeout( TIMEOUT );
      await aiCameraButton.tap();

      // The camera and suggestions screens have continuously running animations that
      // prevent Detox's AnimatedModuleIdlingResource from settling. Disable sync for
      // the entire camera → photo → suggestions → taxon detail flow.
      await device.disableSynchronization();

      // Check that the mocked cv suggestion is visible
      const taxonResult = element( by.id( "AICamera.taxa.51779" ) );
      await waitFor( taxonResult ).toBeVisible().withTimeout( TIMEOUT );
      // Tap the take photo button
      const takePhotoButton = element( by.id( "take-photo-button" ) );
      await waitFor( takePhotoButton ).toBeVisible().withTimeout( TIMEOUT );
      await takePhotoButton.tap();

      // On suggestions find the first element in the suggestions list
      const otherSuggestionsTitle = element( by.text( "OTHER SUGGESTIONS" ) );
      await waitFor( otherSuggestionsTitle ).toBeVisible( ).withTimeout( 30_000 );
      // Use anchored regex so we match the suggestion row container
      // (e.g. "SuggestionsList.taxa.51779") but NOT child elements like
      // "SuggestionsList.taxa.51779.checkmark".
      const firstSuggestion = element( by.id( /SuggestionsList\.taxa\.\d+$/ ) ).atIndex(
        0,
      );
      await waitFor( firstSuggestion ).toBeVisible().withTimeout( TIMEOUT );
      const suggestionAttributes = await firstSuggestion.getAttributes();
      const taxonID = suggestionAttributes.elements
        ? suggestionAttributes.elements[0].identifier.split( "." ).pop()
        : suggestionAttributes.identifier.split( "." ).pop();

      // Tap the checkmark button directly — it has a known testID and is a
      // genuine pressable, avoiding issues where tapping the outer container
      // View by coordinate offset doesn't propagate to child Pressables on
      // Android API 36 with New Architecture.
      const firstSuggestionCheckmark = element(
        by.id( /SuggestionsList\.taxa\.\d+\.checkmark$/ ),
      ).atIndex( 0 );
      await waitFor( firstSuggestionCheckmark ).toBeVisible().withTimeout( TIMEOUT );
      await firstSuggestionCheckmark.tap();

      await device.enableSynchronization();

      await uploadObservation( { upload: true } );

      // Check that the display taxon name is visible
      const displayTaxonName = element( by.id( `display-taxon-name.${taxonID}` ) ).atIndex(
        0,
      );
      await waitFor( displayTaxonName ).toBeVisible().withTimeout( TIMEOUT );
    },
  );
} );
