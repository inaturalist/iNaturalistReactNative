import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import Search from "../../../../src/components/Search/Search";

const testTaxaList = [
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" )
];

const mockExpected = testTaxaList;
jest.mock( "../../../../src/sharedHooks/useRemoteSearchResults", ( ) => ( {
  __esModule: true,
  default: ( ) => mockExpected
} ) );

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

const renderSearch = ( ) => render(
  <NavigationContainer>
    <Search />
  </NavigationContainer>
);

test( "renders taxon search results from API call", ( ) => {
  const { getByTestId, getByText } = renderSearch( );

  const taxon = testTaxaList[0];

  const commonName = taxon.preferred_common_name;
  expect( getByTestId( "Search.taxa" ) ).toBeTruthy( );
  expect( getByTestId( `Search.${taxon.id}.photo` ).props.source ).toStrictEqual( { "uri": taxon.default_photo.square_url } );
  // using RegExp to be able to search within a string
  expect( getByText( new RegExp( commonName ) ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );

test( "navigates to TaxonDetails on button press", ( ) => {
  const { getByTestId } = renderSearch( );

  const taxon = testTaxaList[0];

  fireEvent.press( getByTestId( `Search.taxa.${taxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", { id: taxon.id } );
} );
