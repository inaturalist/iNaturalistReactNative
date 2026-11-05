import { getJWT } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";
import syncFeatureFlags from "sharedHelpers/syncFeatureFlags";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  getJWT: jest.fn( ),
} ) );

const mockGet = jest.mocked( inatjs.feature_flags.get );
const mockGetJWT = jest.mocked( getJWT );

describe( "syncFeatureFlags", ( ) => {
  beforeEach( ( ) => {
    mockGet.mockReset( );
    mockGetJWT.mockReset( );
  } );

  it( "stores API values fetched with the user's JWT", async ( ) => {
    mockGetJWT.mockResolvedValue( "user-jwt" );
    mockGet.mockResolvedValue( { flags: { [FeatureFlag.TraditionalProjects]: true } } );

    await syncFeatureFlags( );

    expect( mockGet ).toHaveBeenCalledWith( {}, { api_token: "user-jwt" } );
    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( { [FeatureFlag.TraditionalProjects]: true } );
    expect( featureFlagApiStatus ).toMatchObject( { state: "loaded", signedIn: true } );
  } );

  it( "fetches without a token when signed out", async ( ) => {
    mockGetJWT.mockResolvedValue( null );
    mockGet.mockResolvedValue( { flags: {} } );

    await syncFeatureFlags( );

    expect( mockGet ).toHaveBeenCalledWith( {}, { api_token: null } );
    expect( useStore.getState( ).featureFlagApiStatus )
      .toMatchObject( { state: "loaded", signedIn: false } );
  } );

  it( "clears API values when the request fails", async ( ) => {
    mockGetJWT.mockResolvedValue( "user-jwt" );
    mockGet.mockResolvedValueOnce( { flags: { [FeatureFlag.ExploreV2]: false } } );
    await syncFeatureFlags( );

    mockGet.mockRejectedValueOnce( new Error( "Network request failed" ) );
    await syncFeatureFlags( );

    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( {} );
    expect( featureFlagApiStatus ).toMatchObject( { state: "error", signedIn: true } );
  } );

  it( "ignores a response that arrives after a newer sync started", async ( ) => {
    let resolveFirst;
    mockGetJWT.mockResolvedValue( "user-jwt" );
    mockGet
      .mockImplementationOnce( ( ) => new Promise( resolve => { resolveFirst = resolve; } ) )
      .mockResolvedValueOnce( { flags: { [FeatureFlag.ExploreV2]: true } } );

    const first = syncFeatureFlags( );
    await syncFeatureFlags( );
    resolveFirst( { flags: { [FeatureFlag.ExploreV2]: false } } );
    await first;

    expect( useStore.getState( ).featureFlagApiValues )
      .toEqual( { [FeatureFlag.ExploreV2]: true } );
  } );
} );
