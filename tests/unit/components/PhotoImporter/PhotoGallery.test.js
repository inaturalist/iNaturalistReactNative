import { faker } from "@faker-js/faker";
import { fireEvent, screen } from "@testing-library/react-native";
import PhotoGalleryContainer from "components/PhotoImporter/PhotoGalleryContainer";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import { renderComponent } from "../../../helpers/render";

jest.mock( "providers/ObsEditProvider" );

const mockPhotos = [{
  image: {
    uri: faker.image.imageUrl( )
  }
}, {
  image: {
    uri: `${faker.image.imageUrl( )}/100}`
  }
}
];

jest.mock( "components/PhotoImporter/hooks/useCameraRollPhotos", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    photos: mockPhotos
  } )
} ) );

jest.mock( "components/PhotoImporter/hooks/usePhotoAlbums", ( ) => ( {
  __esModule: true,
  default: ( ) => [{
    label: "camera roll",
    value: "All",
    key: "camera roll"
  }]
} ) );

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate,
      setOptions: jest.fn( )
    } ),
    useRoute: ( ) => jest.fn( )
  };
} );

const mockSetGalleryUris = jest.fn( );

const obsEditValue = {
  totalObsPhotoUris: 6,
  galleryUris: [],
  setGalleryUris: mockSetGalleryUris
};

const mockObsEditProvider = ( ) => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <ObsEditContext.Provider value={obsEditValue}>
    {children}
  </ObsEditContext.Provider>
) );

const renderPhotoGallery = ( ) => renderComponent(
  <ObsEditProvider>
    <PhotoGalleryContainer />
  </ObsEditProvider>
);

describe( "PhotoGallery", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  test( "renders photos from photo gallery", ( ) => {
    mockObsEditProvider( );
    renderPhotoGallery( );

    const { uri } = mockPhotos[0].image;

    expect( screen.getByTestId( "PhotoGallery.list" ) ).toBeTruthy( );
    expect( screen.getByTestId( `PhotoGallery.${uri}` ) ).toBeTruthy( );
    expect( screen.getByTestId( `PhotoGallery.photo.${uri}` ).props.source )
      .toStrictEqual( { uri } );
  } );

  it( "resets gallery uris when a photo is selected", async ( ) => {
    mockObsEditProvider( );
    renderPhotoGallery( );
    const photo = screen.getByTestId( `PhotoGallery.${mockPhotos[0].image.uri}` );
    fireEvent.press( photo );
    expect( mockSetGalleryUris ).toHaveBeenCalledTimes( 1 );
  } );

  // it( "should not have accessibility errors", async () => {
  //   mockObsEditProvider( );
  //   renderPhotoGallery( );
  //   const photoGallery = await screen.findByTestId( "photo-gallery" );
  //   expect( photoGallery ).toBeAccessible();
  // } );

  test.todo( "should not have accessibility errors" );
} );
