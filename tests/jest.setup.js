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

// this resolves error with importing file after Jest environment is torn down
// https://github.com/react-navigation/react-navigation/issues/9568#issuecomment-881943770
jest.mock( "@react-navigation/native/lib/commonjs/useLinking.native", ( ) => ( {
  default: ( ) => ( { getInitialState: { then: jest.fn( ) } } ),
  __esModule: true
} ) );
// tests seem to be slower without this global reanimated mock
global.ReanimatedDataMock = {
  now: () => 0
};

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
    logFilePath: "inaturalist-rn-log.txt",
    logWithoutRemote: log
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

// Some test environments may need a little more time
jest.setTimeout( 50000 );

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
      const modulesToMock = ["ReactNativeKCKeepAwake", "FileReaderModule"];
      if ( modulesToMock.includes( name ) ) {
        return null;
      }
      return turboModuleRegistry.getEnforcing( name );
    }
  };
} );

// see https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app
// for more details about this withAnimatedTimeTravelEnabled approach. basically, this
// allows us to step through animation frames when a screen is first loading when we're using the
// FadeInView animation for navigation screen transitions
global.withAnimatedTimeTravelEnabled = () => {
  beforeEach( () => {
    jest.useFakeTimers();
    jest.setSystemTime( new Date( 0 ) );
  } );
  afterEach( () => {
    jest.useRealTimers();
  } );
};

const frameTime = 10;
global.timeTravel = ( time = frameTime ) => {
  const tickTravel = () => {
    const now = Date.now();
    jest.setSystemTime( new Date( now + frameTime ) );
    jest.advanceTimersByTime( frameTime );
  };
  // Step through each of the frames
  const frames = time / frameTime;
  for ( let i = 0; i < frames; i += 1 ) {
    tickTravel();
  }
};
