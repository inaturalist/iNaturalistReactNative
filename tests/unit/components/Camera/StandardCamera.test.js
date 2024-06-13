import {
  fireEvent, render, screen, waitFor
} from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera/StandardCamera";
import React from "react";
import useStore from "stores/useStore";

jest.mock( "components/MediaViewer/MediaViewerModal", ( ) => jest.fn( ( ) => null ) );

const initialStoreState = useStore.getState( );

const mockPhotoUris = [
  "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/2/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/3/large.jpeg"
];

describe( "StandardCamera", ( ) => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );

  it( "deletes a photo on long press", async ( ) => {
    const removePhotoFromList = ( list, photo ) => {
      const i = list.findIndex( p => p === photo );
      list.splice( i, 1 );
      return list || [];
    };

    useStore.setState( {
      evidenceToAdd: [mockPhotoUris[2]],
      rotatedOriginalCameraPhotos: mockPhotoUris,
      deletePhotoFromObservation: uri => useStore.setState( {
        rotatedOriginalCameraPhotos: [...removePhotoFromList( mockPhotoUris, uri )]
      } )
    } );

    const { rotatedOriginalCameraPhotos } = useStore.getState( );

    render(
      // <StandardCamera
      //   photoUris={rotatedOriginalCameraPhotos}
      // />
      <StandardCamera
        camera={{}}
        device={{}}
      />

    );
    const photoImage = screen.getByTestId(
      `PhotoCarousel.displayPhoto.${rotatedOriginalCameraPhotos[2]}`
    );
    fireEvent( photoImage, "onLongPress" );
    const deleteMode = screen.getByTestId(
      `PhotoCarousel.deletePhoto.${rotatedOriginalCameraPhotos[2]}`
    );
    await waitFor( ( ) => {
      expect( deleteMode ).toBeVisible( );
    } );
    fireEvent.press( deleteMode );

    render(
      <StandardCamera
        camera={{}}
        device={{}}
      />
    );

    const undeletedPhoto = screen.getByTestId(
      `PhotoCarousel.displayPhoto.${rotatedOriginalCameraPhotos[1]}`
    );
    expect( undeletedPhoto ).toBeVisible( );
    const deletedPhoto = screen.queryByTestId(
      `PhotoCarousel.displayPhoto.${rotatedOriginalCameraPhotos[2]}`
    );
    await waitFor( ( ) => {
      expect( deletedPhoto ).toBeFalsy( );
    } );
  } );
} );
