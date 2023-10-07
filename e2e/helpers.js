export async function iNatE2eBeforeAll( device ) {
  if ( device.getPlatform() === "android" ) {
    await device.launchApp( {
      newInstance: true,
      permissions: { location: "always" }
    } );
  }
}

export async function iNatE2eBeforeEach( device ) {
  // device.launchApp would be preferred for an app of our complexity. It does work locally
  // for both, but on CI for Android it does not work. So we use reloadReactNative for Android.
  if ( device.getPlatform() === "android" ) {
    await device.reloadReactNative();
  } else {
    await device.launchApp( {
      newInstance: true,
      permissions: { location: "always" }
    } );
  }
}
