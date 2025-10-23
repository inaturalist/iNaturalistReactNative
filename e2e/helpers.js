import { exec, execSync } from "child_process";

import resetUserForTesting from "./sharedFlows/resetUserForTesting";

export async function iNatE2eBeforeAll( device ) {
  await resetUserForTesting();

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

function execPromise( command ) {
  return new Promise( ( resolve, reject ) => {
    exec( command, ( error, stdout, stderr ) => {
      if ( error ) {
        console.log( `Error executing command: ${command}` );
        console.log( `stderr: ${stderr}` );
        reject( error );
        return;
      }
      resolve( stdout );
    } );
  } );
}

async function getSimulatorId() {
  try {
    // List all available simulators
    const output = await execPromise( "xcrun simctl list devices --json" );
    const { devices } = JSON.parse( output );

    // Use Object.values and Array.find instead of loops
    const bootedDevice = Object.entries( devices )
      .flatMap( ( [_runtime, deviceList] ) => deviceList ) // Use _ prefix for unused variables
      .find( device => device.state === "Booted" );

    if ( bootedDevice ) {
      console.log( `Found booted simulator: ${bootedDevice.name} (${bootedDevice.udid})` );
      return bootedDevice.udid;
    }

    console.log( "No booted simulator found" );
    return null;
  } catch ( error ) {
    console.log( "Error getting simulator ID:", error.message );
    return null;
  }
}

export function terminateApp( deviceId, bundleId ) {
  try {
    console.log( `Attempting to terminate ${bundleId} on device ${deviceId}...` );
    const result = execSync( `/usr/bin/xcrun simctl terminate ${deviceId} ${bundleId}` );
    console.log( "App terminated successfully", result.toString() );
    return true;
  } catch ( error ) {
    if ( error.stderr && error.stderr.toString().includes( "found nothing to terminate" ) ) {
      console.log( "App is not running, nothing to terminate." );
      return true;
    }
    console.error( "Error during app termination:", error.message );
    return false;
  }
}

export async function iNatE2eAfterEach( device ) {
  await resetUserForTesting();

  if ( device && device.getPlatform() === "android" ) {
    return;
  }

  try {
    // Try to use device.terminateApp first (the built-in Detox method)
    if ( device ) {
      try {
        await device.terminateApp();
        console.log( "App terminated through Detox" );
        // Add a small delay to let Detox processes settle
        await new Promise( resolve => { setTimeout( resolve, 300 ); } );
        return;
      } catch ( detoxError ) {
        console.log(
          "Detox terminateApp failed, falling back to manual termination:",
          detoxError.message
        );
      }
    }

    // Fall back to manual termination if Detox method fails or device is unavailable
    const deviceId = await getSimulatorId();
    const bundleId = "org.inaturalist.iNaturalistMobile";

    if ( deviceId && bundleId ) {
      console.log( "Using manual termination via simctl" );
      // Use existing terminateApp, but don't throw errors
      try {
        await terminateApp( deviceId, bundleId );
      } catch ( error ) {
        console.log( "Manual termination error (non-fatal):", error.message );
      }

      // Add a delay to let processes settle
      await new Promise( resolve => { setTimeout( resolve, 500 ); } );
    }
  } catch ( error ) {
    console.log( "Error during cleanup (non-fatal):", error.message );
  }
}
