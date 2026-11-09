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

const PROJECTS_KEY = `client_${FeatureFlag.TraditionalProjectsEnabled}`;
const EXPLORE_KEY = `client_${FeatureFlag.ExploreV2Enabled}`;

describe( "syncFeatureFlags", ( ) => {
  beforeEach( ( ) => {
    mockGet.mockReset( );
    mockGetJWT.mockReset( );
  } );

  it( "stores API values fetched with the user's JWT", async ( ) => {
    mockGetJWT.mockResolvedValue( "user-jwt" );
    mockGet.mockResolvedValue( { flags: { [PROJECTS_KEY]: true } } );

    await syncFeatureFlags( );

    expect( mockGet ).toHaveBeenCalledWith(
      {},
      expect.objectContaining( { api_token: "user-jwt" } ),
    );
    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( { [FeatureFlag.TraditionalProjectsEnabled]: true } );
    expect( featureFlagApiStatus ).toMatchObject( { state: "loaded", signedIn: true } );
  } );

  it( "fetches without a token when signed out", async ( ) => {
    mockGetJWT.mockResolvedValue( null );
    mockGet.mockResolvedValue( { flags: {} } );

    await syncFeatureFlags( );

    expect( mockGet ).toHaveBeenCalledWith( {}, expect.objectContaining( { api_token: null } ) );
    expect( useStore.getState( ).featureFlagApiStatus )
      .toMatchObject( { state: "loaded", signedIn: false } );
  } );

  it( "clears API values when the request fails", async ( ) => {
    mockGetJWT.mockResolvedValue( "user-jwt" );
    mockGet.mockResolvedValueOnce( { flags: { [EXPLORE_KEY]: false } } );
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
      .mockResolvedValueOnce( { flags: { [EXPLORE_KEY]: true } } );

    const first = syncFeatureFlags( );
    await syncFeatureFlags( );
    resolveFirst( { flags: { [EXPLORE_KEY]: false } } );
    await first;

    expect( useStore.getState( ).featureFlagApiValues )
      .toEqual( { [FeatureFlag.ExploreV2Enabled]: true } );
  } );
} );
