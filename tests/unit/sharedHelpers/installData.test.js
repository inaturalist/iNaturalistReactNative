// jest.setup mocks installData globally
const {
  consumeOnboardingV2NextLaunch,
  setOnboardingV2NextLaunch,
  store,
} = jest.requireActual( "sharedHelpers/installData" );

beforeEach( ( ) => {
  store.clearAll( );
} );

describe( "onboarding v2 on next launch", ( ) => {
  it( "applies to one launch only", ( ) => {
    setOnboardingV2NextLaunch( );
    expect( consumeOnboardingV2NextLaunch( ) ).toBe( true );
    expect( consumeOnboardingV2NextLaunch( ) ).toBe( false );
  } );

  it( "shows onboarding again", ( ) => {
    store.set( "onboardingShown", true );
    setOnboardingV2NextLaunch( );
    expect( store.getBoolean( "onboardingShown" ) ).toBeUndefined( );
  } );

  it( "doesn't apply unless requested", ( ) => {
    expect( consumeOnboardingV2NextLaunch( ) ).toBe( false );
  } );
} );
