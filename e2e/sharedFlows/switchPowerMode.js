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
  // Tap the settings switch for advanced interface mode
  // TODO: this will be required when the advanced interface mode is toggled off by default
  // const advancedInterfaceSwitch = element( by.id( "advanced-interface-option" ) );
  // await waitFor( advancedInterfaceSwitch ).toBeVisible().withTimeout( 10000 );
  // await advancedInterfaceSwitch.tap();
  // Tap the settings radio button for power user mode
  const powerUserRadioButton = element( by.id( "all-observation-options" ) );
  await waitFor( powerUserRadioButton ).toBeVisible().withTimeout( 10000 );
  await powerUserRadioButton.tap();
  // Tap the settings radio button for suggestions flow first mode
  const suggestionsFlowButton = element( by.id( "suggestions-flow-mode" ) );
  await waitFor( suggestionsFlowButton ).toBeVisible().withTimeout( 10000 );
  await suggestionsFlowButton.tap();
}
