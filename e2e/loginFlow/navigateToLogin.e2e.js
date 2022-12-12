import {
  by, device, element, expect, waitFor
} from "detox";

describe( "Log in to use iNaturalist", () => {
  beforeAll( async () => {
    await device.launchApp( { permissions: { location: "always" } } );
  } );

  beforeEach( async () => {
    await device.reloadReactNative();
  } );

  it( "should navigate to login screen", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-text" ) );
    await waitFor( loginText ).toBeVisible().withTimeout( 2000 );

    await loginText.tap();

    const loginUseText = element( by.id( "login-header" ) );
    await expect( loginUseText ).toBeVisible();
  } );
} );
