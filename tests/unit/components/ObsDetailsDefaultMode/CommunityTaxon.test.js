import { fireEvent, screen } from "@testing-library/react-native";
import CommunityTaxon from "components/ObsDetailsDefaultMode/CommunityTaxon";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn();
const mockKey = faker.string.uuid( );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      key: mockKey,
    } ),
    useNavigation: () => ( {
      navigate: mockNavigate,
    } ),
  };
} );

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  preferred_common_name: faker.person.fullName( ),
} );

describe( "CommunityTaxon", () => {
  it( "displays unknown text if no taxon", async ( ) => {
    renderComponent(
      <CommunityTaxon
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
      <CommunityTaxon
        observation={{
          taxon: mockTaxon,
        }}
      />,
    );

    const taxonName = screen.getByText( mockTaxon.name );
    expect( taxonName ).toBeVisible( );
  } );

  it( "navigates to taxon details on button press", async () => {
    renderComponent(
      <CommunityTaxon
        observation={{
          taxon: mockTaxon,
        }}
      />,
    );
    fireEvent.press(
      await screen.findByTestId(
        `ObsDetails.taxon.${mockTaxon.id}`,
      ),
    );
    expect( mockNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
      name: "TaxonDetails",
      params: { id: mockTaxon.id },
    } ) );
  } );
} );
