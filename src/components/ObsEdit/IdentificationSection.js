// @flow

import { useNavigation } from "@react-navigation/native";
import { Button, INatIcon } from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton, useTheme } from "react-native-paper";

const IdentificationSection = ( ): Node => {
  const {
    currentObservation,
    updateObservationKey
  } = useContext( ObsEditContext );
  const theme = useTheme( );
  const navigation = useNavigation( );

  const identification = currentObservation.taxon;

  const onIDAdded = async id => updateObservationKey( "taxon", id.taxon );

  const navToAddID = ( ) => navigation.navigate( "AddID", {
    onIDAdded,
    hideComment: true,
    goBackOnSave: true,
    clearSearch: true
  } );

  if ( identification ) {
    return (
      <View className="flex-row justify-between items-center ml-3 mt-2">
        <View className="flex-row items-center">
          <IconButton icon="pencil" size={14} />
          <View>
            <Text>{identification.preferred_common_name}</Text>
            <Text>{identification.name}</Text>
          </View>
        </View>
        <IconButton icon="pencil" onPress={navToAddID} />
      </View>
    );
  }

  return (
    <View className="flex-row justify-start ml-4">
      <Button
        level="focus"
        onPress={navToAddID}
        text={t( "ADD-AN-ID" )}
        className="my-4 rounded-full"
        testID="ObsEdit.Suggestions"
        icon={
          <INatIcon name="sparkly-label" size={24} color={theme.colors.onPrimary} />
        }
      />
    </View>
  );
};

export default IdentificationSection;
