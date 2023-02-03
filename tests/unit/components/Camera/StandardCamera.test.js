import { fireEvent, render, screen } from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { View } from "react-native";

const mockedNavigate = jest.fn();

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate
    } ),
    useRoute: () => ( {} )
  };
} );

const mockValue = {
  addCameraPhotosToCurrentObservation: jest.fn(),
  allObsPhotoUris: [],
  cameraPreviewUris: []
};

const mockView = <View />;
jest.mock( "components/Camera/CameraView", () => ( {
  __esModule: true,
  default: ( ) => mockView
} ) );

jest.mock( "components/Camera/FadeInOutView", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

jest.mock( "components/Camera/PhotoPreview", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

const renderStandardCamera = () => render(
  <INatPaperProvider>
    <ObsEditContext.Provider value={mockValue}>
      <StandardCamera />
    </ObsEditContext.Provider>
  </INatPaperProvider>
);

describe( "StandardCamera", ( ) => {
  test( "should not have accessibility errors", () => {
    const standardCamera = (
      <INatPaperProvider>
        <ObsEditContext.Provider value={mockValue}>
          <StandardCamera />
        </ObsEditContext.Provider>
      </INatPaperProvider>
    );

    expect( standardCamera ).toBeAccessible();
  } );

  test( "should first render with flash disabled", async () => {
    renderStandardCamera();

    await screen.findByTestId( "flash-button-label-flash-off" );
  } );

  test( "should change to flash enabled on button press", async () => {
    renderStandardCamera();

    const flashButton = await screen.findByTestId(
      "flash-button-label-flash-off"
    );
    fireEvent.press( flashButton );

    await screen.findByTestId( "flash-button-label-flash" );
  } );
} );
