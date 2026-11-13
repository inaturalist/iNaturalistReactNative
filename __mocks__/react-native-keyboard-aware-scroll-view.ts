// https://github.com/APSL/react-native-keyboard-aware-scroll-view/issues/493#issuecomment-861711442

module.exports = {
  KeyboardAwareScrollView: jest
    .fn( )
    .mockImplementation( ( { children } ) => children ),
};
