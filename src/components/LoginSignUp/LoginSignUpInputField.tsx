import { Heading4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { forwardRef, Ref } from "react";
import { TextInput as RNTextInput, TextInputProps } from "react-native";
import { TextInput } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props extends TextInputProps {
  headerText: string;
}

const CONTENT_STYLE = {
  top: 2,
  lineHeight: 18
};

const OUTLINE_STYLE = {
  borderRadius: 8
};

const LoginSignUpInputField: Function = forwardRef( ( {
  accessibilityLabel,
  autoComplete,
  headerText,
  inputMode,
  keyboardType,
  onChangeText,
  secureTextEntry = false,
  testID,
  textContentType
}: Props, ref: Ref<RNTextInput> ) => (
  <View className="mx-2 mt-[20px]">
    <Heading4 className="color-white mb-[12px]">
      {headerText}
    </Heading4>
    <TextInput
      ref={ref}
      accessibilityLabel={accessibilityLabel}
      autoCapitalize="none"
      autoComplete={autoComplete}
      className="h-[45px]"
      contentStyle={CONTENT_STYLE}
      outlineStyle={OUTLINE_STYLE}
      activeOutlineColor={String( colors?.inatGreen )}
      inputMode={inputMode}
      keyboardType={keyboardType}
      mode="outlined"
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      selectionColor={String( colors?.darkGray )}
      testID={testID}
      textContentType={textContentType}
    />
  </View>
) );

export default LoginSignUpInputField;
