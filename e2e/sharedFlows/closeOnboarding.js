import {
  by,
  element,
  waitFor,
} from "detox";

const VISIBILITY_TIMEOUT = 10_000;

export default async function closeOnboarding( ) {
  const closeOnboardingButton = element( by.label( "Close" ) );
  await waitFor( closeOnboardingButton ).toBeVisible( ).withTimeout( VISIBILITY_TIMEOUT );
  return closeOnboardingButton.tap( );
}
