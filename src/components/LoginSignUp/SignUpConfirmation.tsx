import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import { openInbox } from "sharedHelpers/mail.ts";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const textClass = "color-white self-center text-center mt-5 px-10";

const SignUpConfirmation = ( ) => {
  const navigation = useNavigation( );

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/background/pink_flower.jpg" )}>
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
            className="color-white self-center mt-[31px] mb-[35px] underline"
            onPress={( ) => navigation.navigate( "TabNavigator" )}
          >
            {t( "Continue-to-iNaturalist" )}
          </Body1>
        </View>
      </View>
    </LoginSignUpWrapper>
  );
};

export default SignUpConfirmation;
