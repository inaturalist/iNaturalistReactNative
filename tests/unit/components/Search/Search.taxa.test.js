import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react-native";
import Search from "components/Search/Search";
import React from "react";

import factory from "../../../factory";

const mockedNavigate = jest.fn( );

const mockTaxon = factory( "RemoteTaxon" );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockTaxon]
  } )
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

const queryClient = new QueryClient( );

const renderSearch = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <Search />
    </NavigationContainer>
  </QueryClientProvider>
);

test( "renders taxon search results from API call", ( ) => {
  const { getByTestId, getByText } = renderSearch( );

  const commonName = mockTaxon.preferred_common_name;
  expect( getByTestId( "Search.taxa" ) ).toBeTruthy( );
  expect( getByTestId( `Search.${mockTaxon.id}.photo` ).props.source )
    .toStrictEqual( { uri: mockTaxon.default_photo.square_url } );
  // using RegExp to be able to search within a string
  expect( getByText( new RegExp( commonName ) ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );

test( "navigates to TaxonDetails on button press", ( ) => {
  const { getByTestId } = renderSearch( );

  fireEvent.press( getByTestId( `Search.taxa.${mockTaxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", { id: mockTaxon.id } );
} );
