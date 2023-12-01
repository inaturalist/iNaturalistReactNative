import { faker } from "@faker-js/faker";
import {
  fireEvent, render, screen, waitFor
} from "@testing-library/react-native";
import PhotoCarousel from "components/Camera/StandardCamera/PhotoCarousel";
import initI18next from "i18n/initI18next";
import React from "react";
import useStore from "stores/useStore";

const initialStoreState = useStore.getState( );

const mockPhotoUris = [
  faker.image.imageUrl( ),
  `${faker.image.imageUrl( )}/600`,
  `${faker.image.imageUrl( )}/900`
];

describe( "PhotoCarousel", ( ) => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
    await initI18next( );
  } );
  // There were some tests of photo sizes responding to the isLargeScreen prop
  // but somewhat dynamic tailwind classes don't seem to create style props
  // in a test environment, so I'm not sure we can test those now ~~~kueda
  // 20230518
  it( "renders correctly", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
  it( "renders correctly for large screen", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} isLargeScreen />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "deletes a photo on long press", async ( ) => {
    useStore.setState( {
      evidenceToAdd: [mockPhotoUris[2]],
      cameraPreviewUris: mockPhotoUris,
      photoEvidenceUris: mockPhotoUris
    } );

    render(
      <PhotoCarousel photoUris={mockPhotoUris} isLargeScreen deletePhoto={jest.fn( )} />
    );
    const photoImage = screen.getByTestId( `PhotoCarousel.displayPhoto.${mockPhotoUris[2]}` );
    fireEvent( photoImage, "onLongPress" );
    const deleteMode = screen.getByTestId( `PhotoCarousel.deletePhoto.${mockPhotoUris[2]}` );
    await waitFor( ( ) => {
      expect( deleteMode ).toBeVisible( );
    } );
    fireEvent.press( deleteMode );

    const deletedPhoto = screen.queryByTestId( `PhotoCarousel.displayPhoto.${mockPhotoUris[2]}` );
    await waitFor( ( ) => {
      expect( deletedPhoto ).toBeFalsy( );
    } );
  } );
} );
