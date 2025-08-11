import { render, screen } from "@testing-library/react-native";
import { IconicTaxonChooser } from "components/SharedComponents";
import React from "react";
import factory from "tests/factory";

const mockData = [factory( "RemoteTaxon" )];

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockData
  } )
} ) );

describe( "IconicTaxonChooser", () => {
  it( "should be accessible", () => {
    // const mockTaxon = factory( "RemoteTaxon", {
    //   name: "Aves"
    // } );
    // Disabled during the update to RN 0.78
    // expect(
    //   <IconicTaxonChooser chosen={[mockTaxon.name.toLowerCase()]} />
    // ).toBeAccessible( );
  } );

  it( "should show an iconic taxa as selected", async ( ) => {
    const mockTaxon = factory( "RemoteTaxon", {
      name: "Plantae",
      iconic_taxon_name: "Plantae"
    } );

    render( <IconicTaxonChooser chosen={[mockTaxon.name.toLowerCase()]} /> );

    const plantButton = await screen.findByTestId(
      `IconicTaxonButton.${mockTaxon.name.toLowerCase( )}`
    );
    const birdButton = await screen.findByTestId( "IconicTaxonButton.aves" );

    expect( plantButton ).toBeSelected();
    expect( birdButton ).not.toBeSelected();
  } );
} );
