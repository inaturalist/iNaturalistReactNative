const actualPaper = jest.requireActual( "react-native-paper" );
module.exports = {
  ...actualPaper,
  Portal: ( { children } ) => children,
};
