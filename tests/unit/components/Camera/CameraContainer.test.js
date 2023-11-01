import {
  fireEvent, render, screen
} from "@testing-library/react-native";
import CameraContainer from "components/Camera/CameraContainer";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { View } from "react-native";

import factory from "../../../factory";

const mockedNavigate = jest.fn();

const mockTaxon = factory( "RemoteTaxon" );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockTaxon
  } )
} ) );

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
  totalObsPhotoUris: 10,
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

jest.mock( "components/Camera/StandardCamera/PhotoPreview", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

jest.mock( "components/Camera/ARCamera/FrameProcessorCamera", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

const renderCameraContainer = () => render(
  <INatPaperProvider>
    <ObsEditContext.Provider value={mockValue}>
      <CameraContainer />
    </ObsEditContext.Provider>
  </INatPaperProvider>
);

describe( "CameraContainer", ( ) => {
  beforeAll( async ( ) => {
    await initI18next();
    jest.useFakeTimers( );
  } );

  it( "should not have accessibility errors", () => {
    const Camera = (
      <INatPaperProvider>
        <ObsEditContext.Provider value={mockValue}>
          <CameraContainer />
        </ObsEditContext.Provider>
      </INatPaperProvider>
    );

    expect( Camera ).toBeAccessible();
  } );

  it( "should first render with flash disabled", async () => {
    renderCameraContainer();

    await screen.findByTestId( "flash-button-label-flash-off" );
  } );

  it( "should change to flash enabled on button press", async () => {
    renderCameraContainer();

    const flashButton = await screen.findByTestId(
      "flash-button-label-flash-off"
    );
    fireEvent.press( flashButton );

    await screen.findByTestId( "flash-button-label-flash" );
  } );
} );
