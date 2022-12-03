import {
  by,
  device,
  element,
  expect
} from "detox";

describe( "Add observation without evidence", () => {
  beforeAll( async () => {
    await device.launchApp( { permissions: { location: "always" } } );
  } );

  beforeEach( async () => {
    await device.reloadReactNative();
  } );

  it( "should have observation list screen", async () => {
    await expect( element( by.text( "Log in to iNaturalist" ) ) ).toBeVisible();
  } );

  it( "should navigate to observation add screen on add evidence button pressed", async () => {
    await expect( element( by.text( "Log in to iNaturalist" ) ) ).toBeVisible();
    await element( by.id( "camera-options-button" ) ).tap();
    await expect( element( by.text( "Evidence" ) ) ).toBeVisible();
    await expect(
      element( by.id( "camera-options-button-square-edit-outline" ) )
    ).toBeVisible();
    await element( by.id( "camera-options-button-square-edit-outline" ) ).tap();
    await expect( element( by.text( "New Observation" ) ) ).toBeVisible();
  } );
} );
