import {
  by,
  element,
  waitFor,
} from "detox";

const VISIBILITY_TIMEOUT = 10_000;

export default async function closeOnboarding( ) {
  const closeOnboardingButton = element( by.label( "Close" ) );
  await waitFor( closeOnboardingButton ).toBeVisible( ).withTimeout( VISIBILITY_TIMEOUT );
  await closeOnboardingButton.tap( );

  // Closing onboarding opens the login screen
  const usernameInput = element( by.id( "Login.email" ) );
  await waitFor( usernameInput ).toBeVisible( ).withTimeout( VISIBILITY_TIMEOUT );
  return element( by.label( "Close" ) ).tap( );
}
