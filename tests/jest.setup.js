import "react-native-gesture-handler/jestSetup";
import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock.js";

// this resolves error with importing file after Jest environment is torn down
// https://github.com/react-navigation/react-navigation/issues/9568#issuecomment-881943770
jest.mock( "@react-navigation/native/lib/commonjs/useLinking.native", ( ) => ( {
  default: ( ) => ( {getInitialState: {then: jest.fn()}} ),
  __esModule: true
} ) );

// https://github.com/callstack/react-native-testing-library/issues/658#issuecomment-766886514
jest.mock( "react-native/Libraries/LogBox/LogBox" );

// Mock the realm config so it uses an in-memory database. This means data is
// only persisted until realm.close() gets called, so if the code under test
// needs data to persist in Realm across opening/closing events, we will need
// to take a different approach, e.g. writing to Realm to disk and erasing
// those files after each test run
jest.mock( "../src/models/index", ( ) => {
  const originalModule = jest.requireActual( "../src/models/index" );

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    default: {
      schema: originalModule.default.schema,
      schemaVersion: originalModule.default.schemaVersion,
      inMemory: true
    }
  };
} );

// Some test environments may need a little more time
jest.setTimeout( 50000 );

// https://github.com/zoontek/react-native-permissions
jest.mock( "react-native-permissions", () => require( "react-native-permissions/mock" ) );

// mocking globally since this currently affects a handful of unit and integration tests
jest.mock( "react-native-geolocation-service", ( ) => {
  return {
    getCurrentPosition: ( ) => jest.fn( )
  };
} );

jest.mock( "@react-native-community/netinfo", () => mockRNCNetInfo );

jest.mock( "react-i18next", () => ( {
  useTranslation: () => ( {t: key => key} )
} ) );

jest.mock( "react-native-localize", () => ( {
  getTimeZone: ( ) => "Europe/Paris" // the timezone you want
} ) );
