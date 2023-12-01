// import { faker } from "@faker-js/faker";
// import {
//   fireEvent, render,
//   screen, waitFor
// } from "@testing-library/react-native";
// import CameraWithDevice from "components/Camera/CameraWithDevice";
import initI18next from "i18n/initI18next";
import React from "react";
import { View } from "react-native";
import useStore from "stores/useStore";

// import { renderComponent } from "../../../helpers/render";
// import {
//   mockUseCameraDevices
// } from "../../../vision-camera/vision-camera";

const initialStoreState = useStore.getState( );

// const mockPhotoUris = [
//   faker.image.imageUrl( ),
//   `${faker.image.imageUrl( )}/600`,
//   `${faker.image.imageUrl( )}/900`
// ];

const mockView = <View />;

jest.mock( "components/Camera/ARCamera/FrameProcessorCamera", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

describe( "StandardCamera", ( ) => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
    await initI18next( );
  } );

  test.todo( "deletes a photo on a long press" );

  // it( "deletes a photo on long press", async ( ) => {
  //   useStore.setState( {
  //     evidenceToAdd: [mockPhotoUris[2]],
  //     cameraPreviewUris: mockPhotoUris,
  //     photoEvidenceUris: mockPhotoUris
  //   } );

  //   render(
  //     <CameraWithDevice
  //       cameraType="Standard"
  //       device={mockUseCameraDevices( )}
  //     />
  //   );
  //   const photoImage = screen.getByTestId( `PhotoCarousel.displayPhoto.${mockPhotoUris[2]}` );
  //   fireEvent( photoImage, "onLongPress" );
  //   const deleteMode = screen.getByTestId( `PhotoCarousel.deletePhoto.${mockPhotoUris[2]}` );
  //   await waitFor( ( ) => {
  //     expect( deleteMode ).toBeVisible( );
  //   } );
  //   fireEvent.press( deleteMode );

  //   const undeletedPhoto = screen.getByTestId( `PhotoCarousel.deletePhoto.${mockPhotoUris[1]}` );
  //   expect( undeletedPhoto ).toBeVisible( );
  //   const deletedPhoto = screen.queryByTestId( `PhotoCarousel.deletePhoto.${mockPhotoUris[2]}` );
  //   await waitFor( ( ) => {
  //     expect( deletedPhoto ).toBeFalsy( );
  //   } );
  // } );
} );
