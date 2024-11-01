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
  // Tap the settings radio button for power user mode
  const powerUserRadioButton = element( by.id( "all-observation-option" ) );
  await waitFor( powerUserRadioButton ).toBeVisible().withTimeout( 10000 );
  await powerUserRadioButton.tap();
}
