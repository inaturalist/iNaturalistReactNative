import { act, renderHook } from "@testing-library/react-native";
import useZoom from "components/Camera/hooks/useZoom";
import { withSpring } from "react-native-reanimated";

jest.mock( "react-native-reanimated", ( ) => {
  const actual = jest.requireActual( "react-native-reanimated" );
  return {
    __esModule: true,
    ...actual,
    withSpring: jest.fn( value => value ),
  };
} );

// A triple-camera iPhone: the wide-angle camera sits at zoom factor 2 within the virtual
// multi-camera device, so 1x is 2 and 3x is 6.
const iPhoneDevice = {
  physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera", "telephoto-camera"],
  isMultiCam: true,
  minZoom: 1,
  neutralZoom: 2,
  maxZoom: 63,
};

// An Android device with the same lenses. Android always reports neutralZoom as 1, so 3x
// is 3 — the case that used to resolve to 1 and leave the camera unzoomed (MOB-1660).
const androidDevice = {
  physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera", "telephoto-camera"],
  isMultiCam: true,
  minZoom: 0.5,
  neutralZoom: 1,
  maxZoom: 10,
};

const pinch = async ( result, scale ) => {
  await act( async ( ) => {
    result.current.pinchToZoom.handlers.onStart( {} );
    result.current.pinchToZoom.handlers.onChange( { scale } );
  } );
};

beforeEach( ( ) => {
  withSpring.mockClear( );
} );

describe( "useZoom", ( ) => {
  it( "zooms in when the button steps up to 3x on Android", ( ) => {
    const { result } = renderHook( ( ) => useZoom( androidDevice ) );

    act( ( ) => result.current.handleZoomButtonPress( ) );

    expect( result.current.zoomTextValue ).toEqual( "3" );
    expect( withSpring ).toHaveBeenLastCalledWith( 3 );
  } );

  it( "zooms in when the button steps up to 3x on iOS", ( ) => {
    const { result } = renderHook( ( ) => useZoom( iPhoneDevice ) );

    act( ( ) => result.current.handleZoomButtonPress( ) );

    expect( result.current.zoomTextValue ).toEqual( "3" );
    expect( withSpring ).toHaveBeenLastCalledWith( 6 );
  } );

  it( "cycles back to the ultra-wide option after the last one", ( ) => {
    const { result } = renderHook( ( ) => useZoom( androidDevice ) );

    act( ( ) => result.current.handleZoomButtonPress( ) );
    act( ( ) => result.current.handleZoomButtonPress( ) );

    expect( result.current.zoomTextValue ).toEqual( ".5" );
    expect( withSpring ).toHaveBeenLastCalledWith( 0.5 );
  } );

  it( "wraps out to ultra-wide, then back to 1x, without a telephoto camera", ( ) => {
    const device = {
      ...androidDevice,
      physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera"],
    };
    const { result } = renderHook( ( ) => useZoom( device ) );

    // 1x is the last option on this device, so the first press wraps rather than steps up
    act( ( ) => result.current.handleZoomButtonPress( ) );

    expect( result.current.zoomTextValue ).toEqual( ".5" );
    expect( withSpring ).toHaveBeenLastCalledWith( 0.5 );

    act( ( ) => result.current.handleZoomButtonPress( ) );

    expect( result.current.zoomTextValue ).toEqual( "1" );
    expect( withSpring ).toHaveBeenLastCalledWith( 1 );
  } );

  it( "zooms in on a device with a telephoto but no ultra-wide camera", ( ) => {
    const device = {
      ...androidDevice,
      physicalDevices: ["wide-angle-camera", "telephoto-camera"],
      minZoom: 1,
    };
    const { result } = renderHook( ( ) => useZoom( device ) );

    act( ( ) => result.current.handleZoomButtonPress( ) );

    expect( result.current.zoomTextValue ).toEqual( "3" );
    expect( withSpring ).toHaveBeenLastCalledWith( 3 );
  } );

  it( "labels a pinch out to the ultra-wide camera as .5 on iOS", async ( ) => {
    const { result } = renderHook( ( ) => useZoom( iPhoneDevice ) );

    await pinch( result, 0.5 );

    expect( result.current.zoomTextValue ).toEqual( ".5" );
  } );

  it( "hides the zoom button after flipping to a single-camera (front-facing)", ( ) => {
    const frontDevice = {
      physicalDevices: ["wide-angle-camera"],
      isMultiCam: false,
      minZoom: 1,
      neutralZoom: 1,
      maxZoom: 10,
    };
    const { result, rerender } = renderHook( device => useZoom( device ), {
      initialProps: iPhoneDevice,
    } );
    expect( result.current.showZoomButton ).toBe( true );

    rerender( frontDevice );

    expect( result.current.showZoomButton ).toBe( false );
  } );
} );
