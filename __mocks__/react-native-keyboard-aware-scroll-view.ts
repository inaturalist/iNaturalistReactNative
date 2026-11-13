// https://github.com/APSL/react-native-keyboard-aware-scroll-view/issues/493#issuecomment-861711442
const React = require( "react" );
const { ScrollView } = require( "react-native" );

module.exports = {
  KeyboardAwareScrollView: jest
    .fn( )
    .mockImplementation( ( { children, ...props } ) => (
      // Preserve testID and other ScrollView props for component tests
      React.createElement( ScrollView, props, children )
    ) ),
};
