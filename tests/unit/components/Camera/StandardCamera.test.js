import { fireEvent, render, screen } from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera";
import initI18next from "i18n/initI18next";
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
      navigate: mockedNavigate,
      addListener: () => {}
    } ),
    useRoute: () => ( {} ),
    useFocusEffect: () => ( {} )
  };
} );

const mockValue = {
  addCameraPhotosToCurrentObservation: jest.fn(),
  allObsPhotoUris: [],
  cameraPreviewUris: []
};

const mockView = <View />;
jest.mock( "components/Camera/CameraContainer", () => ( {
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
  beforeAll( async ( ) => {
    await initI18next();
    jest.useFakeTimers( );
  } );

  it( "should not have accessibility errors", () => {
    const standardCamera = (
      <INatPaperProvider>
        <ObsEditContext.Provider value={mockValue}>
          <StandardCamera />
        </ObsEditContext.Provider>
      </INatPaperProvider>
    );

    expect( standardCamera ).toBeAccessible();
  } );

  it( "should first render with flash disabled", async () => {
    renderStandardCamera();

    await screen.findByTestId( "flash-button-label-flash-off" );
  } );

  it( "should change to flash enabled on button press", async () => {
    renderStandardCamera();

    const flashButton = await screen.findByTestId(
      "flash-button-label-flash-off"
    );
    fireEvent.press( flashButton );

    await screen.findByTestId( "flash-button-label-flash" );
  } );
} );
