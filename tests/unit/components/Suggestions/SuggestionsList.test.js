import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import SuggestionsList from "components/Suggestions/SuggestionsList";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.name.firstName( ),
  preferred_common_name: faker.name.fullName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  }
} );

const mockSuggestionsList = [{
  combined_score: 90.34,
  taxon: {
    ...mockTaxon,
    id: faker.datatype.number( )
  }
}, {
  combined_score: 30.32,
  taxon: {
    ...mockTaxon,
    id: faker.datatype.number( )
  }
}];

const mockCreateId = jest.fn( );

const renderSuggestionsList = ( ) => renderComponent(
  <SuggestionsList
    nearbySuggestions={mockSuggestionsList}
    setLoading={jest.fn( )}
    createId={mockCreateId}
  />
);

describe( "SuggestionsList", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should render a top suggestion", ( ) => {
    renderSuggestionsList( );
    const topSuggestion = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`
    );
    expect( topSuggestion ).toBeVisible( );
  } );

  it( "should render other suggestions", ( ) => {
    renderSuggestionsList( );
    const secondSuggestion = screen.getByTestId(
      `SuggestionsList.taxa.${mockSuggestionsList[1].taxon.id}`
    );
    expect( secondSuggestion ).toBeVisible( );
  } );

  it( "should display empty text if no suggestions are found", ( ) => {
    renderComponent(
      <SuggestionsList
        nearbySuggestions={[]}
      />
    );
    const emptyText = i18next
      .t( "iNaturalist-isnt-able-to-provide-a-top-ID-suggestion-for-this-photo" );
    expect( screen.getByText( emptyText ) ).toBeVisible( );
  } );

  it( "should display a loading wheel if suggestions are loading", ( ) => {
    renderComponent(
      <SuggestionsList
        nearbySuggestions={[]}
        loadingSuggestions
      />
    );
    const loading = screen.getByTestId( "SuggestionsList.loading" );
    expect( loading ).toBeVisible( );
  } );

  it( "should create an id when checkmark is pressed", async ( ) => {
    renderSuggestionsList( );
    const testID = `SuggestionsList.taxa.${mockSuggestionsList[0].taxon.id}`;
    const checkmark = screen.getByTestId( `${testID}.checkmark` );
    expect( checkmark ).toBeVisible( );
    fireEvent.press( checkmark );
    await waitFor( ( ) => {
      expect( mockCreateId ).toHaveBeenCalled( );
    } );
  } );
} );
