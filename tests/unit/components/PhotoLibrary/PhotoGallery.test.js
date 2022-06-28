import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import PhotoGallery from "../../../../src/components/PhotoLibrary/PhotoGallery";
import PhotoGalleryProvider from "../../../../src/providers/PhotoGalleryProvider";

const mockPhoto = factory( "DevicePhoto" );

jest.mock( "../../../../src/components/PhotoLibrary/hooks/usePhotos", ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return { photos: [mockPhoto] };
  }
} ) );

jest.mock( "../../../../src/components/PhotoLibrary/hooks/usePhotoAlbums", ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return [{
      label: "camera roll",
      value: "All",
      key: "camera roll"
    }];
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

// const mockPhotoGalleryProviderWithPhotos = selectedPhotos =>
//   PhotoGalleryProvider.mockImplementation( ( { children }: Props ): Node => (
//     <PhotoGalleryContext.Provider value={{
//       selectedPhotos
//     }}>
//       {children}
//     </PhotoGalleryContext.Provider>
//   ) );

const renderPhotoGallery = ( ) => render(
  <NavigationContainer>
    <PhotoGalleryProvider>
      <PhotoGallery />
    </PhotoGalleryProvider>
  </NavigationContainer>
);

test( "renders photos from photo gallery", ( ) => {
  const { getByTestId } = renderPhotoGallery( );

  // console.log( mockPhoto, "mock photo in test" );

  expect( getByTestId( "PhotoGallery.list" ) ).toBeTruthy( );
  expect( getByTestId( `PhotoGallery.${mockPhoto.uri}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoGallery.photo" ).props.source ).toStrictEqual( { "uri": mockPhoto.uri } );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );


test.todo( "navigates to GroupPhotos when photo is selected" );
