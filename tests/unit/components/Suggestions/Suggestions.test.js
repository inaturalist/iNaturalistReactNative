import {
  fireEvent,
  screen,
  waitFor
} from "@testing-library/react-native";
import Suggestions from "components/Suggestions/Suggestions";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const initialSuggestions = {
  topSuggestion: null,
  otherSuggestions: [],
  topSuggestionType: "none",
  usingOfflineSuggestions: false,
  isLoading: true
};

const mockCreateId = jest.fn( );

const initialStoreState = useStore.getState( );

const mockTaxon = factory( "RemoteTaxon" );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: []
  } )
} ) );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => ( { taxon: mockTaxon } )
} ) );

const mockSuggestionsList = [{
  taxon: mockTaxon
}];

beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

describe( "Suggestions", ( ) => {
  test( "should not have accessibility errors", async ( ) => {
    const suggestions = (
      <Suggestions suggestions={initialSuggestions} />
    );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should fetch offline suggestions for current photo", async ( ) => {
    renderComponent( <Suggestions
      suggestions={{
        ...initialSuggestions,
        otherSuggestions: mockSuggestionsList,
        isLoading: false
      }}
    /> );
    const taxonTopResult = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`
    );
    await waitFor( ( ) => {
      expect( taxonTopResult ).toBeVisible( );
    } );
  } );

  it( "shows comment section if observation has comment", ( ) => {
    useStore.setState( {
      comment: "This is a test comment"
    } );
    renderComponent( <Suggestions
      suggestions={{
        ...initialSuggestions,
        otherSuggestions: mockSuggestionsList,
        isLoading: false
      }}
    /> );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );

  it( "should display empty text if no suggestions are found", ( ) => {
    renderComponent( <Suggestions suggestions={{
      ...initialSuggestions,
      isLoading: false
    }}
    /> );
    const emptyText = i18next
      .t( "iNaturalist-has-no-ID-suggestions-for-this-photo" );
    expect( screen.getByText( emptyText ) ).toBeVisible( );
  } );

  it( "should allow user to bypass suggestions screen", ( ) => {
    renderComponent( <Suggestions suggestions={initialSuggestions} /> );
    const bypassText = screen.getByText( /Add an ID Later/ );
    expect( bypassText ).toBeVisible( );
  } );

  it( "should display loading wheel and text when suggestions are loading", ( ) => {
    renderComponent( <Suggestions
      suggestions={{
        ...initialSuggestions
      }}
    /> );
    const loading = screen.getByTestId( "SuggestionsList.loading" );
    expect( loading ).toBeVisible( );
    const loadingText = screen.getByText( /iNaturalist is loading ID suggestions.../ );
    expect( loadingText ).toBeVisible( );
  } );

  it( "should create an id when checkmark is pressed", async ( ) => {
    renderComponent( <Suggestions
      suggestions={{
        ...initialSuggestions,
        otherSuggestions: mockSuggestionsList,
        isLoading: false
      }}
      onTaxonChosen={mockCreateId}
    /> );
    const testID = `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`;
    const checkmark = screen.getByTestId( `${testID}.checkmark` );
    expect( checkmark ).toBeVisible( );
    fireEvent.press( checkmark );
    await waitFor( ( ) => {
      expect( mockCreateId ).toHaveBeenCalled( );
    } );
  } );
} );
