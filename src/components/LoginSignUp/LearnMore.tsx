import { useNavigation } from "@react-navigation/native";
import {
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import Config from "react-native-config";
import { useTranslation } from "sharedHooks";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const BASE_URL = Config.OAUTH_API_URL;

const LearnMore = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  const navToUrl = useCallback( ( url: string, title: string ) => (
    navigation.navigate( "FullPageWebView", {
      title,
      initialUrl: url,
      loggedIn: false,
    } )
  ), [navigation] );

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/background/pink_flower.jpg" )}>
      <Header />
      <View className="flex-1 w-full h-full justify-center p-5">
        <Button
          text={t( "TERMS-OF-USE" )}
          onPress={() => navToUrl( `${BASE_URL}/terms`, t( "TERMS-OF-USE" ) )}
        />
        <Button
          text={t( "PRIVACY-POLICY" )}
          onPress={() => navToUrl( `${BASE_URL}/privacy`, t( "PRIVACY-POLICY" ) )}
          className="mt-5"
        />
        <Button
          text={t( "COMMUNITY-GUIDELINES" )}
          onPress={() => navToUrl(
            `${BASE_URL}/pages/community+guidelines`,
            t( "COMMUNITY-GUIDELINES" ),
          )}
          className="mt-5"
        />
      </View>
    </LoginSignUpWrapper>
  );
};

export default LearnMore;
