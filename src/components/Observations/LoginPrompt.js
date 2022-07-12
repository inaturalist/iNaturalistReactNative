// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import { Button } from "react-native-paper";

import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/observations/obsList";

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
