// Recommendation from the uuid library is to import get-random-values before
// uuid, so we're importing it first thing in the entry point.
// https://www.npmjs.com/package/uuid#react-native--expo
// eslint-disable-next-line simple-import-sort/imports
import "react-native-get-random-values";

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

// tests seem to be slower without this global reanimated mock
global.ReanimatedDataMock = {
  now: () => 0
};

jest.mock( "react-native-volume-manager", () => ( {
  VolumeManager: {
    getVolume: jest.fn( () => Promise.resolve( 0.5 ) ),
    setVolume: jest.fn( ),
    addVolumeListener: jest.fn( () => ( { remove: jest.fn() } ) ),
    showNativeVolumeUI: jest.fn()
  }
} ) );

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
inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
inatjs.observations.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );
inatjs.users.projects.mockResolvedValue( makeResponse( ) );
inatjs.computervision.score_image.mockResolvedValue( makeResponse( ) );

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

jest.mock( "react-native-restart", ( ) => ( {
  restart: jest.fn( )
} ) );

// see https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app
// for more details about this withAnimatedTimeTravelEnabled approach. basically, this
// allows us to step through animation frames when a screen is first loading when we're using the
// FadeInView animation for navigation screen transitions
global.withAnimatedTimeTravelEnabled = ( options = {} ) => {
  beforeEach( () => {
    if ( !options.skipFakeTimers ) jest.useFakeTimers();
    jest.setSystemTime( new Date( 0 ) );
  } );
  if ( !options.skipFakeTimers ) {
    afterEach( () => {
      jest.useRealTimers();
    } );
  }
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

jest.mock( "sharedHelpers/installData", ( ) => ( {
  // For most tests it's just going to be burden to dismiss this thing that
  // most users only ever see once. If we do want to test it, we can redefine
  // this mock
  useOnboardingShown: jest.fn( ( ) => [true, jest.fn()] ),
  getInstallID: jest.fn( ( ) => "fake-installation-id" )
} ) );

jest.mock( "components/SharedComponents/Buttons/Button.tsx", () => {
  const actualButton = jest
    .requireActual( "components/SharedComponents/Buttons/Button.tsx" ).default;
  // Use a very short debounce time (10ms) in tests to simulate the 300ms
  // debounce time in the actual Button component
  return jest.fn( props => actualButton( { ...props, debounceTime: 10 } ) );
} );

// this silences console methods in jest tests, to make them less noisy
// and easier to debug. comment them out if you don't want to silence them
global.console = {
  ...console,
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
  // log: jest.fn()
};
