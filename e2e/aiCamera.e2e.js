import {
  by, device, element, expect, waitFor
} from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

describe( "AICamera", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it( "should work", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
    await waitFor( loginText ).toBeVisible().withTimeout( 10000 );
    await expect( loginText ).toBeVisible();

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

    // Open AICamera
    const addObsButton = element( by.id( "add-obs-button" ) );
    await waitFor( addObsButton ).toBeVisible().withTimeout( 10000 );
    await addObsButton.tap();
    const arCameraButton = element( by.id( "arcamera-button" ) );
    await waitFor( arCameraButton ).toBeVisible().withTimeout( 10000 );
    await arCameraButton.tap();

    // Take a photo with the camera
    const cameraContainer = element( by.id( "CameraWithDevice" ) );
    await waitFor( cameraContainer ).toBeVisible().withTimeout( 10000 );
    const loadingText = element(
      by.text( "Loading iNaturalist's AI Camera" )
    );
    await waitFor( loadingText ).toBeVisible().withTimeout( 10000 );
    const scanText = element(
      by.text( "Scan the area around you for organisms." )
    );
    await waitFor( scanText ).toBeVisible().withTimeout( 10000 );
    const takePhotoButton = element( by.id( "take-photo-button" ) );
    await waitFor( takePhotoButton ).toBeVisible().withTimeout( 10000 );
    await takePhotoButton.tap();
  } );
} );
