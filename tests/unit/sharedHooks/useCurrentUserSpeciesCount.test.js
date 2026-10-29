import { waitFor } from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import { authenticatedQueryKey } from "sharedHooks/useAuthenticatedQuery";
import useCurrentUserSpeciesCount, {
  CURRENT_USER_SPECIES_COUNT_QUERY_KEY,
  setCurrentUserSpeciesCount,
} from "sharedHooks/useCurrentUserSpeciesCount";
import { makeResponse } from "tests/factory";
import { queryClient, renderHookInApp } from "tests/helpers/render";

const mockUserId = 123;

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { id: mockUserId } ),
} ) );

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  getJWT: jest.fn( ( ) => Promise.resolve( "test-jwt" ) ),
  isLoggedIn: jest.fn( ( ) => Promise.resolve( true ) ),
} ) );

// The app wrapper makes its own species_counts requests, so only count this hook's
const countRequests = ( ) => inatjs.observations.speciesCounts.mock.calls
  .filter( ( [params] ) => params.user_id === mockUserId && params.per_page === 0 );

describe( "useCurrentUserSpeciesCount", ( ) => {
  beforeEach( ( ) => {
    queryClient.clear( );
    inatjs.observations.speciesCounts.mockClear( );
    inatjs.observations.speciesCounts.mockResolvedValue( {
      ...makeResponse( ),
      total_results: 783,
    } );
  } );

  afterEach( ( ) => {
    inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( ) );
  } );

  it( "returns the signed-in user's species count from a count-only request", async ( ) => {
    const { result } = renderHookInApp( ( ) => useCurrentUserSpeciesCount( ) );
    await waitFor( ( ) => {
      expect( result.current ).toEqual( 783 );
    } );
    expect( inatjs.observations.speciesCounts ).toHaveBeenCalledWith(
      expect.objectContaining( { user_id: mockUserId, per_page: 0 } ),
      expect.anything( ),
    );
  } );

  it( "reuses a recently fetched count instead of fetching again", async ( ) => {
    const { result: firstResult, unmount } = renderHookInApp(
      ( ) => useCurrentUserSpeciesCount( ),
    );
    await waitFor( ( ) => {
      expect( firstResult.current ).toEqual( 783 );
    } );
    unmount( );

    const { result: secondResult } = renderHookInApp( ( ) => useCurrentUserSpeciesCount( ) );
    await waitFor( ( ) => {
      expect( secondResult.current ).toEqual( 783 );
    } );
    expect( countRequests( ) ).toHaveLength( 1 );
  } );

  it( "does not fetch when disabled", async ( ) => {
    const { result } = renderHookInApp( ( ) => useCurrentUserSpeciesCount( { enabled: false } ) );
    expect( result.current ).toBeNull( );
    expect( countRequests( ) ).toHaveLength( 0 );
  } );

  describe( "setCurrentUserSpeciesCount", ( ) => {
    const storedCount = ( ) => queryClient.getQueryData( authenticatedQueryKey(
      [CURRENT_USER_SPECIES_COUNT_QUERY_KEY, mockUserId],
      { userLoggedIn: true },
    ) )?.total_results;

    it( "stores a count fetched after the one already stored", ( ) => {
      setCurrentUserSpeciesCount( queryClient, mockUserId, 779, 1000 );
      setCurrentUserSpeciesCount( queryClient, mockUserId, 783, 2000 );
      expect( storedCount( ) ).toEqual( 783 );
    } );

    it( "ignores a count fetched before the one already stored", ( ) => {
      setCurrentUserSpeciesCount( queryClient, mockUserId, 783, 2000 );
      setCurrentUserSpeciesCount( queryClient, mockUserId, 779, 1000 );
      expect( storedCount( ) ).toEqual( 783 );
    } );

    it( "is read by the hook without fetching", async ( ) => {
      setCurrentUserSpeciesCount( queryClient, mockUserId, 790, Date.now( ) );
      const { result } = renderHookInApp( ( ) => useCurrentUserSpeciesCount( ) );
      await waitFor( ( ) => {
        expect( result.current ).toEqual( 790 );
      } );
      expect( countRequests( ) ).toHaveLength( 0 );
    } );
  } );
} );
