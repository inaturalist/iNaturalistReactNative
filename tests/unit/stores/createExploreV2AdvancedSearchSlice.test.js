import createExploreV2AdvancedSearchSlice from "stores/createExploreV2AdvancedSearchSlice";
import useStore from "stores/useStore";

const advancedSearch = ( ) => useStore.getState( ).exploreV2AdvancedSearch;

beforeEach( ( ) => {
  advancedSearch( ).setAdvancedSearchMode( false );
} );

describe( "exploreV2AdvancedSearch", ( ) => {
  it( "starts out of advanced search mode", ( ) => {
    const slice = createExploreV2AdvancedSearchSlice( jest.fn( ) );

    expect( slice.exploreV2AdvancedSearch.advancedSearchMode ).toBe( false );
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

    expect( persisted ).not.toHaveProperty( "exploreV2AdvancedSearch" );
  } );
} );
