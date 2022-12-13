import "i18n";

import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";
import { t } from "i18next";

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
    const buttonLabel = t( "Show-new-observation-options" );
    await waitFor( element( by.label( buttonLabel ) ) )
      .toBeVisible()
      .withTimeout( 2000 );
    await element( by.label( buttonLabel ) ).tap( );
    await expect( element( by.id( "evidence-text" ) ) ).toBeVisible();
    await expect(
      element( by.id( "camera-options-button-square-edit-outline" ) )
    ).toBeVisible();
    await element( by.id( "camera-options-button-square-edit-outline" ) ).tap();
    await expect( element( by.id( "new-observation-text" ) ) ).toBeVisible();
  } );
} );
