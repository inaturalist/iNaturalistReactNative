import inatjs from "inaturalistjs";
import syncFeatureFlags, { cancelFeatureFlagSync } from "sharedHelpers/syncFeatureFlags";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

const mockGet = jest.mocked( inatjs.feature_flags.get );

const PROJECTS_KEY = `client_${FeatureFlag.TraditionalProjectsEnabled}`;
const EXPLORE_KEY = `client_${FeatureFlag.ExploreV2Enabled}`;

describe( "syncFeatureFlags", ( ) => {
  beforeEach( ( ) => {
    mockGet.mockReset( );
  } );

  it( "stores API values fetched with the user's JWT", async ( ) => {
    mockGet.mockResolvedValue( { flags: { [PROJECTS_KEY]: true } } );

    await syncFeatureFlags( "user-jwt" );

    expect( mockGet ).toHaveBeenCalledWith(
      {},
      expect.objectContaining( { api_token: "user-jwt" } ),
    );
    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( { [FeatureFlag.TraditionalProjectsEnabled]: true } );
    expect( featureFlagApiStatus ).toMatchObject( { state: "loaded", signedIn: true } );
  } );

  it( "fetches without a token when signed out", async ( ) => {
    mockGet.mockResolvedValue( { flags: {} } );

    await syncFeatureFlags( null );

    expect( mockGet ).toHaveBeenCalledWith( {}, expect.objectContaining( { api_token: null } ) );
    expect( useStore.getState( ).featureFlagApiStatus )
      .toMatchObject( { state: "loaded", signedIn: false } );
  } );

  it( "clears API values when the request fails", async ( ) => {
    mockGet.mockResolvedValueOnce( { flags: { [EXPLORE_KEY]: false } } );
    await syncFeatureFlags( "user-jwt" );

    mockGet.mockRejectedValueOnce( new Error( "Network request failed" ) );
    await syncFeatureFlags( "user-jwt" );

    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( {} );
    expect( featureFlagApiStatus ).toMatchObject( { state: "error", signedIn: true } );
  } );

  it( "ignores a response that arrives after a newer sync started", async ( ) => {
    let resolveFirst;
    mockGet
      .mockImplementationOnce( ( ) => new Promise( resolve => { resolveFirst = resolve; } ) )
      .mockResolvedValueOnce( { flags: { [EXPLORE_KEY]: true } } );

    const first = syncFeatureFlags( "user-jwt" );
    await syncFeatureFlags( "user-jwt" );
    resolveFirst( { flags: { [EXPLORE_KEY]: false } } );
    await first;

    expect( useStore.getState( ).featureFlagApiValues )
      .toEqual( { [FeatureFlag.ExploreV2Enabled]: true } );
  } );

  it( "ignores a response that arrives after the sync was cancelled", async ( ) => {
    mockGet.mockResolvedValueOnce( { flags: { [EXPLORE_KEY]: true } } );
    await syncFeatureFlags( "user-jwt" );
    let resolveFetch;
    mockGet.mockImplementationOnce( ( ) => new Promise( resolve => { resolveFetch = resolve; } ) );
    const sync = syncFeatureFlags( "user-jwt" );

    cancelFeatureFlagSync( );
    resolveFetch( { flags: { [EXPLORE_KEY]: false } } );
    await sync;

    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( { [FeatureFlag.ExploreV2Enabled]: true } );
    expect( featureFlagApiStatus ).toEqual( { state: "loading" } );
  } );

  it( "ignores a failure that arrives after the sync was cancelled", async ( ) => {
    mockGet.mockResolvedValueOnce( { flags: { [EXPLORE_KEY]: true } } );
    await syncFeatureFlags( "user-jwt" );
    let rejectFetch;
    mockGet.mockImplementationOnce(
      ( ) => new Promise( ( _resolve, reject ) => { rejectFetch = reject; } ),
    );
    const sync = syncFeatureFlags( "user-jwt" );

    cancelFeatureFlagSync( );
    rejectFetch( new Error( "Network request failed" ) );
    await sync;

    const { featureFlagApiValues, featureFlagApiStatus } = useStore.getState( );
    expect( featureFlagApiValues ).toEqual( { [FeatureFlag.ExploreV2Enabled]: true } );
    expect( featureFlagApiStatus ).toEqual( { state: "loading" } );
  } );
} );
