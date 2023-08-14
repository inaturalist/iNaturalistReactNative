import { screen } from "@testing-library/react-native";
import { DisplayTaxon } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: "Aves",
  preferred_common_name: "Birds",
  default_photo: {
    url: ""
  }
} );

describe( "DisplayTaxon", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should be accessible", () => {
    expect( <DisplayTaxon taxon={mockTaxon} handlePress={( ) => { }} /> ).toBeAccessible( );
  } );

  it( "displays an iconic taxon photo when no taxon photo is available", () => {
    const noPhotoTaxon = factory( "RemoteTaxon", {
      name: "Pavo cristatus",
      preferred_common_name: "Peafowl",
      iconic_taxon_name: "Aves"
    } );
    renderComponent( <DisplayTaxon taxon={noPhotoTaxon} handlePress={( ) => { }} /> );

    const iconicTaxon = global.realm.objects( "Taxon" )
      .filtered( "name CONTAINS[c] $0", noPhotoTaxon?.iconic_taxon_name );

    expect(
      screen.getByTestId( "DisplayTaxon.image" ).props.source
    ).toStrictEqual( { uri: iconicTaxon?.[0]?.default_photo?.url } );
  } );

  it( "displays 50% opacity when taxon id is withdrawn", () => {
    const withdrawnTaxon = factory( "RemoteTaxon", {
      name: "Pavo cristatus",
      preferred_common_name: "Peafowl"
    } );

    renderComponent(
      <DisplayTaxon
        taxon={withdrawnTaxon}
        handlePress={( ) => { }}
        withdrawn
      />
    );

    expect(
      screen.getByTestId( "DisplayTaxon.image" )
    ).toHaveStyle( { opacity: 0.5 } );
  } );
} );
