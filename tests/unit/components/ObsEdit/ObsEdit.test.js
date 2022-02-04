import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import ObsEdit from "../../../../src/components/ObsEdit/ObsEdit";

const mockPhoto = factory( "DevicePhoto" );

const mockLocationName = "San Francisco, CA";

const mockGroupedPhotos = [{
  observationPhotos: [
    mockPhoto
  ]
}];

jest.mock( "../../../../src/sharedHooks/useLocationName" , ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return mockLocationName;
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        photo: mockPhoto,
        obsToEdit: mockGroupedPhotos
      }
    } )
  };
} );

const renderObsEdit = ( ) => render(
  <NavigationContainer>
    <ObsEdit />
  </NavigationContainer>
);

test( "renders observation photo from photo gallery", ( ) => {
  const { getByTestId, getByText } = renderObsEdit( );

  const { longitude } = mockPhoto.location;

  expect( getByTestId( "ObsEdit.photo" ).props.source ).toStrictEqual( { "uri": mockPhoto.uri } );
  expect( getByText( mockLocationName ) ).toBeTruthy( );
  expect( getByText( new RegExp( longitude ) ) ).toBeTruthy( );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );
