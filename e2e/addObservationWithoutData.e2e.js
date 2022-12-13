import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";

describe( "Add observation without evidence", () => {
  beforeAll( async () => {
    await device.launchApp( { permissions: { location: "always" } } );
  } );

  beforeEach( async () => {
    await device.reloadReactNative();
  } );

  it( "should open app with the observation list screen", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-text" ) );
    await waitFor( loginText ).toBeVisible().withTimeout( 2000 );
    await expect( loginText ).toBeVisible();
  } );

  it( "should navigate to observation add screen on add evidence button pressed", async () => {
    await waitFor( element( by.id( "camera-options-button" ) ) )
      .toBeVisible()
      .withTimeout( 2000 );
    await element( by.id( "camera-options-button" ) ).tap();
    await expect( element( by.id( "evidence-text" ) ) ).toBeVisible();
    await expect(
      element( by.id( "camera-options-button-square-edit-outline" ) )
    ).toBeVisible();
    await element( by.id( "camera-options-button-square-edit-outline" ) ).tap();
    await expect( element( by.id( "new-observation-text" ) ) ).toBeVisible();
  } );
} );
