// @flow

import React from "react";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { Headline, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";

import { ObsEditContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/obsDetails/obsDetailsHeader";
import { colors } from "../../styles/global";

type Props = {
  observationUUID: string,
  isCurrentUserObservation: boolean
}

const ObsDetailsHeader = ( { observationUUID, isCurrentUserObservation }: Props ): Node => {
  const { openSavedObservation } = React.useContext( ObsEditContext );

  const { t } = useTranslation( );
  const navigation = useNavigation( );

  const navToObsEdit = async ( ) => {
    await openSavedObservation( observationUUID );
    navigation.navigate( "camera", {
      screen: "ObsEdit"
    } );
  };

  const goBack = ( ) => navigation.goBack( );

  return (
    <View style={viewStyles.headerRow}>
      <HeaderBackButton onPress={goBack} />
      <Headline>{t( "Observation" )}</Headline>
      {isCurrentUserObservation ? <Button icon="pencil" onPress={navToObsEdit} color={colors.gray} /> : <View />}
    </View>
  );
};

export default ObsDetailsHeader;
