import { screen } from "@testing-library/react-native";
import ObsDetailsOverview from "components/ObsDetails/ObsDetailsOverview";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  preferred_common_name: faker.person.fullName( ),
} );

describe( "ObsDetailsOverview", () => {
  it( "displays unknown text if no taxon", async ( ) => {
    renderComponent(
      <ObsDetailsOverview
        observation={{
          taxon: null,
        }}
      />,
    );

    const unknownText = screen.getByText( /Unknown/ );
    expect( unknownText ).toBeVisible( );
  } );

  it( "displays taxon", async ( ) => {
    renderComponent(
      <ObsDetailsOverview
        observation={{
          taxon: mockTaxon,
        }}
      />,
    );

    const taxonName = screen.getByText( mockTaxon.name );
    expect( taxonName ).toBeVisible( );
  } );
} );
