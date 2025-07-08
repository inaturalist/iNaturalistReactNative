// @flow

import { useNavigation } from "@react-navigation/native";
import { WarningSheet } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { openInbox } from "sharedHelpers/mail.ts";

import {
  resetPassword
} from "./AuthenticationService";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const ForgotPassword = ( ): Node => {
  const navigation = useNavigation( );
  const [showSheet, setShowSheet] = useState( false );

  const reset = useCallback( async email => {
    await resetPassword( email );
    setShowSheet( true );
    Keyboard.dismiss( );
  }, [setShowSheet] );

  const blurFields = () => {
    Keyboard.dismiss( );
  };

  const renderForgotPassword = useCallback( ( { scrollViewRef } ) => (
    <>
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
        />
      )}
      <Header />
      <ForgotPasswordForm reset={reset} scrollViewRef={scrollViewRef} />
    </>
  ), [showSheet, setShowSheet, reset, navigation] );

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <LoginSignUpWrapper backgroundSource={require( "images/background/butterfly.jpg" )}>
        {renderForgotPassword}
      </LoginSignUpWrapper>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPassword;
