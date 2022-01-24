import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import PhotoGallery from "../../../../src/components/PhotoLibrary/PhotoGallery";

const mockPhoto = factory( "DevicePhoto" );

jest.mock( "../../../../src/components/PhotoLibrary/hooks/usePhotos", ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return [mockPhoto];
  }
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

const renderPhotoGallery = ( ) => render(
  <NavigationContainer>
    <PhotoGallery />
  </NavigationContainer>
);

test( "renders photos from photo gallery", ( ) => {
  const { getByTestId } = renderPhotoGallery( );

  expect( getByTestId( "PhotoGallery.list" ) ).toBeTruthy( );
  expect( getByTestId( `PhotoGallery.${mockPhoto.uri}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoGallery.photo" ).props.source ).toStrictEqual( { "uri": mockPhoto.uri } );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );


test( "navigates to Obs Edit when photo is selected", ( ) => {
  const { getByTestId } = renderPhotoGallery( );

  fireEvent.press( getByTestId( `PhotoGallery.${mockPhoto.uri}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "ObsEdit", { photo: mockPhoto } );
} );
