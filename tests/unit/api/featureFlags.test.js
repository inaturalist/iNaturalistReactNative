import fetchFeatureFlags from "api/featureFlags";
import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

jest.mock( "inaturalistjs" );

const mockGet = jest.mocked( inatjs.feature_flags.get );

const ONBOARDING = FeatureFlag.OnboardingV2Enabled;
const PROJECTS = FeatureFlag.TraditionalProjectsEnabled;

const respond = flags => mockGet.mockResolvedValue( { flags, experiments: {} } );

describe( "fetchFeatureFlags", ( ) => {
  beforeEach( ( ) => {
    jest.resetAllMocks( );
  } );

  it( "passes the api token through", async ( ) => {
    respond( {} );
    await fetchFeatureFlags( { api_token: "test-token" } );
    expect( mockGet ).toHaveBeenCalledWith(
      {},
      expect.objectContaining( { api_token: "test-token" } ),
    );
  } );

  it( "asks HTTP caches to revalidate so auth changes never reuse stale flags", async ( ) => {
    respond( {} );
    await fetchFeatureFlags( );
    expect( mockGet ).toHaveBeenCalledWith(
      {},
      expect.objectContaining( { headers: { "Cache-Control": "no-cache" } } ),
    );
  } );

  it( "reads each flag by its scope's key, including false ones", async ( ) => {
    respond( {
      client_install_onboarding_v2: false,
      client_traditional_projects: true,
    } );
    await expect( fetchFeatureFlags( ) ).resolves.toEqual( {
      [ONBOARDING]: false,
      [PROJECTS]: true,
    } );
  } );

  it( "ignores a flag's key under the other scope", async ( ) => {
    respond( {
      client_onboarding_v2: true,
      client_install_traditional_projects: true,
    } );
    await expect( fetchFeatureFlags( ) ).resolves.toEqual( {} );
  } );

  it( "drops flags the app doesn't define, other prefixes and non-boolean values", async ( ) => {
    respond( {
      client_some_web_flag: true,
      client_install_some_web_flag: true,
      [PROJECTS]: true,
      [`client_${PROJECTS}`]: "true",
      client_install_onboarding_v2: null,
    } );
    await expect( fetchFeatureFlags( ) ).resolves.toEqual( {} );
  } );

  it( "throws when the request fails", async ( ) => {
    mockGet.mockRejectedValue( new Error( "Network request failed" ) );
    await expect( fetchFeatureFlags( ) ).rejects.toThrow( "Network request failed" );
  } );
} );
