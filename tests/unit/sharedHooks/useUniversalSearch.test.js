import { waitFor } from "@testing-library/react-native";
import useUniversalSearch from "sharedHooks/useUniversalSearch";
import { renderHookInApp } from "tests/helpers/render";

jest.mock( "api/search" );
const { search } = require( "api/search" );

const TAXON_RESULT = {
  taxon: {
    id: 12,
    name: "Eumyias thalassinus",
    preferred_common_name: "Verditer Flycatcher",
  },
};
const USER_RESULT = {
  user: { id: 7, login: "seth_msp" },
};
const PROJECT_RESULT = {
  project: { id: 9, title: "InverteFest" },
};

beforeEach( ( ) => {
  search.mockReset( );
} );

describe( "useUniversalSearch", ( ) => {
  it( "does not query and returns no results for a blank query", async ( ) => {
    const { result } = renderHookInApp( ( ) => useUniversalSearch( "   " ) );

    // Give the (disabled) query a chance to fire if it were going to.
    await waitFor( ( ) => expect( result.current.isLoading ).toBe( false ) );

    expect( search ).not.toHaveBeenCalled( );
    expect( result.current.results ).toEqual( [] );
  } );

  it( "trims the query before sending it to the API", async ( ) => {
    search.mockResolvedValue( { results: [] } );

    renderHookInApp( ( ) => useUniversalSearch( "  ver  " ) );

    await waitFor( ( ) => expect( search ).toHaveBeenCalled( ) );
    expect( search ).toHaveBeenCalledWith(
      expect.objectContaining( { q: "ver", sources: ["taxa", "users", "projects"] } ),
      expect.anything( ),
    );
  } );

  it( "maps a mixed response to a tagged union, preserving order", async ( ) => {
    search.mockResolvedValue( {
      results: [USER_RESULT, TAXON_RESULT, PROJECT_RESULT],
    } );

    const { result } = renderHookInApp( ( ) => useUniversalSearch( "ver" ) );

    await waitFor( ( ) => expect( result.current.results.length ).toEqual( 3 ) );

    expect( result.current.results ).toEqual( [
      { type: "user", user: USER_RESULT.user },
      { type: "taxon", taxon: TAXON_RESULT.taxon },
      { type: "project", project: PROJECT_RESULT.project },
    ] );
  } );

  it( "returns an empty list when the API responds with null", async ( ) => {
    search.mockResolvedValue( null );

    const { result } = renderHookInApp( ( ) => useUniversalSearch( "ver" ) );

    await waitFor( ( ) => expect( search ).toHaveBeenCalled( ) );
    expect( result.current.results ).toEqual( [] );
  } );
} );
