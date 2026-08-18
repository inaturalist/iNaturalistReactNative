import { act } from "@testing-library/react-native";
import ShareMenu from "react-native-share-menu";
import { renderApp } from "tests/helpers/render";

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

const mockSharedPhoto = {
  mimeType: "image/jpeg",
  data: "file://photo.jpg",
};

const mockSharedData = {
  data: [mockSharedPhoto],
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
  } );

  it( "should handle photo share on app launch", async ( ) => {
    renderApp( );

    await act( async ( ) => {
      shareHelpers.simulateInitialShare( mockSharedData );
    } );

    expect( mockNavigate ).toHaveBeenCalledWith(
      "NoBottomTabStackNavigator",
      expect.objectContaining( {
        screen: "PhotoSharing",
      } ),
    );
  } );
} );
