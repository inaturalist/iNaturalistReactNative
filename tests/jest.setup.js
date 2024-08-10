import "react-native-gesture-handler/jestSetup";
import "@shopify/flash-list/jestSetup";

import mockBottomSheet from "@gorhom/bottom-sheet/mock";
import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import inatjs from "inaturalistjs";
import fetchMock from "jest-fetch-mock";
import mockBackHandler from "react-native/Libraries/Utilities/__mocks__/BackHandler";
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

import factory, { makeResponse } from "./factory";

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

jest.mock( "@gorhom/bottom-sheet", () => ( {
  ...mockBottomSheet,
  __esModule: true
} ) );
jest.mock( "@react-native-community/netinfo", () => mockRNCNetInfo );
jest.mock( "react-native-device-info", () => mockRNDeviceInfo );
jest.mock( "react-native-safe-area-context", () => mockSafeAreaContext );
jest.mock(
  "react-native/Libraries/Utilities/BackHandler",
  () => mockBackHandler
);

require( "react-native-reanimated" ).setUpTests();

// 20240806 amanda - best practice for react navigation
// is actually not to mock navigation at all. I removed
// useFocusEffect so we can test how that actually works in
// components; it requires using the wrapInNavigationContainer
// helper around components with useFocusEffect
// https://reactnavigation.org/docs/testing/#best-practices
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ( ) => ( { params: {} } ) ),
    useNavigation: ( ) => ( {
      addListener: jest.fn(),
      canGoBack: jest.fn( ( ) => true ),
      goBack: jest.fn( ),
      setOptions: jest.fn( )
    } )
  };
} );

// https://github.com/callstack/react-native-testing-library/issues/658#issuecomment-766886514
jest.mock( "react-native/Libraries/LogBox/LogBox" );

// Some test environments may need a little more time
jest.setTimeout( 50000 );

require( "react-native" ).NativeModules.RNCGeolocation = { };
require( "react-native" ).NativeModules.FileReaderModule = { };

global.ReanimatedDataMock = {
  now: () => 0
};

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
inatjs.observations.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );

// Set up mocked fetch for testing (or disabling) fetch requests
fetchMock.enableMocks( );
fetchMock.dontMock( );

const mockIconicTaxon = factory( "RemoteTaxon", {
  is_iconic: true,
  name: "Mock iconic taxon"
} );
inatjs.taxa.search.mockResolvedValue( makeResponse( [mockIconicTaxon] ) );

inatjs.announcements.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );

// the following two mocks are both needed for react-native-keep-awake
jest.mock( "@sayem314/react-native-keep-awake" );
jest.mock( "react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const turboModuleRegistry = jest
    .requireActual( "react-native/Libraries/TurboModule/TurboModuleRegistry" );
  return {
    ...turboModuleRegistry,
    getEnforcing: name => {
      // List of TurboModules libraries to mock.
      const modulesToMock = ["ReactNativeKCKeepAwake"];
      if ( modulesToMock.includes( name ) ) {
        return null;
      }
      return turboModuleRegistry.getEnforcing( name );
    }
  };
} );
