import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import SuggestionsList from "components/Suggestions/SuggestionsList";
import initI18next from "i18n/initI18next";
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

const mockTaxonSelection = jest.fn( );

const renderSuggestionsList = ( ) => renderComponent(
  <SuggestionsList
    nearbySuggestions={mockSuggestionsList}
    onTaxonChosen={mockTaxonSelection}
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
} );
