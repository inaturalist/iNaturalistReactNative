import {
  fireEvent, screen, waitFor
} from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera/StandardCamera";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/MediaViewer/MediaViewerModal", ( ) => jest.fn( ( ) => null ) );

const initialStoreState = useStore.getState( );

const mockPhotoUris = [
  "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/2/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/3/large.jpeg"
];

const mockObservation = factory( "RemoteObservation", {
  observationPhotos: [
    factory( "RemoteObservationPhoto", {
      photo: factory( "RemotePhoto", {
        url: mockPhotoUris[0]
      } )
    } ),
    factory( "RemoteObservationPhoto", {
      photo: factory( "RemotePhoto", {
        url: mockPhotoUris[1]
      } )
    } ),
    factory( "RemoteObservationPhoto", {
      photo: factory( "RemotePhoto", {
        url: mockPhotoUris[2]
      } )
    } )
  ]
} );

const renderCamera = ( ) => renderComponent(
  <StandardCamera
    camera={{}}
    device={{}}
    setNewPhotoUris={jest.fn( )}
    newPhotoUris={[]}
  />
);

beforeAll( async () => {
  useStore.setState( initialStoreState, true );
} );

describe( "StandardCamera", ( ) => {
  beforeEach( ( ) => {
    useStore.setState( {
      currentObservation: mockObservation,
      observations: [mockObservation]
    } );
  } );
  it( "deletes a photo on long press", async ( ) => {
    renderCamera( );
    const { cameraUris } = useStore.getState( );
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

    renderCamera( );

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
