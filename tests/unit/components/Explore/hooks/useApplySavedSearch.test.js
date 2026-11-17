import { act } from "@testing-library/react-native";
import useApplySavedSearch from "components/Explore/hooks/useApplySavedSearch";
import { defaultExploreFilters, EXPLORE_ACTION } from "providers/ExploreContext";
import useStore from "stores/useStore";
import { renderHookInApp } from "tests/helpers/render";
import { savedSearch as buildSavedSearch } from "tests/helpers/savedSearch";

const mockPopTo = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useNavigation: ( ) => ( { popTo: mockPopTo } ),
} ) );

const mockDispatch = jest.fn( );
jest.mock( "providers/ExploreContext", ( ) => ( {
  ...jest.requireActual( "providers/ExploreContext" ),
  useExplore: ( ) => ( { dispatch: mockDispatch, state: {} } ),
} ) );

const advancedSearchMode = ( ) => useStore.getState( ).exploreAdvancedSearch.advancedSearchMode;

const applySearch = search => {
  const { result } = renderHookInApp( ( ) => useApplySavedSearch( ) );
  act( ( ) => result.current( search ) );
};

beforeEach( ( ) => {
  mockDispatch.mockClear( );
  mockPopTo.mockClear( );
  useStore.getState( ).exploreAdvancedSearch.setAdvancedSearchMode( false );
} );

describe( "useApplySavedSearch", ( ) => {
  it( "applies the search and returns to the results", ( ) => {
    const search = buildSavedSearch( );

    applySearch( search );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_ACTION.APPLY_SEARCH,
      search,
    } );
    expect( mockPopTo ).toHaveBeenCalledWith( "ExploreResults" );
  } );

  it( "switches to advanced search mode for a search with filters", ( ) => {
    applySearch( buildSavedSearch( {
      filters: { ...defaultExploreFilters, casual: true },
    } ) );

    expect( advancedSearchMode( ) ).toBe( true );
  } );

  it( "leaves advanced search mode alone for a search without filters", ( ) => {
    applySearch( buildSavedSearch( ) );

    expect( advancedSearchMode( ) ).toBe( false );
  } );
} );
