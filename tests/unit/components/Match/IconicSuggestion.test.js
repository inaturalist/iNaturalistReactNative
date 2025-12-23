import { fireEvent, screen } from "@testing-library/react-native";
import IconicSuggestion from "components/Match/IconicSuggestions/IconicSuggestion";
import React from "react";
import * as useTaxon from "sharedHooks/useTaxon";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "LocalTaxon", {
  id: 47170,
  name: "actinopterygii",
  preferred_common_name: "Ray-finned Fishes",
  rank: "class",
  rank_level: 50,
  default_photo: {
    url: "https://example.com/photo.jpg",
  },
} );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => ( { taxon: mockTaxon } ),
} ) );

describe( "IconicSuggestion", () => {
  it( "renders taxon with common name and scientific name", () => {
    renderComponent( <IconicSuggestion taxon={mockTaxon} /> );

    expect( screen.getByText( "Ray-finned Fishes" ) ).toBeVisible();
    expect( screen.getByText( "actinopterygii" ) ).toBeVisible();
  } );

  it( "calls handlePress when pressed", () => {
    const mockHandlePress = jest.fn();

    renderComponent( <IconicSuggestion taxon={mockTaxon} handlePress={mockHandlePress} /> );

    const button = screen.getByTestId( "IconicSuggestion.47170" );
    fireEvent.press( button );

    expect( mockHandlePress ).toHaveBeenCalled();
  } );

  it( "uses local taxon when fromLocal is true", () => {
    const localTaxon = factory( "LocalTaxon", {
      id: 3,
      name: "Aves",
      preferred_common_name: "Birds",
      rank: "class",
      rank_level: 50,
    } );
    jest.spyOn( useTaxon, "default" ).mockImplementation( () => ( { taxon: localTaxon } ) );

    renderComponent( <IconicSuggestion taxon={mockTaxon} fromLocal /> );

    expect( screen.getByText( "Birds" ) ).toBeVisible();
    expect( screen.getByText( "Aves" ) ).toBeVisible();
  } );

  it( "handles taxon without common name", () => {
    const taxonWithoutCommonName = factory( "LocalTaxon", {
      id: 47115,
      name: "Mollusca",
      preferred_common_name: undefined,
      rank: "phylum",
      rank_level: 60,
    } );
    jest.spyOn( useTaxon, "default" )
      .mockImplementation( () => ( { taxon: taxonWithoutCommonName } ) );

    renderComponent( <IconicSuggestion taxon={taxonWithoutCommonName} /> );

    expect( screen.getByText( "Mollusca" ) ).toBeVisible();
  } );
} );
