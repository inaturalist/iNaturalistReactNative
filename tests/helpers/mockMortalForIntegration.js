// Mortal gates children on navigation focus, which does not run reliably after
// CommonActions.reset in integration tests. See MOB-879.
jest.mock( "components/SharedComponents/Mortal", ( ) => {
  const React = require( "react" );
  return {
    __esModule: true,
    default: ( { children } ) => React.createElement( React.Fragment, null, children ),
  };
} );
