import { waitFor } from "@testing-library/react-native";
import useLocationSearch from "components/Explore/ExploreV2/hooks/useLocationSearch";
import { renderHookInApp } from "tests/helpers/render";

jest.mock( "api/search" );
const { fetchSearchResults } = require( "api/search" );

const MONTEREY = { id: 1, display_name: "Monterey, CA, US", place_type: 9 };
const MONTENEGRO = { id: 2, display_name: "Montenegro", place_type: 12 };

beforeEach( ( ) => {
  fetchSearchResults.mockReset( );
} );

describe( "useLocationSearch", ( ) => {
  it( "trims the query and fetches only places", async ( ) => {
    fetchSearchResults.mockResolvedValue( [] );

    renderHookInApp( ( ) => useLocationSearch( "  mon  " ) );

    await waitFor( ( ) => expect( fetchSearchResults ).toHaveBeenCalled( ) );
    expect( fetchSearchResults ).toHaveBeenCalledWith(
      expect.objectContaining( { q: "mon", sources: "places" } ),
      expect.anything( ),
    );
  } );

  it( "normalizes places to type-tagged result items, preserving order", async ( ) => {
    fetchSearchResults.mockResolvedValue( [MONTEREY, MONTENEGRO] );

    const { result } = renderHookInApp( ( ) => useLocationSearch( "mon" ) );

    await waitFor( ( ) => expect( result.current.results.length ).toEqual( 2 ) );

    expect( result.current.results ).toEqual( [
      {
        type: "place", id: 1, display_name: "Monterey, CA, US", place_type: 9,
      },
      {
        type: "place", id: 2, display_name: "Montenegro", place_type: 12,
      },
    ] );
  } );

  it( "defaults a missing display_name and place_type to safe values", async ( ) => {
    fetchSearchResults.mockResolvedValue( [{ id: 3 }] );

    const { result } = renderHookInApp( ( ) => useLocationSearch( "mon" ) );

    await waitFor( ( ) => expect( result.current.results.length ).toEqual( 1 ) );

    expect( result.current.results[0] ).toEqual( {
      type: "place",
      id: 3,
      display_name: "",
      place_type: null,
    } );
  } );

  it( "drops places without an id", async ( ) => {
    fetchSearchResults.mockResolvedValue( [MONTEREY, { display_name: "No ID place" }] );

    const { result } = renderHookInApp( ( ) => useLocationSearch( "mon" ) );

    await waitFor( ( ) => expect( result.current.results.length ).toEqual( 1 ) );
    expect( result.current.results[0].id ).toEqual( 1 );
  } );

  it( "returns an empty list when the API responds with null", async ( ) => {
    fetchSearchResults.mockResolvedValue( null );

    const { result } = renderHookInApp( ( ) => useLocationSearch( "mon" ) );

    await waitFor( ( ) => expect( fetchSearchResults ).toHaveBeenCalled( ) );
    expect( result.current.results ).toEqual( [] );
  } );
} );
