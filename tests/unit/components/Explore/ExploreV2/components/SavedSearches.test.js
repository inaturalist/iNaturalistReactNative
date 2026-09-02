import {
  fireEvent, screen, userEvent, within,
} from "@testing-library/react-native";
import SavedSearches from "components/Explore/ExploreV2/components/SavedSearches";
import initI18next from "i18n/initI18next";
import { defaultExploreV2Filters, EXPLORE_V2_ACTION } from "providers/ExploreV2Context";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";
import {
  savedSearch as buildSavedSearch,
  setSavedSearches,
  taxonSubject,
} from "tests/helpers/savedSearch";

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { id: 99, login: "tester", prefers_common_names: true } ),
} ) );

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

const savedSearch = id => buildSavedSearch( { subject: taxonSubject( id ), savedAt: id } );

const advancedSearchMode = ( ) => useStore.getState( ).exploreV2AdvancedSearch.advancedSearchMode;

const pressRow = async search => {
  const actor = userEvent.setup( );
  await actor.press( await screen.findByTestId( `SavedSearchRow.${search.key}` ) );
};

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  setSavedSearches( [] );
  mockDispatch.mockClear( );
  mockPopTo.mockClear( );
  useStore.getState( ).exploreV2AdvancedSearch.setAdvancedSearchMode( false );
} );

describe( "SavedSearches", ( ) => {
  it( "renders nothing at all, heading included, when there is nothing saved", ( ) => {
    renderComponent( <SavedSearches /> );

    expect( screen.queryByTestId( "SavedSearches" ) ).toBeNull( );
    expect( screen.queryByText( "Saved searches" ) ).toBeNull( );
  } );

  it( "heads the list with its name", async ( ) => {
    setSavedSearches( [savedSearch( 1 ), savedSearch( 2 )] );

    renderComponent( <SavedSearches /> );

    const header = await screen.findByTestId( "SavedSearches.header" );
    expect( within( header ).getByText( "Saved searches" ) ).toBeVisible( );
  } );

  it( "leaves out the header where the caller already names the list", async ( ) => {
    setSavedSearches( [savedSearch( 1 )] );

    renderComponent( <SavedSearches hideHeader /> );

    expect( await screen.findByTestId( "SavedSearches" ) ).toBeVisible( );
    expect( screen.queryByTestId( "SavedSearches.header" ) ).toBeNull( );
  } );

  it( "applies the tapped search and returns to the results", async ( ) => {
    const search = savedSearch( 1 );
    setSavedSearches( [search] );

    renderComponent( <SavedSearches /> );
    await pressRow( search );

    expect( mockDispatch ).toHaveBeenCalledWith( {
      type: EXPLORE_V2_ACTION.APPLY_SEARCH,
      search,
    } );
    expect( mockPopTo ).toHaveBeenCalledWith( "ExploreResults" );
  } );

  it( "switches to advanced search mode for a search with filters", async ( ) => {
    const search = buildSavedSearch( {
      filters: { ...defaultExploreV2Filters, casual: true },
    } );
    setSavedSearches( [search] );

    renderComponent( <SavedSearches /> );
    await pressRow( search );

    expect( advancedSearchMode( ) ).toBe( true );
  } );

  it( "drops a row from the store when its delete action is used", async ( ) => {
    const search = savedSearch( 1 );
    setSavedSearches( [search] );

    renderComponent( <SavedSearches /> );
    fireEvent(
      await screen.findByTestId( `SavedSearchRow.${search.key}` ),
      "accessibilityAction",
      { nativeEvent: { actionName: "delete" } },
    );

    expect( useStore.getState( ).exploreSavedSearches.searches ).toEqual( [] );
  } );

  it( "keeps the swipe-away delete button out of the accessibility tree", async ( ) => {
    const search = savedSearch( 1 );
    setSavedSearches( [search] );

    renderComponent( <SavedSearches /> );
    await screen.findByTestId( `SavedSearchRow.${search.key}` );

    expect( screen.queryByTestId( `SavedSearchRow.delete.${search.key}` ) ).toBeNull( );
    expect( screen.getByTestId(
      `SavedSearchRow.delete.${search.key}`,
      { includeHiddenElements: true },
    ) ).toBeTruthy( );
  } );
} );
