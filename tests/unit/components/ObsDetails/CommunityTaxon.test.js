import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import CommunityTaxon from "components/ObsDetails/CommunityTaxon";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  preferred_common_name: faker.person.fullName( )
} );

describe( "CommunityTaxon", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "displays unknown text if no taxon", async ( ) => {
    renderComponent(
      <CommunityTaxon
        observation={{
          taxon: null
        }}
      />
    );

    const unknownText = screen.getByText( /Unknown/ );
    expect( unknownText ).toBeVisible( );
  } );

  it( "displays taxon", async ( ) => {
    renderComponent(
      <CommunityTaxon
        observation={{
          taxon: mockTaxon
        }}
      />
    );

    const taxonName = screen.getByText( mockTaxon.name );
    expect( taxonName ).toBeVisible( );
  } );
} );
