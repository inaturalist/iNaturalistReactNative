import { execSync } from "child_process";

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
