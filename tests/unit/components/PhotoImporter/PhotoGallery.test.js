import { screen } from "@testing-library/react-native";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import initializeI18next from "i18n";
import { ObsEditContext } from "providers/contexts";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockPhoto = factory( "DevicePhoto" );

jest.mock( "components/PhotoImporter/hooks/useCameraRollPhotos", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    photos: [mockPhoto]
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
    useRoute: ( ) => ( {
    } )
  };
} );

const setStateMocked = jest.fn( );

const obsEditValue = {
  observations: [factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88
  } )],
  currentObservationIndex: 0,
  allObsPhotoUris: [],
  galleryUris: [],
  setGalleryUris: setStateMocked
};

const renderPhotoGallery = ( ) => renderComponent(
  <ObsEditContext.Provider value={obsEditValue}>
    <PhotoGallery />
  </ObsEditContext.Provider>
);

test( "renders photos from photo gallery", ( ) => {
  renderPhotoGallery( );

  const { uri } = mockPhoto.image;

  expect( screen.getByTestId( "PhotoGallery.list" ) ).toBeTruthy( );
  expect( screen.getByTestId( `PhotoGallery.${uri}` ) ).toBeTruthy( );
  expect( screen.getByTestId( "PhotoGallery.photo" ).props.source )
    .toStrictEqual( { uri } );
} );

describe( "PhotoGallery", () => {
  beforeAll( async ( ) => {
    await initializeI18next( );
  } );

  test( "should not have accessibility errors", async () => {
    renderPhotoGallery( );
    const photoGallery = await screen.findByTestId( "photo-gallery" );
    expect( photoGallery ).toBeAccessible();
  } );
} );

test.todo( "navigates to GroupPhotos when photo is selected" );
