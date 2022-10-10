// @flow

import { useNavigation } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import viewStyles from "styles/upload/uploadPrompt";

const LoginPrompt = ( ): Node => {
  const navigation = useNavigation( );

  return (
    <>
      <Text>{t( "Create-an-iNaturalist-account-to-save-your-observations" )}</Text>
      <Button
        level="neutral"
        text={t( "LOG-IN-TO-INATURALIST" )}
        style={viewStyles.button}
        onPress={( ) => navigation.navigate( "login" )}
      />
    </>
  );
};

export default LoginPrompt;
