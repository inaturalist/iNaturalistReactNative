import "react-native-gesture-handler/jestSetup";
import "@shopify/flash-list/jestSetup";

import mockBottomSheet from "@gorhom/bottom-sheet/mock";
import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import mockFs from "fs";
import inatjs from "inaturalistjs";
import fetchMock from "jest-fetch-mock";
import React from "react";
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock";
import mockRNLocalize from "react-native-localize/mock";
// eslint-disable-next-line import/no-unresolved
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
import MockAudioRecorderPlayer from "tests/mocks/react-native-audio-recorder-player";

import factory, { makeResponse } from "./factory";
import {
  mockCamera,
  mockSortDevices,
  mockUseCameraDevice
} from "./vision-camera/vision-camera";

// Mock the react-native-logs config because it has a dependency on AuthenticationService
// instead use console.logs for tests
jest.mock( "../react-native-logs.config", () => {
  const log = {
    extend: jest.fn( () => ( {
      debug: msg => console.debug( msg ),
      info: msg => console.info( msg ),
      warn: msg => console.warn( msg ),
      error: msg => console.error( msg )
    } ) )
  };
  return {
    log,
    logFilePath: "inaturalist-rn-log.txt"
  };
} );

jest.mock( "vision-camera-plugin-inatvision", () => ( {
  getPredictionsForImage: jest.fn( () => Promise.resolve( { predictions: [] } ) ),
  removeLogListener: jest.fn( )
} ) );

jest.mock( "react-native-worklets-core", () => ( {
  useSharedValue: jest.fn(),
  useWorklet: jest.fn(),
  Worklets: {
    createRunInJsFn: jest.fn()
  }
} ) );

jest.mock( "@sayem314/react-native-keep-awake" );
jest.mock( "react-native/Libraries/EventEmitter/NativeEventEmitter" );

jest.mock(
  "@react-native-async-storage/async-storage",
  () => require( "@react-native-async-storage/async-storage/jest/async-storage-mock" )
);

require( "react-native-reanimated" ).setUpTests();

jest.mock( "react-native-vision-camera", ( ) => ( {
  Camera: mockCamera,
  sortDevices: mockSortDevices,
  useCameraDevice: mockUseCameraDevice,
  VisionCameraProxy: {
    initFrameProcessorPlugin: jest.fn( )
  },
  useFrameProcessor: jest.fn( )
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
    useIsFocused: jest.fn( ( ) => true ),
    useFocusEffect: ( ) => jest.fn( ),
    useRoute: jest.fn( ( ) => ( { params: {} } ) ),
    useNavigation: ( ) => ( {
      addListener: jest.fn(),
      canGoBack: jest.fn( ( ) => true ),
      goBack: jest.fn( ),
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
  getCurrentPosition: jest.fn( )
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
    copyFile: async ( ) => "testdata",
    stat: jest.fn( ( ) => ( {
      mtime: 123
    } ) ),
    readFile: jest.fn( ( ) => "testdata" ),
    readDir: jest.fn( async ( ) => ( [
      {
        ctime: 123,
        mtime: 123,
        name: "testdata"
      }
    ] ) ),
    writeFile: jest.fn( async ( filePath, contents, _encoding ) => {
      mockFs.writeFile( filePath, contents, jest.fn( ) );
    } ),
    mkdir: jest.fn( async ( filepath, _options ) => {
      mockFs.mkdir( filepath, jest.fn( ) );
    } ),
    unlink: jest.fn( async path => {
      mockFs.unlink( path, jest.fn( ) );
    } )
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
    } ) ),
    save: jest.fn( )
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

jest.mock( "react-native-geocoder-reborn", ( ) => ( {
  geocodePosition: jest.fn( coord => [
    `Somewhere near ${coord.lat}, ${coord.lng}`,
    "Somewhere",
    "Somewheria",
    "SW"
  ] )
} ) );

// Set up mocked fetch for testing (or disabling) fetch requests
fetchMock.enableMocks( );
fetchMock.dontMock( );

const mockIconicTaxon = factory( "RemoteTaxon", {
  is_iconic: true,
  name: "Mock iconic taxon"
} );
inatjs.taxa.search.mockResolvedValue( makeResponse( [mockIconicTaxon] ) );

jest.mock( "@bam.tech/react-native-image-resizer", ( ) => ( {
  createResizedImage: jest.fn(
    async (
      path,
      _maxWidth,
      _maxHeight,
      _compressFormat,
      _quality,
      _rotation,
      _outputPath
    ) => ( { uri: path } )
  )
} ) );

jest.mock( "react-native-jwt-io", ( ) => ( {
  encode: jest.fn( ( ) => "an-encoded-jwt" )
} ) );

inatjs.announcements.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );

jest.mock( "react-native-audio-recorder-player", ( ) => MockAudioRecorderPlayer );

jest.mock( "react-native-fast-image", ( ) => {
  const actualNav = jest.requireActual( "react-native-fast-image" );
  return {
    ...actualNav,
    preload: jest.fn( )
  };
} );
