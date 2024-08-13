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

module.exports = RNSInfo;
