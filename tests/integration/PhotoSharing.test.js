import { act } from "@testing-library/react-native";
import { Platform } from "react-native";
import ShareMenu from "react-native-share-menu";
import { renderApp } from "tests/helpers/render";

const JPEG = "image/jpeg";

const mockNavigate = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      addListener: mockNavigate,
    } ),
  };
} );

const mockIOSPhoto = {
  mimeType: JPEG,
  data: [{ data: "file://photo.jpg", mimeType: "image/jpeg" }],
};

const mockAndroidPhoto = {
  mimeType: "image/jpeg",
  data: "file://photo.jpg",
};

const setupShareMocks = ( ) => {
  const mockListeners = [];

  ShareMenu.getInitialShare.mockImplementation( callback => {
    ShareMenu.__initialShareCallback = callback;
  } );

  ShareMenu.addNewShareListener.mockImplementation( callback => {
    const listener = { callback, remove: jest.fn( ) };
    mockListeners.push( listener );
    return listener;
  } );

  return {
    simulateInitialShare: shareData => {
      ShareMenu.__initialShareCallback?.( shareData );
    },
    simulateNewShare: shareData => {
      mockListeners.forEach( listener => listener.callback( shareData ) );
    },
    reset: ( ) => {
      mockListeners.length = 0;
      ShareMenu.__initialShareCallback = null;
    },
  };
};

describe( "Sharing photos into the app", ( ) => {
  let shareHelpers;

  beforeEach( ( ) => {
    shareHelpers = setupShareMocks( );
  } );

  afterEach( ( ) => {
    shareHelpers.reset( );
    // test iOS as default, but test Android in a few specific tests
    Platform.OS = "ios";
  } );

  it( "should handle iOS photo share on app launch", async ( ) => {
    renderApp( );

    await act( async ( ) => {
      shareHelpers.simulateInitialShare( mockIOSPhoto );
    } );

    expect( mockNavigate ).toHaveBeenCalledWith( "NoBottomTabStackNavigator", {
      screen: "PhotoSharing",
      params: { item: expect.objectContaining( { mimeType: "image/jpeg" } ) },
    } );
  } );

  it( "should handle Android photo share on app launch", async ( ) => {
    Platform.OS = "android";
    renderApp( );

    await act( async ( ) => {
      shareHelpers.simulateInitialShare( mockAndroidPhoto );
    } );

    expect( mockNavigate ).toHaveBeenCalledWith( "NoBottomTabStackNavigator", {
      screen: "PhotoSharing",
      params: { item: expect.objectContaining( { mimeType: "image/jpeg" } ) },
    } );
  } );
} );
