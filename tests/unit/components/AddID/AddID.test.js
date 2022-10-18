import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import AddID from "components/ObsEdit/AddID";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../../../factory";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

const mockTaxaList = [
  { taxon: factory( "RemoteTaxon" ) },
  { taxon: factory( "RemoteTaxon" ) },
  { taxon: factory( "RemoteTaxon" ) }
];

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockTaxaList
  } )
} ) );

const queryClient = new QueryClient( );

const renderAddID = route => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <AddID route={route} />
    </NavigationContainer>
  </QueryClientProvider>
);

test( "renders taxon search results", async ( ) => {
  inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
  const route = { params: { } };
  const { getByTestId } = renderAddID( route );

  const input = getByTestId( "SearchTaxon" );
  await waitFor( () => {
    fireEvent.changeText( input, "Some taxon" );
  } );

  const { taxon } = mockTaxaList[0];

  expect( getByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy( );
  expect(
    getByTestId( `Search.taxa.${taxon.id}.photo` ).props.source
  ).toStrictEqual( { uri: taxon.default_photo.square_url } );
} );
