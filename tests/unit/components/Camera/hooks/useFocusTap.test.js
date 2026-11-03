import { act, renderHook } from "@testing-library/react-native";
import useFocusTap from "components/Camera/hooks/useFocusTap";

// tests/jest.setup.js mocks the app logger so logger.error() calls console.error()

const tapEvent = { x: 100, y: 200 };

const cameraRefWithFocus = focus => ( { current: { focus } } );

const tap = async result => {
  await act( async ( ) => {
    await result.current.tapToFocus.handlers.onStart( tapEvent );
  } );
};

// Let the rejected focus promise's .catch handler run
const flushPromises = ( ) => new Promise( jest.requireActual( "timers" ).setImmediate );

let consoleErrorSpy;

beforeEach( ( ) => {
  consoleErrorSpy = jest.spyOn( console, "error" ).mockImplementation( ( ) => undefined );
} );

afterEach( ( ) => {
  consoleErrorSpy.mockRestore( );
} );

describe( "useFocusTap", ( ) => {
  it( "focuses the camera on the tapped point", async ( ) => {
    const focus = jest.fn( ( ) => Promise.resolve( ) );
    const { result } = renderHook( ( ) => useFocusTap( cameraRefWithFocus( focus ), true ) );

    await tap( result );

    expect( focus ).toHaveBeenCalledWith( tapEvent );
    expect( result.current.tappedCoordinates ).toEqual( tapEvent );
  } );

  it( "does not focus when the device does not support focus", async ( ) => {
    const focus = jest.fn( ( ) => Promise.resolve( ) );
    const { result } = renderHook( ( ) => useFocusTap( cameraRefWithFocus( focus ), false ) );

    await tap( result );

    expect( focus ).not.toHaveBeenCalled( );
  } );

  it( "does not log an error when a focus is canceled by a newer tap", async ( ) => {
    const canceledError = Object.assign(
      new Error( "The focus operation has been canceled by a new focus request." ),
      { code: "capture/focus-canceled" },
    );
    const focus = jest.fn( ( ) => Promise.reject( canceledError ) );
    const { result } = renderHook( ( ) => useFocusTap( cameraRefWithFocus( focus ), true ) );

    await tap( result );
    await flushPromises( );

    expect( focus ).toHaveBeenCalled( );
    expect( consoleErrorSpy ).not.toHaveBeenCalled( );
  } );

  it( "logs an error when focusing fails for another reason", async ( ) => {
    const otherError = Object.assign(
      new Error( "Camera is not ready yet!" ),
      { code: "session/camera-not-ready" },
    );
    const focus = jest.fn( ( ) => Promise.reject( otherError ) );
    const { result } = renderHook( ( ) => useFocusTap( cameraRefWithFocus( focus ), true ) );

    await tap( result );
    await flushPromises( );

    expect( consoleErrorSpy ).toHaveBeenCalledWith( "Failed to focus camera" );
  } );
} );
