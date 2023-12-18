import { faker } from "@faker-js/faker";
import { fireEvent, screen } from "@testing-library/react-native";
import Search from "components/Search/Search";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockedNavigate = jest.fn( );

const mockTaxon = factory( "RemoteTaxon", {
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( )
  }
} );

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
    } ),
    useRoute: ( ) => ( { } )
  };
} );

test( "renders taxon search results from API call", ( ) => {
  renderComponent( <Search /> );

  const commonName = mockTaxon.preferred_common_name;
  expect( screen.getByTestId( "Search.taxa" ) ).toBeTruthy( );
  expect( screen.getByTestId( `Search.${mockTaxon.id}.photo` ).props.source )
    .toStrictEqual( { uri: mockTaxon.default_photo.square_url } );
  // using RegExp to be able to search within a string
  expect( screen.getByText( new RegExp( commonName ) ) ).toBeTruthy();
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );

test( "navigates to TaxonDetails on button press", ( ) => {
  renderComponent( <Search /> );

  fireEvent.press( screen.getByTestId( `Search.taxa.${mockTaxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", { id: mockTaxon.id } );
} );
