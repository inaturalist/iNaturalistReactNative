// @flow

import {
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";

import LoginSignUpInputField from "./LoginSignUpInputField";

type Props = {
  reset: ( ) => void
}

const ForgotPasswordForm = ( { reset }: Props ): Node => {
  const [email, setEmail] = useState( "" );

  return (
    <View className="px-4 my-5 justify-end">
      <LoginSignUpInputField
        accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
        autoComplete="email"
        headerText={t( "USERNAME-OR-EMAIL" )}
        keyboardType="email-address"
        onChangeText={text => setEmail( text )}
        testID="Login.email"
      />
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
