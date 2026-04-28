import { execSync } from "child_process";
import {
  by, device, element, expect, waitFor,
} from "detox";
import Config from "react-native-config-node";

import switchPowerMode from "./switchPowerMode";

const TIMEOUT = 10_000;

export default async function signIn() {
  /*
    Switch UI to power user mode
  */
  await switchPowerMode();
  // Find the Menu item from tabs
  const menuButton = element( by.id( "Menu" ) );
  await waitFor( menuButton ).toBeVisible().withTimeout( TIMEOUT );
  await expect( menuButton ).toBeVisible();
  await element( by.id( "Menu" ) ).tap( { x: 0, y: 0 } );
  // Tap the Log-In menu item
  // TODO: consider this a temporary solution as it only checks for the menu-header
  // which can be a login prompt or the logged in user's details. If the user is already
  // logged in, this should fail instead.
  const loginMenuItem = element( by.id( "menu-header" ) );
  await waitFor( loginMenuItem ).toBeVisible().withTimeout( TIMEOUT );
  await expect( loginMenuItem ).toBeVisible();
  await element( by.id( "menu-header" ) ).tap();
  const usernameInput = element( by.id( "Login.email" ) );
  await waitFor( usernameInput ).toBeVisible().withTimeout( TIMEOUT );
  await expect( usernameInput ).toBeVisible();
  await element( by.id( "Login.email" ) ).tap();
  await element( by.id( "Login.email" ) ).typeText( Config.E2E_TEST_USERNAME );
  const passwordInput = element( by.id( "Login.password" ) );
  await expect( passwordInput ).toBeVisible();
  await element( by.id( "Login.password" ) ).tap();
  await element( by.id( "Login.password" ) ).typeText( Config.E2E_TEST_PASSWORD );
  // On Android, dismiss the Gboard keyboard before tapping login to prevent the
  // clipboard popup overlay from intercepting the button tap.
  // Use ADB keyevent instead of device.pressBack() to avoid UiAutomationService
  // conflicts on Android API 36+.
  if ( device.getPlatform() === "android" ) {
    execSync( "adb shell input keyevent 4" );
  }
  const loginButton = element( by.id( "Login.loginButton" ) );
  await expect( loginButton ).toBeVisible();
  await element( by.id( "Login.loginButton" ) ).tap();
  const username = element( by.text( `${Config.E2E_TEST_USERNAME}` ) );
  await waitFor( username ).toBeVisible().withTimeout( TIMEOUT );
  await expect( username ).toBeVisible();

  return username;
}
