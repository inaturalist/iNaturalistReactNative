// @flow

import { useNavigation } from "@react-navigation/native";
import { CloseButton, WarningSheet } from "components/SharedComponents";
import {
  Image, ScrollView, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { openInbox } from "react-native-email-link";

import {
  resetPassword
} from "./AuthenticationService";
import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const ForgotPassword = ( ): Node => {
  const navigation = useNavigation( );
  const [hideHeader, setHideHeader] = useState( false );
  const [showSheet, setShowSheet] = useState( false );

  const handleInputFocus = ( ) => setHideHeader( true );

  useEffect( () => {
    const unsubscribe = navigation.addListener( "blur", () => {
      setHideHeader( false );
    } );

    return unsubscribe;
  }, [navigation] );

  const reset = async email => {
    await resetPassword( email );
    setHideHeader( false );
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
          snapPoints={[178]}
          text={t( "If-an-account-with-that-email-exists" )}
          buttonText={t( "OPEN-EMAIL" )}
          secondButtonText={t( "BACK-TO-LOGIN" )}
          handleSecondButtonPress={( ) => {
            setShowSheet( false );
            navigation.navigate( "Login" );
          }}
          buttonType="focus"
        />
      )}
      <ScrollView
        keyboardShouldPersistTaps="always"
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{
          flex: 1,
          justifyContent: "space-between"
        }}
      >
        {!hideHeader && (
          <View>
            <CloseButton size={22} icon="chevron-left" />
            <Image
              className="w-[234px] h-[43px] self-center"
              resizeMode="contain"
              source={require( "images/inaturalist.png" )}
              accessibilityIgnoresInvertColors
            />
          </View>
        )}
        <ForgotPasswordForm
          handleInputFocus={handleInputFocus}
          hideHeader={hideHeader}
          reset={reset}
        />
      </ScrollView>
    </LoginSignUpWrapper>
  );
};

export default ForgotPassword;
