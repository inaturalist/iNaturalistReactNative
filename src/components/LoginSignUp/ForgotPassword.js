// @flow

import { useNavigation } from "@react-navigation/native";
import { WarningSheet } from "components/SharedComponents";
import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Keyboard } from "react-native";
import { openInbox } from "react-native-email-link";

import {
  resetPassword
} from "./AuthenticationService";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const SCROLL_VIEW_STYLE = {
  flex: 1,
  justifyContent: "space-between"
};

const ForgotPassword = ( ): Node => {
  const navigation = useNavigation( );
  const [showSheet, setShowSheet] = useState( false );

  const reset = async email => {
    await resetPassword( email );
    setShowSheet( true );
    Keyboard.dismiss( );
  };

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/butterfly.png" )}>
      {showSheet && (
        <WarningSheet
          handleClose={( ) => setShowSheet( false )}
          confirm={( ) => openInbox( )}
          headerText={t( "CHECK-YOUR-EMAIL" )}
          text={t( "If-an-account-with-that-email-exists" )}
          buttonText={t( "OPEN-EMAIL" )}
          secondButtonText={t( "BACK-TO-LOGIN" )}
          handleSecondButtonPress={( ) => {
            setShowSheet( false );
            navigation.navigate( "LoginNavigator" );
          }}
          buttonType="focus"
        />
      )}
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={SCROLL_VIEW_STYLE}
      >
        <Header />
        <ForgotPasswordForm
          reset={reset}
        />
      </ScrollView>
    </LoginSignUpWrapper>
  );
};

export default ForgotPassword;
