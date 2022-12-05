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
    const loginText = element( by.text( "Log in to iNaturalist" ) );
    await waitFor( loginText ).toBeVisible().withTimeout( 2000 );
    await expect( loginText ).toBeVisible();
  } );

  it( "should navigate to observation add screen on add evidence button pressed", async () => {
    await waitFor( element( by.text( "Log in to iNaturalist" ) ) )
      .toBeVisible()
      .withTimeout( 2000 );
    await element( by.id( "camera-options-button" ) ).tap();
    await expect( element( by.text( "Evidence" ) ) ).toBeVisible();
    await expect(
      element( by.id( "camera-options-button-square-edit-outline" ) )
    ).toBeVisible();
    await element( by.id( "camera-options-button-square-edit-outline" ) ).tap();
    await expect( element( by.text( "New Observation" ) ) ).toBeVisible();
  } );
} );
