import {
  by, device, element, waitFor
} from "detox";

describe( "Using the UiLibrary", () => {
  beforeAll( async () => {
    await device.launchApp( {
      newInstance: true,
      permissions: { location: "always" }
    } );
  } );

  beforeEach( async () => {
    // device.launchApp is preferred for an app of our complexity. It does work locally for both,
    // but on CI for Android it does not work. So we use reloadReactNative for Android.
    if ( device.getPlatform() === "android" ) {
      await device.reloadReactNative();
    } else {
      await device.launchApp( {
        newInstance: true,
        permissions: { location: "always" }
      } );
    }
  } );

  it( "should walk through the UiLibrary interacting with every element type", async () => {
    // Wait for the initial screen to load
    await waitFor( element( by.id( "footer-menu-button" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "footer-menu-button" ) ).tap();

    // Navigate to UI Library screen
    await waitFor( element( by.id( "drawer-item-ui-library" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "drawer-item-ui-library" ) ).tap();

    // Tap the buttons
    await waitFor( element( by.id( "ui-button-1" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-button-1" ) ).tap();

    await waitFor( element( by.id( "ui-button-2" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-button-2" ) ).tap();

    await waitFor( element( by.id( "ui-button-3" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-button-3" ) ).tap();

    await waitFor( element( by.id( "ui-button-4" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-button-4" ) ).tap();

    await waitFor( element( by.id( "ui-button-5" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-button-5" ) ).tap();

    await waitFor( element( by.id( "ui-button-6" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-button-6" ) ).tap();
    // Dismiss the alert
    await element(
      by.label( "OK" ).and( by.type( "_UIAlertControllerActionView" ) )
    ).tap();

    // Tap the AddObsButton
    // await waitFor( element( by.id( "camera-options-button" ) ) )
    //   .toBeVisible()
    //   .withTimeout( 10000 );
    // await element( by.id( "camera-options-button" ) ).tap();

    // Tap the evidence buttons
    await waitFor( element( by.id( "ui-evidence-button-1" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-evidence-button-1" ) ).tap();

    await waitFor( element( by.id( "ui-evidence-button-2" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-evidence-button-2" ) ).tap();

    await waitFor( element( by.id( "ui-evidence-button-3" ) ) )
      .toBeVisible()
      .withTimeout( 10000 );
    await element( by.id( "ui-evidence-button-3" ) ).tap();

    // await element( by.id( "ui-scroll" ) ).scroll( 200, "down" );

    // // Tap the secondary cta buttons
    // await waitFor( element( by.id( "ui-secondary-cta-button-1" ) ) )
    //   .toBeVisible()
    //   .withTimeout( 10000 );
    // await element( by.id( "ui-secondary-cta-button-1" ) ).tap();

    // await waitFor( element( by.id( "ui-secondary-cta-button-2" ) ) )
    //   .toBeVisible()
    //   .withTimeout( 10000 );
    // await element( by.id( "ui-secondary-cta-button-2" ) ).tap();
  } );
} );
