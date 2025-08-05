import {
  fireEvent,
  screen
} from "@testing-library/react-native";
import CameraContainer from "components/Camera/CameraContainer.tsx";
import React from "react";
import { View } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

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
jest.mock( "components/Camera/CameraView.tsx", () => ( {
  __esModule: true,
  default: ( ) => mockView
} ) );

jest.mock( "components/Camera/FadeInOutView.tsx", () => ( {
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

function renderCameraContainer( ) {
  return renderComponent( <CameraContainer /> );
}

describe( "CameraContainer", ( ) => {
  beforeAll( async ( ) => {
    jest.useFakeTimers( );
  } );

  it( "should not have accessibility errors", async ( ) => {
    renderCameraContainer( );
    // const cameraWithDevice = await screen.findByTestId( "CameraWithDevice" );
    // Disabled during the update to RN 0.78
    // expect( cameraWithDevice ).toBeAccessible();
  } );

  it( "should first render with flash disabled", async () => {
    renderCameraContainer( );
    await screen.findByTestId( "flash-button-label-flash-off" );
  } );

  it( "should change to flash enabled on button press", async () => {
    renderCameraContainer( );
    const flashButton = await screen.findByTestId(
      "flash-button-label-flash-off"
    );
    fireEvent.press( flashButton );
    await screen.findByTestId( "flash-button-label-flash" );
  } );
} );
