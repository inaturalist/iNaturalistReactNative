import {
  by, element, waitFor
} from "detox";

export default async function switchPowerMode() {
  const drawerButton = element( by.id( "OPEN_DRAWER" ) );
  await waitFor( drawerButton ).toBeVisible().withTimeout( 10000 );
  await drawerButton.tap();
  // Tap the settings drawer menu item
  const settingsDrawerMenuItem = element( by.id( "settings" ) );
  await waitFor( settingsDrawerMenuItem ).toBeVisible().withTimeout( 10000 );
  await settingsDrawerMenuItem.tap();
  // Switch settings to advanced interface mode
  const advancedInterfaceSwitch = element( by.id( "advanced-interface-switch.switch" ) );
  await waitFor( advancedInterfaceSwitch ).toBeVisible().withTimeout( 10000 );
  await advancedInterfaceSwitch.tap();
}
