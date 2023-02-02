import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";

describe( "Add observation without evidence", () => {
  beforeAll( async () => {
    await device.launchApp( {
      newInstance: true,
      permissions: { location: "always" }
    } );
  } );

  beforeEach( async () => {
    // device.launchApp is preferred for an app of our complexity. It does work locally for both,
    // but on CI for Android it does not work. So we use reloadReactNative for Android.
    if ( device.getPlatform( ) === "android" ) {
      await device.reloadReactNative( );
    } else {
      await device.launchApp( {
        newInstance: true,
        permissions: { location: "always" }
      } );
    }
  } );

  it( "should open app with the observation list screen", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-text" ) );
    await waitFor( loginText ).toBeVisible( ).withTimeout( 10000 );
    await expect( loginText ).toBeVisible( );
  } );

  it( "should navigate to observation add screen on add evidence button pressed", async () => {
    const addObsButton = element( by.id( "add-obs-button" ) );
    await waitFor( addObsButton ).toBeVisible( ).withTimeout( 10000 );
    await addObsButton.tap( );
    await expect( element( by.id( "evidence-text" ) ) ).toBeVisible( );
    const obsWithoutEvidenceButton = element( by.id( "observe-without-evidence-button" ) );
    await expect( obsWithoutEvidenceButton ).toBeVisible( );
    await obsWithoutEvidenceButton.tap( );
    await waitFor( element( by.id( "new-observation-text" ) ) ).toBeVisible( ).withTimeout( 10000 );
  } );
} );
