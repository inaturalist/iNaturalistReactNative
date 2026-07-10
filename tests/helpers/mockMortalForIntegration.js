// Mortal gates children on navigation focus, which does not run reliably after
// CommonActions.reset in integration tests. See MOB-879.
jest.mock( "components/SharedComponents/Mortal", ( ) => {
  // jest.requireActual instead of require: nativewind's babel plugin rewrites
  // React.createElement from a plain require("react") to reference a hoisted
  // import, which jest.mock factories aren't allowed to touch
  const React = jest.requireActual( "react" );
  return {
    __esModule: true,
    default: ( { children } ) => React.createElement( React.Fragment, null, children ),
  };
} );
