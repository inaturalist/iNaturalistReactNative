import { execSync } from "child_process";

export default async function iNatE2eBeforeEach( device ) {
  await device.launchApp( {
    newInstance: true,
    permissions: { location: "always" }
  } );
  if ( device.getPlatform() === "ios" ) {
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
}
