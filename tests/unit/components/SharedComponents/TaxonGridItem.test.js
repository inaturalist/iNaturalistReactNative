import {
  fireEvent,
  screen
} from "@testing-library/react-native";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem.tsx";
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
    } ),
    useRoute: ( ) => ( {

    } ),
    useNavigationState: jest.fn( )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: ( ) => ( {
    data: {
      total_results: 0
    }
  } )
} ) );

const renderTaxonGridItem = ( ) => renderComponent(
  <TaxonGridItem taxon={mockTaxon} />
);

describe( "TaxonGridItem", ( ) => {
  it( "should be accessible", ( ) => {
    // Disabled during the update to RN 0.78
    // expect( <TaxonGridItem taxon={mockTaxon} /> ).toBeAccessible();
  } );

  it( "should navigate to user profile on tap", ( ) => {
    renderTaxonGridItem( );
    fireEvent.press( screen.getByTestId( `TaxonGridItem.Pressable.${mockTaxon.id}` ) );
    expect( mockedNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
      name: "TaxonDetails",
      params: { id: mockTaxon.id }
    } ) );
  } );
} );
