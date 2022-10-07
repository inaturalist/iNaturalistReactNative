// @flow

import { useNavigation } from "@react-navigation/native";
import CustomHeader from "components/SharedComponents/CustomHeader";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "react-native-paper";
import colors from "styles/colors";

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
    <CustomHeader
      headerText={t( "Observation" )}
      rightIcon={isLocal ? (
        <Button icon="pencil" onPress={navToObsEdit} textColor={colors.gray} />
      ) : <View />}
    />
  );
};

export default ObsDetailsHeader;
