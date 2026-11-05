import fetchFeatureFlags from "api/featureFlags";
import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

jest.mock( "inaturalistjs" );

const mockGet = jest.mocked( inatjs.feature_flags.get );

describe( "fetchFeatureFlags", ( ) => {
  beforeEach( ( ) => {
    jest.resetAllMocks( );
  } );

  it( "passes the api token through", async ( ) => {
    mockGet.mockResolvedValue( { flags: {}, experiments: {} } );
    await fetchFeatureFlags( { api_token: "test-token" } );
    expect( mockGet ).toHaveBeenCalledWith(
      {},
      expect.objectContaining( { api_token: "test-token" } ),
    );
  } );

  it( "asks HTTP caches to revalidate so auth changes never reuse stale flags", async ( ) => {
    mockGet.mockResolvedValue( { flags: {}, experiments: {} } );
    await fetchFeatureFlags( );
    expect( mockGet ).toHaveBeenCalledWith(
      {},
      expect.objectContaining( { headers: { "Cache-Control": "no-cache" } } ),
    );
  } );

  it( "keeps known boolean flags, including false ones", async ( ) => {
    mockGet.mockResolvedValue( {
      flags: {
        [FeatureFlag.ExploreV2]: false,
        [FeatureFlag.TraditionalProjects]: true,
      },
      experiments: {},
    } );
    await expect( fetchFeatureFlags( ) ).resolves.toEqual( {
      [FeatureFlag.ExploreV2]: false,
      [FeatureFlag.TraditionalProjects]: true,
    } );
  } );

  it( "drops flags the app doesn't define and non-boolean values", async ( ) => {
    mockGet.mockResolvedValue( {
      flags: {
        client_some_web_flag: true,
        [FeatureFlag.ExploreV2]: "true",
      },
      experiments: {},
    } );
    await expect( fetchFeatureFlags( ) ).resolves.toEqual( {} );
  } );

  it( "throws when the request fails", async ( ) => {
    mockGet.mockRejectedValue( new Error( "Network request failed" ) );
    await expect( fetchFeatureFlags( ) ).rejects.toThrow( "Network request failed" );
  } );
} );
