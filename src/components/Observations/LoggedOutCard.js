// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { Text } from "react-native-paper";

import { textStyles, viewStyles } from "../../styles/observations/loggedOutCard";

type Props = {
  numObsToUpload: number
}

const LoggedOutCard = ( { numObsToUpload }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <Pressable style={viewStyles.loggedOutCard} onPress={( ) => navigation.navigate( "login" )}>
      <Text variant="titleLarge" style={textStyles.centerText}>{t( "Log-in-to-iNaturalist" )}</Text>
      <Text variant="bodyLarge" style={textStyles.centerText}>
        {t( "X-unuploaded-observations", { observationCount: numObsToUpload } )}
      </Text>
    </Pressable>
  );
};

export default LoggedOutCard;
