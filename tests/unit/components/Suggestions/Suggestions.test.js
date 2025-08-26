import {
  fireEvent,
  screen,
  waitFor
} from "@testing-library/react-native";
import Suggestions from "components/Suggestions/Suggestions";
import {
  initialSuggestions
} from "components/Suggestions/SuggestionsContainer.tsx";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockCreateId = jest.fn( );

const initialStoreState = useStore.getState( );

const mockTaxon = factory( "RemoteTaxon", {
  rank_level: 20
} );

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

const mockUser = factory( "LocalUser" );
// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: jest.fn( () => mockUser )
} ) );

beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

describe( "Suggestions", ( ) => {
  test( "should not have accessibility errors", async ( ) => {
    // const suggestions = (
    //   <Suggestions
    //     suggestions={initialSuggestions}
    //     handleSkip={jest.fn( )}
    //   />
    // );
    // Disabled during the update to RN 0.78
    // expect( suggestions ).toBeAccessible( );
  } );

  it( "should fetch offline suggestions for current photo", async ( ) => {
    renderComponent( <Suggestions
      suggestions={{
        ...initialSuggestions,
        otherSuggestions: mockSuggestionsList
      }}
    /> );
    const taxonTopResult = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`
    );
    await waitFor( ( ) => {
      expect( taxonTopResult ).toBeVisible( );
    } );
  } );

  it( "should display empty text if no suggestions are found", ( ) => {
    renderComponent( <Suggestions suggestions={initialSuggestions} /> );
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
      suggestions={initialSuggestions}
      isLoading
    /> );
    const loading = screen.getByTestId( "SuggestionsList.loading" );
    expect( loading ).toBeVisible( );
    const loadingText = screen.getByText( /iNaturalist is loading ID suggestions.../ );
    expect( loadingText ).toBeVisible( );
  } );

  describe( "loading from AI camera", ( ) => {
    const mockVisionResult = {
      combined_score: 90,
      taxon: mockTaxon
    };

    beforeEach( ( ) => {
      useStore.setState( { aICameraSuggestion: mockVisionResult } );
    } );

    it( "should display loading wheel and vision result when coming from AICamera", async ( ) => {
      renderComponent(
        <Suggestions
          suggestions={initialSuggestions}
          isLoading
        />
      );
      const loadingText = screen.getByText( /iNaturalist is loading ID suggestions.../ );
      expect( loadingText ).toBeVisible( );
      const displayName = await screen.findByTestId(
        `display-taxon-name.${mockVisionResult.taxon.id}`
      );
      expect( displayName ).toHaveTextContent( mockVisionResult.taxon.name, { exact: false } );
    } );

    it( "should display no vision result if not coming from AICamera", async ( ) => {
      renderComponent(
        <Suggestions
          suggestions={initialSuggestions}
          isLoading
        />
      );
      const loadingText = screen.getByText( /iNaturalist is loading ID suggestions.../ );
      expect( loadingText ).toBeVisible( );
      const taxonName = screen.queryByText( mockVisionResult.taxon.name );
      expect( taxonName ).toBeFalsy( );
    } );
  } );

  it( "should create an id when checkmark is pressed", async ( ) => {
    renderComponent( <Suggestions
      suggestions={{
        ...initialSuggestions,
        otherSuggestions: mockSuggestionsList
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
