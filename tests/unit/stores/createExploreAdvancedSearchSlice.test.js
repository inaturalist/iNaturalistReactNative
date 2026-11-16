import createExploreAdvancedSearchSlice from "stores/createExploreAdvancedSearchSlice";
import useStore from "stores/useStore";

const advancedSearch = ( ) => useStore.getState( ).exploreAdvancedSearch;

beforeEach( ( ) => {
  advancedSearch( ).setAdvancedSearchMode( false );
} );

describe( "exploreAdvancedSearch", ( ) => {
  it( "starts out of advanced search mode", ( ) => {
    const slice = createExploreAdvancedSearchSlice( jest.fn( ) );

    expect( slice.exploreAdvancedSearch.advancedSearchMode ).toBe( false );
  } );

  it( "enters and leaves advanced search mode", ( ) => {
    advancedSearch( ).setAdvancedSearchMode( true );
    expect( advancedSearch( ).advancedSearchMode ).toBe( true );

    advancedSearch( ).setAdvancedSearchMode( false );
    expect( advancedSearch( ).advancedSearchMode ).toBe( false );
  } );

  it( "is not persisted, so it resets when the app restarts", ( ) => {
    advancedSearch( ).setAdvancedSearchMode( true );

    const persisted = useStore.persist.getOptions( ).partialize( useStore.getState( ) );

    expect( persisted ).not.toHaveProperty( "exploreAdvancedSearch" );
  } );
} );
