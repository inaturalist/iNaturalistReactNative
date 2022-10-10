// @flow

import { useNavigation } from "@react-navigation/native";
import { HeaderText, Pressable, Text } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  numOfUnuploadedObs: number
}

const LoggedOutCard = ( { numOfUnuploadedObs }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <Pressable
      onPress={( ) => navigation.navigate( "login" )}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-login-screen" )}
    >
      <HeaderText className="self-center color-white text-2xl">
        {t( "Log-in-to-iNaturalist" )}
      </HeaderText>
      <Text className="self-center color-white text-base">
        {t( "X-unuploaded-observations", { observationCount: numOfUnuploadedObs } )}
      </Text>
    </Pressable>
  );
};

export default LoggedOutCard;
