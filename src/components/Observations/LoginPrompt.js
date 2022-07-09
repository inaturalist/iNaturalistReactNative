// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";
import { Button } from "react-native-paper";
import { t } from "i18next";
import { useNavigation } from "@react-navigation/native";

import { viewStyles, textStyles } from "../../styles/observations/obsList";
import colors from "../../styles/colors";

const LoginPrompt = ( ): Node => {
  const navigation = useNavigation( );

  return (
    <>
      <Text>{t( "Create-an-iNaturalist-account-to-save-your-observations" )}</Text>
      <Button
        buttonColor={colors.logInGray}
        textColor={colors.white}
        style={viewStyles.grayButton}
        labelStyle={textStyles.grayButtonText}
        onPress={( ) => navigation.navigate( "login" )}
      >
        {t( "Log-in-to-iNaturalist" )}
      </Button>
    </>
  );
};

export default LoginPrompt;
