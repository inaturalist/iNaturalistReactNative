// @flow

import { useNavigation } from "@react-navigation/native";
import { Button } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const LoginPrompt = ( ): Node => {
  const navigation = useNavigation( );

  return (
    <>
      <Text>{t( "Create-an-iNaturalist-account-to-save-your-observations" )}</Text>
      <Button
        level="neutral"
        text={t( "LOG-IN-TO-INATURALIST" )}
        className="py-1 mt-5"
        onPress={( ) => navigation.navigate( "login" )}
      />
    </>
  );
};

export default LoginPrompt;
