import { useNavigation } from "@react-navigation/native";
import { WarningSheet } from "components/SharedComponents";
import type { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import React, { useCallback, useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { openInbox } from "sharedHelpers/mail";

import {
  resetPassword
} from "./AuthenticationService";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

type RenderProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  scrollViewRef: { current: null | React.Ref<typeof ScrollView> }
};

const ForgotPassword = ( ) => {
  const navigation = useNavigation( );
  const [showSheet, setShowSheet] = useState( false );

  const reset = useCallback( async ( email: string ) => {
    await resetPassword( email );
    setShowSheet( true );
    Keyboard.dismiss( );
  }, [setShowSheet] );

  const blurFields = () => {
    Keyboard.dismiss( );
  };

  const renderForgotPassword = useCallback( ( { scrollViewRef }: RenderProps ) => (
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
          loading={false}
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
