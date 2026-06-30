import { waitFor } from "@testing-library/react-native";
import useUniversalSearch from "sharedHooks/useUniversalSearch";
import { renderHookInApp } from "tests/helpers/render";

jest.mock( "api/search" );
const { search } = require( "api/search" );

const TAXON_RESULT = {
  type: "taxon",
  taxon: {
    id: 12,
    name: "Eumyias thalassinus",
    preferred_common_name: "Verditer Flycatcher",
  },
};
const USER_RESULT = {
  type: "user",
  user: { id: 7, login: "seth_msp" },
};
const PROJECT_RESULT = {
  type: "project",
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

  it( "returns the type-tagged results, preserving order", async ( ) => {
    search.mockResolvedValue( {
      results: [USER_RESULT, TAXON_RESULT, PROJECT_RESULT],
    } );

    const { result } = renderHookInApp( ( ) => useUniversalSearch( "ver" ) );

    await waitFor( ( ) => expect( result.current.results.length ).toEqual( 3 ) );

    expect( result.current.results ).toEqual( [
      USER_RESULT,
      TAXON_RESULT,
      PROJECT_RESULT,
    ] );
  } );

  it( "returns an empty list when the API responds with null", async ( ) => {
    search.mockResolvedValue( null );

    const { result } = renderHookInApp( ( ) => useUniversalSearch( "ver" ) );

    await waitFor( ( ) => expect( search ).toHaveBeenCalled( ) );
    expect( result.current.results ).toEqual( [] );
  } );
} );
