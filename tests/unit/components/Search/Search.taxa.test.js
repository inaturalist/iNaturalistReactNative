import { fireEvent } from "@testing-library/react-native";
import Search from "components/Search/Search";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

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

test( "renders taxon search results from API call", ( ) => {
  const { getByTestId, getByText } = renderComponent( <Search /> );

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
  const { getByTestId } = renderComponent( <Search /> );

  fireEvent.press( getByTestId( `Search.taxa.${mockTaxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", { id: mockTaxon.id } );
} );
