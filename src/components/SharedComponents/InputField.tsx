import { TextInput } from "components/styledComponents";
import * as React from "react";
import { Platform } from "react-native";
import colors from "styles/tailwindColors";

interface Props {
  handleTextChange: ( text: string ) => void;
  placeholder: string;
  text: string;
  type: string;
  testID?: string;
}

// same code as Seek:
// https://github.com/inaturalist/SeekReactNative/blob/main/components/UIComponents/InputField.js
const InputField = ( {
  handleTextChange,
  placeholder,
  text,
  type,
  testID
}: Props ) => {
  let keyboardType = "default";

  if ( type === "emailAddress" ) {
    keyboardType = "email-address";
  } else if ( Platform.OS === "android" && type !== "password" ) {
    // adding this to turn off autosuggestions on Android
    keyboardType = "visible-password";
  }

  return (
    // $FlowFixMe
    // eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors
    <TextInput
      // don't use accessibility label here because screen reader
      // should read the text value (editable content) instead
      autoCapitalize="none"
      autoCorrect={false}
      // spellCheck off is required for iOS 15
      // https://reactnative.dev/blog/2021/09/01/preparing-your-app-for-iOS-15-and-android-12
      spellCheck={false}
      autoFocus={type !== "password"}
      keyboardType={keyboardType}
      onChangeText={handleTextChange}
      placeholder={placeholder}
      placeholderTextColor={colors.darkGray}
      secureTextEntry={type === "password"}
      selectTextOnFocus={Platform.OS === "android"}
      className="border border-lightGray h-8 mx-5 rounded-xl pl-3"
      textContentType={type} // iOS only
      value={text}
      testID={testID}
    />
  );
};

export default InputField;
