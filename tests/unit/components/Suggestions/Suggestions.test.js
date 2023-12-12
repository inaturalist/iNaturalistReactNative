import {
  fireEvent,
  screen, waitFor
} from "@testing-library/react-native";
import Suggestions from "components/Suggestions/Suggestions";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockCreateId = jest.fn( );

const initialStoreState = useStore.getState( );

const mockSuggestionsList = [{
  taxon: factory( "RemoteTaxon" )
}];

describe( "Suggestions", ( ) => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
    await initI18next( );
  } );

  test( "should not have accessibility errors", async ( ) => {
    renderComponent( <Suggestions
      nearbySuggestions={mockSuggestionsList}
    /> );

    const suggestions = await screen.findByTestId( "suggestions" );
    expect( suggestions ).toBeAccessible( );
  } );

  it( "should fetch offline suggestions for current photo", async ( ) => {
    renderComponent( <Suggestions
      nearbySuggestions={mockSuggestionsList}
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
      nearbySuggestions={mockSuggestionsList}
    /> );
    const commentSection = screen.getByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeVisible( );
  } );

  it( "should display empty text if no suggestions are found", ( ) => {
    renderComponent( <Suggestions
      nearbySuggestions={[]}
    /> );
    const emptyText = i18next
      .t( "iNaturalist-isnt-able-to-provide-a-top-ID-suggestion-for-this-photo" );
    expect( screen.getByText( emptyText ) ).toBeVisible( );
  } );

  it( "should display a loading wheel if suggestions are loading", ( ) => {
    renderComponent( <Suggestions
      nearbySuggestions={[]}
      loadingSuggestions
    /> );
    const loading = screen.getByTestId( "SuggestionsList.loading" );
    expect( loading ).toBeVisible( );
  } );

  it( "should create an id when checkmark is pressed", async ( ) => {
    renderComponent( <Suggestions
      nearbySuggestions={mockSuggestionsList}
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
