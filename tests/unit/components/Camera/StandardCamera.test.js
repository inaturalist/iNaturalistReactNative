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
      cameraUris: mockPhotoUris,
      deletePhotoFromObservation: uri => useStore.setState( {
        cameraUris: [...removePhotoFromList( mockPhotoUris, uri )]
      } )
    } );

    const { cameraUris } = useStore.getState( );

    render(
      <StandardCamera
        camera={{}}
        device={{}}
      />

    );
    const photoImage = screen.getByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[2]}`
    );
    const predeletedPhoto = screen.queryByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[2]}`
    );
    expect( predeletedPhoto ).toBeVisible( );

    fireEvent( photoImage, "onLongPress" );
    const deleteMode = screen.getByTestId(
      `PhotoCarousel.deletePhoto.${cameraUris[2]}`
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
      `PhotoCarousel.displayPhoto.${cameraUris[1]}`
    );
    expect( undeletedPhoto ).toBeVisible( );
    const deletedPhoto = screen.queryByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[2]}`
    );
    await waitFor( ( ) => {
      expect( deletedPhoto ).toBeFalsy( );
    } );
  } );
} );
