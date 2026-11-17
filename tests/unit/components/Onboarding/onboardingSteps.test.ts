import { getStepProgress } from "components/Onboarding/onboardingSteps";

describe( "getStepProgress", ( ) => {
  it( "returns null for steps without a progress bar", ( ) => {
    expect( getStepProgress( "welcome" ) ).toBeNull( );
    expect( getStepProgress( "signup_email" ) ).toBeNull( );
    expect( getStepProgress( "signup_credentials" ) ).toBeNull( );
  } );

  it( "returns the fraction of the eight steps completed before arriving", ( ) => {
    expect( getStepProgress( "obs_story" ) ).toBe( 1 / 8 );
    expect( getStepProgress( "impact" ) ).toBe( 4 / 8 );
    expect( getStepProgress( "location_explainer" ) ).toBe( 7 / 8 );
  } );
} );
