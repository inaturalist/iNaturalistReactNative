import {
  fireEvent, screen, userEvent, within,
} from "@testing-library/react-native";
import SavedSearches from "components/Explore/ExploreV2/components/SavedSearches";
import initI18next from "i18n/initI18next";
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

const mockOnSelect = jest.fn( );

const savedSearch = id => buildSavedSearch( { subject: taxonSubject( id ), savedAt: id } );

const pressRow = async search => {
  const actor = userEvent.setup( );
  await actor.press( await screen.findByTestId( `SavedSearchRow.${search.key}` ) );
};

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  setSavedSearches( [] );
  mockOnSelect.mockClear( );
} );

describe( "SavedSearches", ( ) => {
  it( "renders nothing at all, heading included, when there is nothing saved", ( ) => {
    renderComponent( <SavedSearches onSelect={mockOnSelect} /> );

    expect( screen.queryByTestId( "SavedSearches" ) ).toBeNull( );
    expect( screen.queryByText( "Saved searches" ) ).toBeNull( );
  } );

  it( "heads the list with its name", async ( ) => {
    setSavedSearches( [savedSearch( 1 ), savedSearch( 2 )] );

    renderComponent( <SavedSearches onSelect={mockOnSelect} /> );

    const header = await screen.findByTestId( "SavedSearches.header" );
    expect( within( header ).getByText( "Saved searches" ) ).toBeVisible( );
  } );

  it( "leaves out the header where the caller already names the list", async ( ) => {
    setSavedSearches( [savedSearch( 1 )] );

    renderComponent( <SavedSearches hideHeader onSelect={mockOnSelect} /> );

    expect( await screen.findByTestId( "SavedSearches" ) ).toBeVisible( );
    expect( screen.queryByTestId( "SavedSearches.header" ) ).toBeNull( );
  } );

  it( "hands the tapped search to the caller", async ( ) => {
    const search = savedSearch( 1 );
    setSavedSearches( [search] );

    renderComponent( <SavedSearches onSelect={mockOnSelect} /> );
    await pressRow( search );

    expect( mockOnSelect ).toHaveBeenCalledWith( search );
  } );

  it( "drops a row from the store when its delete action is used", async ( ) => {
    const search = savedSearch( 1 );
    setSavedSearches( [search] );

    renderComponent( <SavedSearches onSelect={mockOnSelect} /> );
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

    renderComponent( <SavedSearches onSelect={mockOnSelect} /> );
    await screen.findByTestId( `SavedSearchRow.${search.key}` );

    expect( screen.queryByTestId( `SavedSearchRow.delete.${search.key}` ) ).toBeNull( );
    expect( screen.getByTestId(
      `SavedSearchRow.delete.${search.key}`,
      { includeHiddenElements: true },
    ) ).toBeTruthy( );
  } );
} );
