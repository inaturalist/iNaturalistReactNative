import {
  fireEvent, render, screen
} from "@testing-library/react-native";
import CameraContainer from "components/Camera/CameraContainer";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { View } from "react-native";
import factory from "tests/factory";

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
      addListener: () => jest.fn()
    } ),
    useRoute: () => ( {} ),
    useFocusEffect: () => ( {} )
  };
} );

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

jest.mock( "components/Camera/AICamera/FrameProcessorCamera", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

const renderCameraContainer = () => render(
  <INatPaperProvider>
    <CameraContainer />
  </INatPaperProvider>
);

describe( "CameraContainer", ( ) => {
  beforeAll( async ( ) => {
    jest.useFakeTimers( );
  } );

  it( "should not have accessibility errors", () => {
    const Camera = <CameraContainer />;

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
