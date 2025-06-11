let clearAuthCache = () => {}; // Default no-op function

// Try to get clearAuthCache function safely
try {
  const authModule = require( "components/LoginSignUp/AuthenticationService.ts" );

  if ( authModule && typeof authModule.clearAuthCache === "function" ) {
    // eslint-disable-next-line prefer-destructuring
    clearAuthCache = authModule.clearAuthCache;
  } else if ( authModule.default && typeof authModule.default.clearAuthCache === "function" ) {
    // eslint-disable-next-line prefer-destructuring
    clearAuthCache = authModule.default.clearAuthCache;
  }
} catch ( error ) {
  console.warn( "Could not import clearAuthCache, using no-op function", error );
}

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

  static clearAllStores = jest.fn( () => {
    RNSInfo.stores.clear();
    clearAuthCache();
  } );

  static clearAuthCache = jest.fn( () => {
    clearAuthCache();
  } );

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
      mappedValues = Array.from( service.entries() ).map(
        ( [key, value] ) => ( { key, value, service: serviceName } )
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

    clearAuthCache( );

    return null;
  } );

  static deleteItem = jest.fn( async ( k, o ) => {
    RNSInfo.validateString( k );

    const serviceName = RNSInfo.getServiceName( o );
    const service = RNSInfo.stores.get( serviceName );

    if ( service ) { service.delete( k ); }

    clearAuthCache( );

    return null;
  } );

  static hasEnrolledFingerprints = jest.fn( async () => true );

  static setInvalidatedByBiometricEnrollment = jest.fn();

  // "Touch ID" | "Face ID" | false
  static isSensorAvailable = jest.fn( async () => "Face ID" );
}

module.exports = RNSInfo;
