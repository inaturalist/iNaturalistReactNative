import {
  by, element, waitFor
} from "detox";

const TIMEOUT = 10_000;

export default async function switchPowerMode() {
  const drawerButton = element( by.id( "OPEN_DRAWER" ) );
  await waitFor( drawerButton ).toBeVisible().withTimeout( TIMEOUT );
  await drawerButton.tap( { x: 0, y: 0 } );
  // Tap the settings drawer menu item
  const settingsDrawerMenuItem = element( by.id( "settings" ) );
  await waitFor( settingsDrawerMenuItem ).toBeVisible().withTimeout( TIMEOUT );
  await settingsDrawerMenuItem.tap();
  // Switch settings to advanced interface mode
  const advancedInterfaceSwitch = element( by.id( "advanced-interface-switch.switch" ) );
  await waitFor( advancedInterfaceSwitch ).toBeVisible().withTimeout( TIMEOUT );
  await advancedInterfaceSwitch.tap();
}
