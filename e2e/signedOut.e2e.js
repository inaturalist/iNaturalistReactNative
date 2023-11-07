import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

describe( "Signed out user", () => {
  beforeAll( async ( ) => iNatE2eBeforeAll( device ) );
  beforeEach( async ( ) => iNatE2eBeforeEach( device ) );

  it( "should start at My Observations with log in text", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
    await waitFor( loginText ).toBeVisible( ).withTimeout( 10000 );
    await expect( loginText ).toBeVisible( );
  } );

  it( "should add an observation without evidence", async () => {
    const addObsButton = element( by.id( "add-obs-button" ) );
    await waitFor( addObsButton ).toBeVisible().withTimeout( 10000 );
    await addObsButton.tap();
    await expect( element( by.id( "evidence-text" ) ) ).toBeVisible();
    const obsWithoutEvidenceButton = element(
      by.id( "observe-without-evidence-button" )
    );
    await expect( obsWithoutEvidenceButton ).toBeVisible();
    await obsWithoutEvidenceButton.tap();

    /*
    / 2.Insert.: On iOS setting location permission is currently not working
    / react-native-vision-camera >v3.4 only compiles with XCode >15
    / AppleSimUtils v0.9.10 used to set the location permission (other permissions afre fine)
    / does not work on a Simulator with XCode15 + iOS17, so in order for this test to pass we
    / disable usage of a location for now.
    */
    if ( device.getPlatform() === "ios" ) {
      // Permission gate modal, press close icon to exit
      const closePermissionGate = element( by.id( "close-permission-gate" ) );
      await waitFor( closePermissionGate ).toBeVisible().withTimeout( 10000 );
      await closePermissionGate.tap();
    }

    await waitFor( element( by.id( "new-observation-text" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
  } );
} );
