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

const mockCreateId = jest.fn( );

const initialStoreState = useStore.getState( );

const mockTaxon = factory( "RemoteTaxon" );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => ( { taxon: mockTaxon } )
} ) );

const mockSuggestionsList = [{
  taxon: mockTaxon
}];

describe( "Suggestions", ( ) => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
  } );

  test( "should not have accessibility errors", async ( ) => {
    renderComponent( <Suggestions
      suggestions={mockSuggestionsList}
    /> );

    const suggestions = await screen.findByTestId( "suggestions" );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should fetch offline suggestions for current photo", async ( ) => {
    renderComponent( <Suggestions
      suggestions={mockSuggestionsList}
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
      suggestions={mockSuggestionsList}
    /> );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );

  it( "should display empty text if no suggestions are found", ( ) => {
    renderComponent( <Suggestions
      suggestions={[]}
    /> );
    const emptyText = i18next
      .t( "iNaturalist-has-no-ID-suggestions-for-this-photo" );
    expect( screen.getByText( emptyText ) ).toBeVisible( );
  } );

  it( "should display a loading wheel if suggestions are loading", ( ) => {
    renderComponent( <Suggestions
      suggestions={[]}
      loadingSuggestions
      photoUris={["uri"]}
    /> );
    const loading = screen.getByTestId( "SuggestionsList.loading" );
    expect( loading ).toBeVisible( );
  } );

  it( "should create an id when checkmark is pressed", async ( ) => {
    renderComponent( <Suggestions
      suggestions={mockSuggestionsList}
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
