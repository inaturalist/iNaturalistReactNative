import {
  by, element, expect, waitFor
} from "detox";

// This needs to be a relative path for the e2e-mock version to be used
import { CHUCKS_PAD } from "../../src/appConstants/e2e";

const TIMEOUT = 10_000;

// Upload or save an observation
export default async function uploadObservation( options = { upload: false } ) {
  // Start this on ObsEdit
  // Check that the new observation screen is visible
  const newObservationText = element( by.id( "new-observation-text" ) );
  await waitFor( newObservationText ).toBeVisible().withTimeout( TIMEOUT );
  // Ensure the location from the e2e-mock is being used so we don't end up
  // with tests flaking out due to time zone issues
  const pattern = new RegExp( `.*${CHUCKS_PAD.latitude.toFixed( 4 )}.*` );
  const locationText = element( by.text( pattern ) );
  await waitFor( locationText ).toBeVisible().withTimeout( TIMEOUT );
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
}
