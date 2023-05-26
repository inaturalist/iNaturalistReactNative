// @flow

import {
  Body1, Button, Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { TextInput, useTheme } from "react-native-paper";

type Props = {
  handleInputFocus: Function,
  hideHeader: boolean,
  reset: Function
}

const ForgotPasswordForm = ( { handleInputFocus, hideHeader, reset }: Props ): Node => {
  const [email, setEmail] = useState( "" );
  const theme = useTheme( );

  return (
    <View className="px-4 mt-[9px] justify-end">
      {!hideHeader && (
        <Body1 className="color-white self-center mb-[30px]">
          {t( "Lets-reset-your-password" )}
        </Body1>
      )}
      <View className="mx-4">
        <Heading4 className="color-white mb-[11px]">{t( "USERNAME-OR-EMAIL" )}</Heading4>
        <TextInput
          accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
          className="h-[45px] rounded-md"
          onChangeText={text => setEmail( text )}
          value={email}
          autoComplete="email"
          testID="Login.email"
          autoCapitalize="none"
          keyboardType="email-address"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
      </View>
      <Button
        level="focus"
        text={t( "RESET-PASSWORD" )}
        onPress={( ) => reset( email )}
        className="my-[30px]"
        disabled={!email}
        testID="Login.forgotPasswordButton"
      />
    </View>
  );
};

export default ForgotPasswordForm;
