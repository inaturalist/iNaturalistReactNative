import {
  by, device, element, expect, waitFor
} from "detox";
import Config from "react-native-config-node";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

describe( "AICamera", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it( "should work", async () => {
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

    const taxonResult = element( by.id( "AICamera.taxa.51779" ) );
    await waitFor( taxonResult ).toBeVisible().withTimeout( 10000 );

    const takePhotoButton = element( by.id( "take-photo-button" ) );
    await waitFor( takePhotoButton ).toBeVisible().withTimeout( 10000 );
    await takePhotoButton.tap();
  } );
} );
