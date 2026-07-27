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

let mockSearchMyObservationsEnabled = false;

jest.mock( "sharedHooks/useFeatureFlag", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => mockSearchMyObservationsEnabled ),
} ) );

const mockNavToTaxonDetails = jest.fn( );
const mockSearchThisTaxon = jest.fn( );

const actor = userEvent.setup( );

const renderGridItem = ( ) => renderComponent(
  <SimpleTaxonGridItem
    accessibleName="Sanderling"
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
  mockSearchMyObservationsEnabled = false;
  mockNavToTaxonDetails.mockClear( );
  mockSearchThisTaxon.mockClear( );
} );

describe( "SimpleTaxonGridItem", ( ) => {
  describe( "when the search feature flag is disabled", ( ) => {
    it( "navigates to taxon details when the card is pressed", async ( ) => {
      renderGridItem( );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockNavToTaxonDetails ).toHaveBeenCalled( );
      expect( mockSearchThisTaxon ).not.toHaveBeenCalled( );
    } );

    it( "does not render the info icon button", ( ) => {
      renderGridItem( );

      expect( screen.queryByTestId( "SimpleTaxonGridItem.infoButton" ) ).toBeNull( );
    } );
  } );

  describe( "when the search feature flag is enabled", ( ) => {
    beforeEach( ( ) => {
      mockSearchMyObservationsEnabled = true;
    } );

    it( "searches this taxon when the card is pressed", async ( ) => {
      renderGridItem( );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockSearchThisTaxon ).toHaveBeenCalled( );
      expect( mockNavToTaxonDetails ).not.toHaveBeenCalled( );
    } );

    it( "renders the info icon button and navigates to taxon details when pressed, "
      + "without searching", async ( ) => {
      renderGridItem( );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem.infoButton" ) );

      expect( mockNavToTaxonDetails ).toHaveBeenCalled( );
      expect( mockSearchThisTaxon ).not.toHaveBeenCalled( );
    } );
  } );
} );
