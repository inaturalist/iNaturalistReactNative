// @flow

import { useNavigation } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton } from "react-native-paper";

const IdentificationSection = ( ): Node => {
  const {
    currentObservation,
    updateObservationKey
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );

  const identification = currentObservation.taxon;

  const onIDAdded = async id => updateObservationKey( "taxon", id.taxon );

  const navToAddID = ( ) => navigation.push( "AddID", {
    onIDAdded,
    hideComment: true,
    goBackOnSave: true
  } );

  if ( identification ) {
    return (
      <View className="flex-row justify-between items-center mx-5 mt-2">
        <View>
          <Text>{identification.preferred_common_name}</Text>
          <Text>{identification.name}</Text>
        </View>
        <IconButton icon="pencil" onPress={navToAddID} />
      </View>
    );
  }

  return (
    <Button
      level="focus"
      onPress={navToAddID}
      text={t( "Add-an-Identification" )}
      className="mx-10 my-3"
      testID="ObsEdit.Suggestions"
    />
  );
};

export default IdentificationSection;
