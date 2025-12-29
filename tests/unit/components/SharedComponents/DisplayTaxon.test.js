import { screen } from "@testing-library/react-native";
import { DisplayTaxon } from "components/SharedComponents";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: "Aves",
  preferred_common_name: "Birds",
  default_photo: {
    url: "",
  },
} );

const taxonWithIconicTaxonPhoto = factory( "LocalTaxon", {
  name: "Pavo cristatus",
  preferred_common_name: "Peafowl",
  iconic_taxon_name: "Aves",
  default_photo: {
    url: "some url",
  },
} );

describe( "DisplayTaxon", () => {
  it( "should be accessible", () => {
    // Disabled during the update to RN 0.78
    // expect( <DisplayTaxon taxon={mockTaxon} handlePress={( ) => undefined} /> )
    //   .toBeAccessible( );
  } );

  it( "displays an iconic taxon icon when no photo is available", () => {
    renderComponent( <DisplayTaxon taxon={mockTaxon} handlePress={( ) => undefined} /> );

    expect( screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" ) );
  } );

  it( "displays an iconic taxon photo when no taxon photo is available", () => {
    renderComponent(
      <DisplayTaxon
        taxon={taxonWithIconicTaxonPhoto}
        handlePress={( ) => undefined}
      />,
    );

    expect(
      screen.getByTestId( "DisplayTaxon.image" ).props.source,
    ).toStrictEqual( { uri: taxonWithIconicTaxonPhoto?.default_photo?.url } );
  } );

  it( "displays 50% opacity when taxon id is withdrawn", () => {
    renderComponent(
      <DisplayTaxon
        taxon={taxonWithIconicTaxonPhoto}
        handlePress={( ) => undefined}
        withdrawn
      />,
    );

    expect(
      screen.getByTestId( "DisplayTaxon.image" ),
    ).toHaveStyle( { opacity: 0.5 } );
  } );
} );
