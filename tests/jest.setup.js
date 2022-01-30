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

jest.mock( "react-native-localize", () => {
  return jest.requireActual( "react-native-localize/mock" );
} );

jest.mock( "react-native-sensitive-info", () => {
  class RNSInfo {
    static stores = new Map()

    static getServiceName( o = {} ) {
      return o.sharedPreferencesName
        || o.keychainService
        || "default";
    }

    static validateString( s ){
      if ( typeof s !== "string" ) {throw new Error( "Invalid string:", s );}
    }

    static getItem = jest.fn( async ( k, o ) => {
      RNSInfo.validateString( k );

      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );

      if ( service ) {return service.get( k ) || null;}
    } )

    static getAllItems = jest.fn( async ( o ) => {
      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );
      const mappedValues = [];

      if ( service?.size ){
        for ( const [k, v] of service.entries() ){
          mappedValues.push( {key: k, value: v, service: serviceName} );
        }
      }

      return mappedValues;
    } )

    static setItem = jest.fn( async ( k, v, o ) => {
      RNSInfo.validateString( k );
      RNSInfo.validateString( v );

      const serviceName = RNSInfo.getServiceName( o );
      let service = RNSInfo.stores.get( serviceName );

      if ( !service ){
        RNSInfo.stores.set( serviceName, new Map() );
        service = RNSInfo.stores.get( serviceName );
      }

      service.set( k, v );

      return null;
    } )

    static deleteItem = jest.fn( async ( k, o ) => {
      RNSInfo.validateString( k );

      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );

      if ( service ) {service.delete( k );}

      return null;
    } )

    static hasEnrolledFingerprints = jest.fn( async () => true )

    static setInvalidatedByBiometricEnrollment = jest.fn()

    // "Touch ID" | "Face ID" | false
    static isSensorAvailable = jest.fn( async () => "Face ID" )
  }

  return RNSInfo;
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
