import {
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";
import { photoUploadPath } from "appConstants/paths";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import PhotoCropperModal from "components/MediaViewer/PhotoCropperModal";
import React from "react";
import { Image, Modal } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

// Note: HeaderBackButton has accessibility issues
jest.mock( "@react-navigation/elements" );

const localFilePath = `${photoUploadPath}/local.jpg`;
const photos = [factory( "LocalPhoto", { url: undefined, localFilePath } )];

// Android's back button and back gesture reach a modal as onRequestClose
const pressAndroidBack = ( ) => fireEvent(
  screen.UNSAFE_getByType( Modal ),
  "requestClose",
);

beforeEach( ( ) => {
  jest.spyOn( Image, "getSize" ).mockResolvedValue( { width: 2048, height: 1536 } );
} );

describe( "MediaViewerModal", ( ) => {
  const renderViewer = onClose => renderComponent(
    <MediaViewerModal
      showModal
      photos={photos}
      onClose={onClose}
      onEditPhoto={jest.fn( )}
    />,
  );

  it( "should close on Android back", async ( ) => {
    const onClose = jest.fn( );
    renderViewer( onClose );
    await screen.findByLabelText( "Crop photo" );

    pressAndroidBack( );

    expect( onClose ).toHaveBeenCalled( );
  } );

  it( "should ignore Android back while cropping", async ( ) => {
    const onClose = jest.fn( );
    renderViewer( onClose );
    const actor = userEvent.setup( );
    await actor.press( await screen.findByLabelText( "Crop photo" ) );
    expect( await screen.findByTestId( "PhotoCropper" ) ).toBeVisible( );

    pressAndroidBack( );

    expect( onClose ).not.toHaveBeenCalled( );
    expect( screen.getByTestId( "PhotoCropper" ) ).toBeVisible( );
  } );

  it( "should close on Android back again once the crop is cancelled", async ( ) => {
    const onClose = jest.fn( );
    renderViewer( onClose );
    const actor = userEvent.setup( );
    await actor.press( await screen.findByLabelText( "Crop photo" ) );
    await actor.press( await screen.findByLabelText( "Cancel crop" ) );
    await screen.findByLabelText( "Crop photo" );

    pressAndroidBack( );

    expect( onClose ).toHaveBeenCalled( );
  } );
} );

describe( "PhotoCropperModal", ( ) => {
  it( "should ignore Android back", async ( ) => {
    const onClose = jest.fn( );
    renderComponent(
      <PhotoCropperModal
        localFilePath={localFilePath}
        onClose={onClose}
        onEditPhoto={jest.fn( )}
      />,
    );
    expect( await screen.findByTestId( "PhotoCropper" ) ).toBeVisible( );

    pressAndroidBack( );

    expect( onClose ).not.toHaveBeenCalled( );
  } );
} );
