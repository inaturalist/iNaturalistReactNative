import { execSync } from "child_process";

const detox = require( "detox" );

export async function iNatE2eBeforeAll( device ) {
  if ( device.getPlatform() === "android" ) {
    await device.launchApp( {
      newInstance: true,
      permissions: {
        location: "always",
        camera: "YES",
        medialibrary: "YES",
        photos: "YES"
      }
    } );
  }
}

export async function iNatE2eBeforeEach( device ) {
  // device.launchApp would be preferred for an app of our complexity. It does work locally
  // for both, but on CI for Android it does not work. So we use reloadReactNative for Android.
  if ( device.getPlatform() === "android" ) {
    await device.reloadReactNative();
    return;
  }
  const launchAppOptions = {
    newInstance: true,
    permissions: {
      location: "always",
      camera: "YES",
      medialibrary: "YES",
      photos: "YES"
    }
  };
  try {
    await device.launchApp( launchAppOptions );
  } catch ( launchAppError ) {
    if ( !launchAppError.message.match( /unexpectedly disconnected/ ) ) {
      throw launchAppError;
    }
    // Try it one more time
    await device.launchApp( launchAppOptions );
  }
  // disable password autofill
  execSync(
    // eslint-disable-next-line max-len
    `plutil -replace restrictedBool.allowPasswordAutoFill.value -bool NO ~/Library/Developer/CoreSimulator/Devices/${device.id}/data/Containers/Shared/SystemGroup/systemgroup.com.apple.configurationprofiles/Library/ConfigurationProfiles/UserSettings.plist`
  );
  execSync(
    // eslint-disable-next-line max-len
    `plutil -replace restrictedBool.allowPasswordAutoFill.value -bool NO ~/Library/Developer/CoreSimulator/Devices/${device.id}/data/Library/UserConfigurationProfiles/EffectiveUserSettings.plist`
  );
  execSync(
    // eslint-disable-next-line max-len
    `plutil -replace restrictedBool.allowPasswordAutoFill.value -bool NO ~/Library/Developer/CoreSimulator/Devices/${device.id}/data/Library/UserConfigurationProfiles/PublicInfo/PublicEffectiveUserSettings.plist`
  );
}

export function terminateApp( deviceId, bundleId ) {
  try {
    console.log( `Attempting to terminate ${bundleId} on device ${deviceId}...` );
    const result = execSync( `/usr/bin/xcrun simctl terminate ${deviceId} ${bundleId}` );
    console.log( "App terminated successfully." );
    console.log( result.toString() );
  } catch ( error ) {
    if ( error.stderr && error.stderr.toString().includes( "found nothing to terminate" ) ) {
      console.log( "App is not running, nothing to terminate." );
    } else {
      console.error( "Error during app termination:", error.message );
      throw error;
    }
  }
}

export async function iNatE2eAfterEach( ) {
  const { device } = detox;

  if ( !device ) {
    console.log( "Device is undefined, skipping app termination" );
    return;
  }

  // Only try to get deviceId for iOS
  if ( device.getPlatform && await device.getPlatform() === "ios" ) {
    try {
      const deviceId = await device.deviceId;
      const bundleId = "org.inaturalist.iNaturalistMobile";

      if ( deviceId && bundleId ) {
        terminateApp( deviceId, bundleId );
      }
    } catch ( error ) {
      console.log( "Could not get device ID:", error.message );
    }
  }
}
