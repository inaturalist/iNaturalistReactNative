import { render, screen } from "@testing-library/react-native";
import { IconicTaxonChooser } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";

const mockIconicTaxa = [
  factory( "RemoteTaxon", {
    name: "Aves",
    preferred_common_name: "Birds"
  } ),
  factory( "RemoteTaxon", {
    name: "Plantae",
    preferred_common_name: "Plants"
  } )
];

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockIconicTaxa
  } )
} ) );

describe( "IconicTaxonChooser", () => {
  beforeAll( async () => {
    await initI18next( );
  } );

  it( "should be accessible", () => {
    const mockTaxon = factory( "RemoteTaxon", {
      name: "Aves"
    } );
    expect(
      <IconicTaxonChooser taxon={mockTaxon} />
    ).toBeAccessible( );
  } );

  it( "should show an iconic taxa as selected", async ( ) => {
    const mockTaxon = factory( "RemoteTaxon", {
      name: "Plantae",
      iconic_taxon_name: "Plantae"
    } );

    render( <IconicTaxonChooser taxon={mockTaxon} /> );

    const plantButton = await screen.findByTestId(
      `IconicTaxonButton.${mockTaxon.name.toLowerCase( )}`
    );
    const birdButton = await screen.findByTestId( "IconicTaxonButton.aves" );

    expect( plantButton ).toHaveAccessibilityState( { selected: true } );
    expect( birdButton ).toHaveAccessibilityState( { selected: false } );
  } );
} );
