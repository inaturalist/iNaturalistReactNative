import {
  by,
  element,
  waitFor
} from "detox";

const VISIBILITY_TIMEOUT = 10_000;

export default async function closeOnboarding( ) {
  const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
  await waitFor( loginText ).toExist().withTimeout( VISIBILITY_TIMEOUT );
  // If we can see MyObs, we don't need to close the onboarding
  if ( loginText.visible ) {
    return Promise.resolve( );
  }
  const closeOnboardingButton = element(
    by.label( "Close" ).withAncestor( by.id( "OnboardingCarousel" ) )
  );
  await waitFor( closeOnboardingButton ).toBeVisible( ).withTimeout( VISIBILITY_TIMEOUT );
  return closeOnboardingButton.tap( );
}
