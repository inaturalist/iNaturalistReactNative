import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { Linking } from "react-native";

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
  <INatPaperProvider>
    <NavigationContainer>
      <TaxonDetails />
    </NavigationContainer>
  </INatPaperProvider>
);

jest.mock(
  "../../../../src/sharedHooks/useAuthenticatedQuery",
  ( ) => ( {
    __esModule: true,
    default: ( queryKey, _queryFunction ) => {
      if ( queryKey[0] === "fetchTaxon" ) {
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
  } )
);

test( "renders taxon details from API call", async ( ) => {
  renderTaxonDetails( );
  expect( screen.getByTestId( `TaxonDetails.${mockTaxon.id}` ) ).toBeTruthy( );
  expect( screen.getByTestId( "PhotoScroll.photo" ).props.source )
    .toStrictEqual( { uri: mockTaxon.taxonPhotos[0].photo.url } );
  expect( screen.getByText( mockTaxon.preferred_common_name ) ).toBeTruthy( );
  expect( screen.getByText( mockTaxon.wikipedia_summary ) ).toBeTruthy( );
} );

test( "should not have accessibility errors", ( ) => {
  const taxonDetails = (
    <INatPaperProvider>
      <NavigationContainer>
        <TaxonDetails />
      </NavigationContainer>
    </INatPaperProvider>
  );
  expect( taxonDetails ).toBeAccessible( );
} );

test( "navigates to Wikipedia on button press", async ( ) => {
  renderTaxonDetails( );
  fireEvent.press( screen.getByTestId( "TaxonDetails.wikipedia" ) );
  expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
  expect( Linking.openURL ).toHaveBeenCalledWith( mockTaxon.wikipedia_url );
} );
