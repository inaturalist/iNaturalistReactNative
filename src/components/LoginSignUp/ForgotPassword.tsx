import { useNavigation } from "@react-navigation/native";
import { WarningSheet } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useCallback, useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { openInbox } from "sharedHelpers/mail";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import {
  resetPassword,
} from "./AuthenticationService";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const ForgotPassword = ( ) => {
  const navigation = useNavigation( );
  const [showSheet, setShowSheet] = useState( false );
  const { keyboardShown } = useKeyboardInfo( );

  const reset = useCallback( async ( email: string ) => {
    await resetPassword( email );
    setShowSheet( true );
    Keyboard.dismiss( );
  }, [setShowSheet] );

  const blurFields = () => {
    Keyboard.dismiss( );
  };

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View>
        {showSheet && (
          <WarningSheet
            onPressClose={( ) => setShowSheet( false )}
            confirm={openInbox}
            headerText={t( "CHECK-YOUR-EMAIL" )}
            text={t( "If-an-account-with-that-email-exists" )}
            buttonText={t( "OPEN-EMAIL" )}
            secondButtonText={t( "BACK-TO-LOGIN" )}
            handleSecondButtonPress={( ) => {
              setShowSheet( false );
              navigation.navigate( "LoginStackNavigator", { screen: "Login" } );
            }}
            buttonType="focus"
            loading={false}
          />
        )}
        <LoginSignUpWrapper backgroundSource={require( "images/background/butterfly.jpg" )}>
          <Header hideHeader={keyboardShown} />
          <ForgotPasswordForm reset={reset} />
        </LoginSignUpWrapper>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPassword;
