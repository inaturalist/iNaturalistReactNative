import {
  by, element, waitFor
} from "detox";

const TIMEOUT = 10_000;

export default async function switchPowerMode() {
  const menuButton = element( by.id( "OPEN_MENU" ) );
  await waitFor( menuButton ).toBeVisible().withTimeout( TIMEOUT );
  await menuButton.tap( { x: 0, y: 0 } );
  // Tap the settings menu item
  const settingsMenuItem = element( by.id( "settings" ) );
  await waitFor( settingsMenuItem ).toBeVisible().withTimeout( TIMEOUT );
  await settingsMenuItem.tap();
  // Switch settings to advanced interface mode
  const advancedInterfaceSwitch = element( by.id( "advanced-interface-switch.switch" ) );
  await waitFor( advancedInterfaceSwitch ).toBeVisible().withTimeout( TIMEOUT );
  await advancedInterfaceSwitch.tap();
}
