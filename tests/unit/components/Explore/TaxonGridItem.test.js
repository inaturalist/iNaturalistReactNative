import {
  fireEvent,
  screen
} from "@testing-library/react-native";
import TaxonGridItem from "components/Explore/TaxonGridItem";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon" );

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate
    } )
  };
} );

describe( "TaxonGridItem", ( ) => {
  it( "should be accessible", ( ) => {
    const taxonGridItem = (
      <TaxonGridItem
        taxon={mockTaxon}
      />
    );
    expect( taxonGridItem ).toBeAccessible();
  } );

  it( "should navigate to user profile on tap", ( ) => {
    renderComponent( <TaxonGridItem
      taxon={mockTaxon}
    /> );
    fireEvent.press( screen.getByTestId( `TaxonGridItem.Pressable.${mockTaxon.id}` ) );
    expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", { id: mockTaxon.id } );
  } );
} );
