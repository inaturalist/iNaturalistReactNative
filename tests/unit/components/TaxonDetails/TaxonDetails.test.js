import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Linking } from "react-native";

import TaxonDetails from "../../../../src/components/TaxonDetails/TaxonDetails";
import factory from "../../../factory";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

const mockTaxon = factory( "RemoteTaxon" );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockTaxon.id
      }
    } )
  };
} );

const renderTaxonDetails = ( ) => render(
  <NavigationContainer>
    <TaxonDetails />
  </NavigationContainer>
);

// Mock useQuery results
jest.mock( "@tanstack/react-query", ( ) => ( {
  useQuery: ( queryKey, _queryFunction ) => {
    if ( queryKey[0] === "taxaFetch" ) {
      return {
        data: mockTaxon,
        isLoading: false,
        isError: false
      };
    }
    return {
      data: null,
      isLoading: false,
      isError: false
    };
  }
} ) );

test( "renders taxon details from API call", async ( ) => {
  const { getByTestId, getByText } = renderTaxonDetails( );
  expect( getByTestId( `TaxonDetails.${mockTaxon.id}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source )
    .toStrictEqual( { uri: mockTaxon.taxonPhotos[0].photo.url } );
  expect( getByText( mockTaxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByText( mockTaxon.wikipedia_summary ) ).toBeTruthy( );
} );

test( "should not have accessibility errors", ( ) => {
  const taxonDetails = (
    <NavigationContainer>
      <TaxonDetails />
    </NavigationContainer>
  );
  expect( taxonDetails ).toBeAccessible( );
} );

test( "navigates to Wikipedia on button press", async ( ) => {
  const { getByTestId } = renderTaxonDetails( );
  fireEvent.press( getByTestId( "TaxonDetails.wikipedia" ) );
  expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
  expect( Linking.openURL ).toHaveBeenCalledWith( mockTaxon.wikipedia_url );
} );
