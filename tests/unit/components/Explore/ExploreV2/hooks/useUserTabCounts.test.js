import { act, waitFor } from "@testing-library/react-native";
import useUserTabCounts from "components/Explore/ExploreV2/hooks/useUserTabCounts";
import { renderHookInApp } from "tests/helpers/render";

jest.mock( "api/observations" );
const { fetchIdentifiers, fetchObservers } = require( "api/observations" );

const PARAMS = { taxon_id: 12, place_id: 1 };

beforeEach( ( ) => {
  fetchObservers.mockReset( );
  fetchIdentifiers.mockReset( );
  fetchObservers.mockResolvedValue( { total_results: 8, results: [] } );
  fetchIdentifiers.mockResolvedValue( { total_results: 5, results: [] } );
} );

describe( "useUserTabCounts", ( ) => {
  it( "returns the observer and identifier totals", async ( ) => {
    const { result } = renderHookInApp( ( ) => useUserTabCounts( PARAMS ) );

    await waitFor( ( ) => expect( result.current.observersCount ).toBe( 8 ) );
    expect( result.current.identifiersCount ).toBe( 5 );
  } );

  it( "asks for no results, only the totals", async ( ) => {
    renderHookInApp( ( ) => useUserTabCounts( PARAMS ) );

    await waitFor( ( ) => expect( fetchObservers ).toHaveBeenCalled( ) );
    const [observersParams] = fetchObservers.mock.calls.at( -1 );
    expect( observersParams.per_page ).toBe( 0 );
    expect( observersParams.taxon_id ).toBe( 12 );
    const [identifiersParams] = fetchIdentifiers.mock.calls.at( -1 );
    expect( identifiersParams.per_page ).toBe( 0 );
  } );

  it( "returns null counts and does not fetch when disabled", async ( ) => {
    const { result } = renderHookInApp(
      ( ) => useUserTabCounts( { taxon_id: 999 }, { enabled: false } ),
    );

    await act( async ( ) => {
      await new Promise( resolve => {
        setTimeout( resolve, 0 );
      } );
    } );
    expect( fetchObservers ).not.toHaveBeenCalled( );
    expect( fetchIdentifiers ).not.toHaveBeenCalled( );
    expect( result.current.observersCount ).toBeNull( );
    expect( result.current.identifiersCount ).toBeNull( );
  } );
} );
