import "react-native-gesture-handler/jestSetup";
import "@shopify/flash-list/jestSetup";

import mockBottomSheet from "@gorhom/bottom-sheet/mock";
import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import inatjs from "inaturalistjs";
import React from "react";
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock";
import mockRNLocalize from "react-native-localize/mock";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

import { makeResponse } from "./factory";
import {
  mockCamera,
  mockSortDevices,
  mockUseCameraDevices
} from "./vision-camera/vision-camera";

jest.mock( "@sayem314/react-native-keep-awake" );
jest.mock( "react-native/Libraries/EventEmitter/NativeEventEmitter" );

jest.mock(
  "@react-native-async-storage/async-storage",
  () => require( "@react-native-async-storage/async-storage/jest/async-storage-mock" )
);

require( "react-native-reanimated/lib/reanimated2/jestUtils" ).setUpTests();

jest.mock( "react-native-vision-camera", ( ) => ( {
  Camera: mockCamera,
  sortDevices: mockSortDevices,
  useCameraDevices: mockUseCameraDevices
} ) );

jest.mock( "react-native-localize", () => mockRNLocalize );
jest.mock( "react-native-safe-area-context", () => mockSafeAreaContext );
// Trivial mock b/c I assume we can't really test the native parts of this
// library ~~~kueda 20230516
jest.mock( "react-native-share-menu", ( ) => ( {
  addNewShareListener: jest.fn( ),
  getInitialShare: jest.fn( )
} ) );

// mock Portal with a Modal component inside of it (MediaViewer)
jest.mock( "react-native-paper", () => {
  const actual = jest.requireActual( "react-native-paper" );
  const MockedModule = {
    ...actual,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    Portal: ( { children } ) => <>{children}</>
  };
  return MockedModule;
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ( ) => ( { } ) ),
    useNavigation: ( ) => ( {
      setOptions: jest.fn( )
    } )
  };
} );

jest.mock( "@react-navigation/drawer", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/drawer" );
  return {
    ...actualNav,
    useDrawerStatus: jest.fn( ( ) => false )
  };
} );

// this resolves error with importing file after Jest environment is torn down
// https://github.com/react-navigation/react-navigation/issues/9568#issuecomment-881943770
jest.mock( "@react-navigation/native/lib/commonjs/useLinking.native", ( ) => ( {
  default: ( ) => ( { getInitialState: { then: jest.fn( ) } } ),
  __esModule: true
} ) );

// https://github.com/callstack/react-native-testing-library/issues/658#issuecomment-766886514
jest.mock( "react-native/Libraries/LogBox/LogBox" );

jest.mock( "react-native-config", () => ( {
  OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
  JWT_ANONYMOUS_API_SECRET: process.env.JWT_ANONYMOUS_API_SECRET,
  API_URL: process.env.API_URL
} ) );

jest.mock( "react-native-device-info", () => mockRNDeviceInfo );

jest.mock( "react-native-sensitive-info", () => {
  class RNSInfo {
    static stores = new Map();

    static getServiceName( o = {} ) {
      return o.sharedPreferencesName
        || o.keychainService
        || "default";
    }

    static validateString( s ) {
      if ( typeof s !== "string" ) { throw new Error( "Invalid string:", s ); }
    }

    static getItem = jest.fn( async ( k, o ) => {
      RNSInfo.validateString( k );

      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );

      if ( service ) { return service.get( k ) || null; }
      return null;
    } );

    static getAllItems = jest.fn( async o => {
      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );
      let mappedValues = [];

      if ( service?.size ) {
        // for ( const [k, v] of service.entries() ) {
        //   mappedValues.push( { key: k, value: v, service: serviceName } );
        // }
        mappedValues = service.entries( ).map(
          ( key, value ) => ( { key, value, service: serviceName } )
        );
      }

      return mappedValues;
    } );

    static setItem = jest.fn( async ( k, v, o ) => {
      RNSInfo.validateString( k );
      RNSInfo.validateString( v );

      const serviceName = RNSInfo.getServiceName( o );
      let service = RNSInfo.stores.get( serviceName );

      if ( !service ) {
        RNSInfo.stores.set( serviceName, new Map() );
        service = RNSInfo.stores.get( serviceName );
      }

      service.set( k, v );

      return null;
    } );

    static deleteItem = jest.fn( async ( k, o ) => {
      RNSInfo.validateString( k );

      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );

      if ( service ) { service.delete( k ); }

      return null;
    } );

    static hasEnrolledFingerprints = jest.fn( async () => true );

    static setInvalidatedByBiometricEnrollment = jest.fn();

    // "Touch ID" | "Face ID" | false
    static isSensorAvailable = jest.fn( async () => "Face ID" );
  }

  return RNSInfo;
} );

// Some test environments may need a little more time
jest.setTimeout( 50000 );

// https://github.com/zoontek/react-native-permissions
// eslint-disable-next-line global-require
jest.mock( "react-native-permissions", () => require( "react-native-permissions/mock" ) );

// mocking globally since this currently affects a handful of unit and integration tests
jest.mock( "@react-native-community/geolocation", ( ) => ( {
  getCurrentPosition: ( ) => jest.fn( )
} ) );
require( "react-native" ).NativeModules.RNCGeolocation = { };

jest.mock( "@react-native-community/netinfo", () => mockRNCNetInfo );

global.ReanimatedDataMock = {
  now: () => 0
};

jest.mock( "react-native-fs", ( ) => {
  const RNFS = {
    appendFile: jest.fn( ),
    CachesDirectoryPath: "caches/directory/path",
    DocumentDirectoryPath: "document/directory/path",
    exists: jest.fn( async ( ) => true ),
    moveFile: async ( ) => "testdata",
    stat: jest.fn( ( ) => ( {
      mtime: 123
    } ) ),
    readFile: jest.fn( ( ) => "testdata" )
  };

  return RNFS;
} );

require( "react-native" ).NativeModules.FileReaderModule = { };

// Mock native animation for all tests
jest.mock( "react-native/Libraries/Animated/NativeAnimatedHelper" );

jest.mock( "@gorhom/bottom-sheet", ( ) => ( {
  ...mockBottomSheet,
  __esModule: true,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  BottomSheetTextInput: ( ) => <></>
} ) );

jest.mock( "@react-native-camera-roll/camera-roll", ( ) => ( {
  nativeInterface: jest.fn( ),
  CameraRoll: {
    getPhotos: jest.fn( ( ) => ( {
      page_info: {
        end_cursor: jest.fn( ),
        has_next_page: false
      },
      edges: [
        // This expexcts something like
        // { node: photo }
      ]
    } ) ),
    getAlbums: jest.fn( ( ) => ( {
      // Expecting album titles as keys and photo counts as values
      // "My Amazing album": 12
    } ) )
  }
} ) );

jest.mock( "react-native-exif-reader", ( ) => ( {
  readExif: jest.fn( )
} ) );

// https://github.com/APSL/react-native-keyboard-aware-scroll-view/issues/493#issuecomment-861711442
jest.mock( "react-native-keyboard-aware-scroll-view", ( ) => ( {
  KeyboardAwareScrollView: jest
    .fn( )
    .mockImplementation( ( { children } ) => children )
} ) );

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
inatjs.observations.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );

jest.mock( "react-native-orientation-locker", () => ( {
  addDeviceOrientationListener: jest.fn( ),
  addEventListener: jest.fn( ),
  getDeviceOrientation: jest.fn( ),
  getInitialOrientation: jest.fn( ),
  getOrientation: jest.fn( ),
  lockToPortrait: jest.fn( ),
  removeEventListener: jest.fn( ),
  removeOrientationListener: jest.fn( ),
  unlockAllOrientations: jest.fn( )
} ) );

const mockErrorHandler = error => {
  console.log( error );
};
jest.mock( "react-native-exception-handler", () => ( {
  setJSExceptionHandler: jest
    .fn()
    .mockImplementation( () => mockErrorHandler() ),
  setNativeExceptionHandler: jest
    .fn()
    .mockImplementation( () => mockErrorHandler() )
} ) );
