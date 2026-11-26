describe( "initI18next", ( ) => {
  it( "has translations as soon as it returns, without awaiting it", ( ) => {
    // Fresh modules, since the test setup already initialized the shared
    // i18next instance
    jest.isolateModules( ( ) => {
      const i18next = require( "i18next" );
      const initI18next = require( "i18n/initI18next" ).default;
      // Like index.js, which renders the app without waiting for this
      initI18next( );
      expect( i18next.t( "LOG-IN" ) ).toEqual( "LOG IN" );
    } );
  } );
} );
