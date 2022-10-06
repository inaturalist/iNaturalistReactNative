// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import { ObsEditContext } from "../../providers/contexts";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import Button from "../SharedComponents/Buttons/Button";
import { Text, View } from "../styledComponents";

const IdentificationSection = ( ): Node => {
  const {
    currentObsIndex,
    observations,
    updateTaxon
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const { colors } = useTheme( );

  const currentObs = observations[currentObsIndex];
  const identification = currentObs.taxon;

  const updateIdentification = taxon => updateTaxon( taxon );

  const onIDAdded = async id => {
    console.log( "onIDAdded", id );
    updateIdentification( id.taxon );
  };

  const navToAddID = ( ) => navigation.push( "AddID", { onIDAdded, hideComment: true } );

  const renderIconicTaxaButton = ( { item } ) => {
    const id = iconicTaxaIds[item];
    const label = t( iconicTaxaNames[id] );
    const selected = identification && id === identification.id;
    return (
      <Avatar.Icon
        size={50}
        onPress={( ) => updateIdentification( { id, preferred_common_name: label } )}
        className="mx-3 my-3"
        style={[
          { backgroundColor: colors.tertiary },
          selected && viewStyles.selected
        ]}
      />
    );
  };

  const displayIdentification = ( ) => {
    if ( identification ) {
      return (
        <View className="flex-row justify-between mx-5 mt-2">
          <View>
            <Text>{identification.preferred_common_name}</Text>
            <Text>{identification.name}</Text>
          </View>
          <Avatar.Icon icon="pencil" onPress={navToAddID} size={35} style={viewStyles.editIcon} />
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

  return (
    <>
      {displayIdentification( )}
      <FlatList
        data={Object.keys( iconicTaxaIds )}
        horizontal
        renderItem={renderIconicTaxaButton}
      />
    </>
  );
};

export default IdentificationSection;
