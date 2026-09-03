import { act } from "@testing-library/react-native";
import useApplySavedSearch from "components/Explore/ExploreV2/hooks/useApplySavedSearch";
import { defaultExploreV2Filters, EXPLORE_V2_ACTION } from "providers/ExploreV2Context";
import useStore from "stores/useStore";
import { renderHookInApp } from "tests/helpers/render";
import { savedSearch as buildSavedSearch } from "tests/helpers/savedSearch";

const mockPopTo = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useNavigation: ( ) => ( { popTo: mockPopTo } ),
} ) );

const mockDispatch = jest.fn( );
jest.mock( "providers/ExploreV2Context", ( ) => ( {
  ...jest.requireActual( "providers/ExploreV2Context" ),
  useExploreV2: ( ) => ( { dispatch: mockDispatch, state: {} } ),
} ) );

const advancedSearchMode = ( ) => useStore.getState( ).exploreV2AdvancedSearch.advancedSearchMode;

const applySearch = search => {
  const { result } = renderHookInApp( ( ) => useApplySavedSearch( ) );
  act( ( ) => result.current( search ) );
};

beforeEach( ( ) => {
  mockDispatch.mockClear( );
  mockPopTo.mockClear( );
  useStore.getState( ).exploreV2AdvancedSearch.setAdvancedSearchMode( false );
} );

describe( "useApplySavedSearch", ( ) => {
  it( "applies the search and returns to the results", ( ) => {
    const search = buildSavedSearch( );

    applySearch( search );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.APPLY_SEARCH,
      search,
    } );
    expect( mockPopTo ).toHaveBeenCalledWith( "ExploreResults" );
  } );

  it( "switches to advanced search mode for a search with filters", ( ) => {
    applySearch( buildSavedSearch( {
      filters: { ...defaultExploreV2Filters, casual: true },
    } ) );

    expect( advancedSearchMode( ) ).toBe( true );
  } );

  it( "leaves advanced search mode alone for a search without filters", ( ) => {
    applySearch( buildSavedSearch( ) );

    expect( advancedSearchMode( ) ).toBe( false );
  } );
} );
