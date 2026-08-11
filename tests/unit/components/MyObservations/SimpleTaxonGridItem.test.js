import { screen, userEvent } from "@testing-library/react-native";
import SimpleTaxonGridItem from "components/MyObservations/SimpleTaxonGridItem";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  id: 123,
  name: "Calidris alba",
  preferred_common_name: "Sanderling",
} );

const mockSpeciesCount = { count: 3, taxon: mockTaxon };

const mockNavToTaxonDetails = jest.fn( );
const mockSearchThisTaxon = jest.fn( );

const actor = userEvent.setup( );

const renderGridItem = ( { canSearchFromSpeciesTab = false } = {} ) => renderComponent(
  <SimpleTaxonGridItem
    accessibleName="Sanderling"
    canSearchFromSpeciesTab={canSearchFromSpeciesTab}
    navToTaxonDetails={mockNavToTaxonDetails}
    searchThisTaxon={mockSearchThisTaxon}
    source={{ uri: "https://example.com/photo.jpg" }}
    speciesCount={mockSpeciesCount}
  />,
);

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  mockNavToTaxonDetails.mockClear( );
  mockSearchThisTaxon.mockClear( );
} );

describe( "SimpleTaxonGridItem", ( ) => {
  describe( "when canSearchFromSpeciesTab is false", ( ) => {
    it( "navigates to taxon details when the card is pressed", async ( ) => {
      renderGridItem( { canSearchFromSpeciesTab: false } );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockNavToTaxonDetails ).toHaveBeenCalled( );
      expect( mockSearchThisTaxon ).not.toHaveBeenCalled( );
    } );

    it( "does not render the info icon button", ( ) => {
      renderGridItem( { canSearchFromSpeciesTab: false } );

      expect( screen.queryByTestId( "SimpleTaxonGridItem.infoButton" ) ).toBeNull( );
    } );
  } );

  describe( "when canSearchFromSpeciesTab is true", ( ) => {
    it( "searches this taxon when the card is pressed", async ( ) => {
      renderGridItem( { canSearchFromSpeciesTab: true } );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockSearchThisTaxon ).toHaveBeenCalled( );
      expect( mockNavToTaxonDetails ).not.toHaveBeenCalled( );
    } );

    it( "renders the info icon button and navigates to taxon details when pressed, "
      + "without searching", async ( ) => {
      renderGridItem( { canSearchFromSpeciesTab: true } );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem.infoButton" ) );

      expect( mockNavToTaxonDetails ).toHaveBeenCalled( );
      expect( mockSearchThisTaxon ).not.toHaveBeenCalled( );
    } );
  } );
} );
