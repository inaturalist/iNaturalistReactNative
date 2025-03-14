import {
  by, element, expect, waitFor
} from "detox";
import Config from "react-native-config-node";

import dismissAnnouncements from "./dismissAnnouncements";
import switchPowerMode from "./switchPowerMode";

export default async function signIn() {
  /*
    Switch UI to power user mode
  */
  await switchPowerMode();
  // Find the Menu item from tabs
  const openDrawerMenuItem = element( by.id( "OPEN_DRAWER" ) );
  await waitFor( openDrawerMenuItem ).toBeVisible().withTimeout( 10000 );
  await expect( openDrawerMenuItem ).toBeVisible();
  await element( by.id( "OPEN_DRAWER" ) ).tap();
  // Tap the Log-In menu item
  // TODO: consider this a temporary solution as it only checks for the drawer-top-banner
  // which can be a login prompt or the logged in user's details. If the user is already
  // logged in, this should fail instead.
  const loginMenuItem = element( by.id( "drawer-top-banner" ) );
  await waitFor( loginMenuItem ).toBeVisible().withTimeout( 10000 );
  await expect( loginMenuItem ).toBeVisible();
  await element( by.id( "drawer-top-banner" ) ).tap();
  const usernameInput = element( by.id( "Login.email" ) );
  await waitFor( usernameInput ).toBeVisible().withTimeout( 10000 );
  await expect( usernameInput ).toBeVisible();
  await element( by.id( "Login.email" ) ).tap();
  await element( by.id( "Login.email" ) ).typeText( Config.E2E_TEST_USERNAME );
  const passwordInput = element( by.id( "Login.password" ) );
  await expect( passwordInput ).toBeVisible();
  await element( by.id( "Login.password" ) ).tap();
  await element( by.id( "Login.password" ) ).typeText( Config.E2E_TEST_PASSWORD );
  const loginButton = element( by.id( "Login.loginButton" ) );
  await expect( loginButton ).toBeVisible();
  await element( by.id( "Login.loginButton" ) ).tap();
  const username = element( by.text( `${Config.E2E_TEST_USERNAME}` ) ).atIndex( 1 );
  await waitFor( username ).toBeVisible().withTimeout( 10000 );
  await expect( username ).toBeVisible();

  /*
    Dismiss announcements if they're blocking the UI
  */
  await dismissAnnouncements();
  return username;
}
