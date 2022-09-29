// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button, Headline } from "react-native-paper";
import colors from "styles/colors";
import { viewStyles } from "styles/obsDetails/obsDetailsHeader";

import { ObsEditContext } from "../../providers/contexts";

type Props = {
  observationUUID: string
}

const ObsDetailsHeader = ( { observationUUID }: Props ): Node => {
  const [isLocal, setIsLocal] = useState( null );
  const { openSavedObservation } = React.useContext( ObsEditContext );

  const { t } = useTranslation( );
  const navigation = useNavigation( );

  const navToObsEdit = ( ) => navigation.navigate( "ObsEdit" );

  useEffect( ( ) => {
    const checkForLocalObservation = async ( ) => {
      const isLocalObservation = await openSavedObservation( observationUUID );
      setIsLocal( isLocalObservation );
    };

    navigation.addListener( "focus", ( ) => {
      checkForLocalObservation( );
    } );
  }, [observationUUID, openSavedObservation, navigation] );

  return (
    <View style={viewStyles.headerRow}>
      <HeaderBackButton onPress={( ) => navigation.goBack( )} />
      <Headline>{t( "Observation" )}</Headline>
      {isLocal ? <Button icon="pencil" onPress={navToObsEdit} textColor={colors.gray} /> : <View />}
    </View>
  );
};

export default ObsDetailsHeader;
