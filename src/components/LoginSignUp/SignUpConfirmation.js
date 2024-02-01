// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { openInbox } from "react-native-email-link";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const textClass = "color-white self-center text-center mt-5 px-10";

const SignUpConfirmation = ( ): Node => {
  const navigation = useNavigation( );

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/pink_flower.png" )}>
      <View className="flex-1 justify-between">
        <Header />
        <View className="px-4">
          <Body1 className={textClass}>
            {t( "One-last-step" )}
          </Body1>
          <Body1 className={textClass}>
            {t( "We-sent-a-confirmation-email" )}
          </Body1>
          <Body1 className={textClass}>
            {t( "Please-click-the-link" )}
          </Body1>
          <Button
            level="focus"
            text={t( "OPEN-EMAIL" )}
            onPress={( ) => openInbox( )}
            className="mt-[30px]"
            testID="Login.loginButton"
          />
          <Body1
            className="color-white self-center mt-[30px] underline"
            onPress={( ) => navigation.navigate( "LoginNavigator", { screen: "Login" } )}
          >
            {t( "Return-to-Login" )}
          </Body1>
        </View>
      </View>
    </LoginSignUpWrapper>
  );
};

export default SignUpConfirmation;
