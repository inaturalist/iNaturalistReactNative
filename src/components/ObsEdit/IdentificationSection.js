// @flow

import { useNavigation } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import { Text, View } from "components/styledComponents";
import { iconicTaxaNames } from "dictionaries/iconicTaxaIds";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "react-native-paper";
import { textStyles, viewStyles } from "styles/obsEdit/obsEdit";

const IdentificationSection = ( ): Node => {
  const {
    currentObservation,
    updateObservationKey
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

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
    <>
      <Button
        level="primary"
        onPress={navToAddID}
        text="Add-an-Identification"
        style={viewStyles.button}
        testID="ObsEdit.Suggestions"
      />
      <Text style={textStyles.text}>
        {identification && identification.id && t( iconicTaxaNames[identification.id] )}
      </Text>
    </>
  );
};

export default IdentificationSection;
