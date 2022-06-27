// @flow

import React from "react";
import { View } from "react-native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native-paper";

import { viewStyles, textStyles } from "../../styles/observations/loggedOutCard";

type Props = {
  // userId: number
}

const LoggedOutCard = ( ): Node => {
  const { t } = useTranslation( );

  const unuploadedObservations = 0;

  return (
    <View style={viewStyles.loggedOutCard}>
      <Text variant="titleLarge" style={textStyles.centerText}>{t( "Log-in-to-iNaturalist" )}</Text>
      <Text variant="bodyLarge" style={textStyles.centerText}>{t( "X-unuploaded-observations", { observationCount: unuploadedObservations } )}</Text>
    </View>
  );
};

export default LoggedOutCard;
