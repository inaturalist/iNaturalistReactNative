let clearAuthCache = () => {}; // Default no-op function

// Try to get clearAuthCache function safely
try {
  const authModule = require( "components/LoginSignUp/AuthenticationService" );

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

const stores = new Map();

function getServiceName( o = {} ) {
  return o.service
        || "default";
}

function validateString( s ) {
  if ( typeof s !== "string" ) { throw new Error( "Invalid string:", s ); }
}

const clearAuthCacheInternal = jest.fn( () => {
  clearAuthCache();
} );

const hasItem = jest.fn( async ( k, o ) => {
  validateString( k );

  const serviceName = getServiceName( o );
  const service = stores.get( serviceName );

  if ( service ) { return service.has( k ); }
  return false;
} );

const getItem = jest.fn( async ( k, o ) => {
  validateString( k );

  const serviceName = getServiceName( o );
  const service = stores.get( serviceName );

  if ( service ) { return service.get( k ) || null; }
  return null;
} );

const setItem = jest.fn( async ( k, v, o ) => {
  validateString( k );
  validateString( v );

  const serviceName = getServiceName( o );
  let service = stores.get( serviceName );

  if ( !service ) {
    stores.set( serviceName, new Map() );
    service = stores.get( serviceName );
  }

  service.set( k, v );

  clearAuthCacheInternal( );

  return null;
} );

const deleteItem = jest.fn( async ( k, o ) => {
  validateString( k );

  const serviceName = getServiceName( o );
  const service = stores.get( serviceName );

  if ( service ) { service.delete( k ); }

  clearAuthCacheInternal( );

  return null;
} );

module.exports = {
  deleteItem,
  setItem,
  getItem,
  hasItem,
  stores,
};
