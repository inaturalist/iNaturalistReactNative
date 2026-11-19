import { Heading4 } from "components/SharedComponents";
import { PaperTextInput as TextInput, View } from "components/styledComponents";
import React from "react";
import type { TextInput as RNTextInput, TextInputProps } from "react-native";
import colors from "styles/tailwindColors";

interface Props extends TextInputProps {
  headerText: string;
  ref?: React.Ref<RNTextInput>;
}

const CONTENT_STYLE = {
  top: 2,
  lineHeight: 18,
};

const OUTLINE_STYLE = {
  borderRadius: 8,
};

const LoginSignUpInputField = ( {
  accessibilityLabel,
  autoComplete,
  editable,
  headerText,
  inputMode,
  keyboardType,
  onChangeText,
  onSubmitEditing,
  ref,
  returnKeyType,
  secureTextEntry = false,
  testID,
  textContentType,
}: Props ) => (
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
      editable={editable}
      outlineStyle={OUTLINE_STYLE}
      activeOutlineColor={String( colors?.inatGreen )}
      inputMode={inputMode}
      keyboardType={keyboardType}
      mode="outlined"
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      secureTextEntry={secureTextEntry}
      selectionColor={String( colors?.darkGray )}
      spellCheck={false}
      testID={testID}
      textContentType={textContentType}
    />
  </View>
);

export default LoginSignUpInputField;
