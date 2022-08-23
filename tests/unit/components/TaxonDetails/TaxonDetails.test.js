import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-hooks";
import { fireEvent, render } from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import React from "react";
import { Linking } from "react-native";

import TaxonDetails from "../../../../src/components/TaxonDetails/TaxonDetails";
import fetchTaxa from "../../../../src/lib/taxaFetchAPI";
import factory, { makeResponse } from "../../../factory";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

const testTaxon = factory( "RemoteTaxon" );
const mockExpected = testTaxon;

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockExpected.id
      }
    } )
  };
} );

// set cacheTime to infinity to avoid 'Jest did not exit...' error message
// https://tanstack.com/query/v4/docs/guides/testing#set-cachetime-to-infinity-with-jest
const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      cacheTime: Infinity
    }
  }
} );

const wrapper = ( { children } ) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderTaxonDetails = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <TaxonDetails />
    </NavigationContainer>
  </QueryClientProvider>
);

function useFetchData() {
  return useQuery( ["taxaFetch"], ( ) => fetchTaxa( 1 ) );
}

test( "renders taxon details from API call", async ( ) => {
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [mockExpected] ) );
  const { result, waitFor } = renderHook( () => useFetchData(), { wrapper } );
  await waitFor( () => result.current.isSuccess );
  const { getByTestId, getByText } = renderTaxonDetails( );

  expect( getByTestId( `TaxonDetails.${testTaxon.id}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source )
    .toStrictEqual( { uri: testTaxon.taxonPhotos[0].photo.url } );
  expect( getByText( testTaxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByText( testTaxon.wikipedia_summary ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
// test( "should not have accessibility errors", ( ) => {
//   const taxonDetails = (
//     <NavigationContainer>
//       <TaxonDetails />
//     </NavigationContainer>
//   );
//   expect( taxonDetails ).toBeAccessible( );
// } );

test( "navigates to Wikipedia on button press", async ( ) => {
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [mockExpected] ) );
  const { result, waitFor } = renderHook( () => useFetchData(), { wrapper } );
  await waitFor( () => result.current.isSuccess );

  expect( result.current.data.wikipedia_url ).toEqual( testTaxon.wikipedia_url );
  const { getByTestId } = renderTaxonDetails( );

  fireEvent.press( getByTestId( "TaxonDetails.wikipedia" ) );
  expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
  expect( Linking.openURL ).toHaveBeenCalledWith( testTaxon.wikipedia_url );
} );
