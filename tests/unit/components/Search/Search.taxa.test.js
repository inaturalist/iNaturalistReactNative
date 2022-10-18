import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import Search from "components/Search/Search";
import React from "react";

import factory from "../../../factory";

const testTaxaList = [
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" )
];

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
  expect( getByTestId( `Search.${taxon.id}.photo` ).props.source )
    .toStrictEqual( { uri: taxon.default_photo.square_url } );
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

const testUserList = [
  factory( "RemoteUser" )
];

test( "displays user search results on button press", ( ) => {
  const { getByTestId, getByText } = renderSearch( );

  const user = testUserList[0];
  const { login } = user;
  const button = getByTestId( "Search.users" );

  fireEvent.press( button );
  expect( getByTestId( `Search.user.${login}` ) ).toBeTruthy( );
  expect( getByTestId( `Search.${login}.photo` ).props.source ).toStrictEqual( { uri: user.icon } );
  expect( getByText( new RegExp( login ) ) ).toBeTruthy( );
} );

test( "navigates to user profile on button press", ( ) => {
  const { getByTestId } = renderSearch( );

  const user = testUserList[0];
  const { login } = user;
  const button = getByTestId( "Search.users" );

  fireEvent.press( button );
  fireEvent.press( getByTestId( `Search.user.${login}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", { userId: user.id } );
} );
