import "react-native-gesture-handler/jestSetup";

require( "jest-fetch-mock" ).enableMocks( );

// this resolves error with importing file after Jest environment is torn down
// https://github.com/react-navigation/react-navigation/issues/9568#issuecomment-881943770
jest.mock( "@react-navigation/native/lib/commonjs/useLinking.native", ( ) => ( {
  default: ( ) => ( {getInitialState: {then: jest.fn()}} ),
  __esModule: true
} ) );

// jest.mock( "realm", ( ) => {
//   return require( "./__mocks__/realm" );
// } );
