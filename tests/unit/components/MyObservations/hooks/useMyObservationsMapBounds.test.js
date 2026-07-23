import { renderHook } from "@testing-library/react-native";
import { searchObservations } from "api/observations";
import useMyObservationsMapBounds from "components/MyObservations/hooks/useMyObservationsMapBounds";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

jest.mock( "api/observations", ( ) => ( {
  __esModule: true,
  searchObservations: jest.fn( ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

describe( "useMyObservationsMapBounds", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
    useAuthenticatedQuery.mockReturnValue( { data: undefined, isLoading: false } );
  } );

  it( "requests bounds scoped to the user, without a taxon filter, "
    + "when no taxon is searched", ( ) => {
    renderHook( ( ) => useMyObservationsMapBounds( 123, undefined, true ) );

    const [, queryFunction] = useAuthenticatedQuery.mock.calls[0];
    queryFunction( { api_token: "test-token" } );

    expect( searchObservations ).toHaveBeenCalledWith(
      { user_id: 123, return_bounds: true, per_page: 0 },
      { api_token: "test-token" },
    );
  } );

  it( "includes a taxon_id filter when a taxon is searched", ( ) => {
    renderHook( ( ) => useMyObservationsMapBounds( 123, 999, true ) );

    const [, queryFunction] = useAuthenticatedQuery.mock.calls[0];
    queryFunction( { api_token: "test-token" } );

    expect( searchObservations ).toHaveBeenCalledWith(
      {
        user_id: 123, taxon_id: 999, return_bounds: true, per_page: 0,
      },
      { api_token: "test-token" },
    );
  } );

  it( "only enables the query when a userId is present", ( ) => {
    renderHook( ( ) => useMyObservationsMapBounds( undefined, undefined, true ) );

    const [, , queryOptions] = useAuthenticatedQuery.mock.calls[0];
    expect( queryOptions.enabled ).toBe( false );
  } );

  it( "does not enable the query when the caller passes enabled: false, "
    + "even with a userId", ( ) => {
    renderHook( ( ) => useMyObservationsMapBounds( 123, undefined, false ) );

    const [, , queryOptions] = useAuthenticatedQuery.mock.calls[0];
    expect( queryOptions.enabled ).toBe( false );
  } );

  it( "returns totalBounds from the query result", ( ) => {
    const totalBounds = {
      swlat: 1, swlng: 2, nelat: 3, nelng: 4,
    };
    useAuthenticatedQuery.mockReturnValue( {
      data: { total_bounds: totalBounds },
      isLoading: false,
    } );

    const { result } = renderHook( ( ) => useMyObservationsMapBounds( 123, undefined, true ) );

    expect( result.current.totalBounds ).toEqual( totalBounds );
  } );
} );
