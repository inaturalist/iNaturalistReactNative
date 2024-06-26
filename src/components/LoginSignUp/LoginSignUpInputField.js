// @flow

import {
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { forwardRef } from "react";
import { TextInput, useTheme } from "react-native-paper";

type Props = {
  accessibilityLabel: string,
  autoComplete?: string,
  headerText: string,
  inputMode?: string,
  keyboardType?: string,
  onChangeText: Function,
  secureTextEntry?: boolean,
  testID: string,
  textContentType?: string
}

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
  // $FlowIgnore
}: Props, ref: unknown ): Node => {
  const theme = useTheme( );

  return (
    <View className="mx-2">
      <Heading4 className="color-white mt-[25px] mb-[11px]">
        {headerText}
      </Heading4>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoComplete={autoComplete}
        className="h-[45px] rounded-md"
        inputMode={inputMode}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        selectionColor={theme.colors.tertiary}
        testID={testID}
        textContentType={textContentType}
      />
    </View>
  );
} );

export default LoginSignUpInputField;
