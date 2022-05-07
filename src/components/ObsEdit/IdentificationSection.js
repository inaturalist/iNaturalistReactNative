// @flow

import React, { useContext } from "react";
import { Text, Pressable, FlatList, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "react-native-paper";

import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import { ObsEditContext } from "../../providers/contexts";

const IdentificationSection = ( { taxon } ): Node => {
  const {
    updateTaxon
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const updateIdentification = ( taxon ) => updateTaxon( taxon );

  const navToSuggestionsPage = ( ) => navigation.navigate( "Suggestions" );

  const renderIconicTaxaButton = ( { item } ) => {
    const id = iconicTaxaIds[item];
    const label = t( iconicTaxaNames[id] );
    const selected = taxon && id === taxon.id;
    return (
      <Pressable
        onPress={( ) => updateIdentification( { id, preferred_common_name: label } )}
      >
        <Avatar.Text
          size={54}
          label={label}
          labelStyle={textStyles.smallLabel}
          style={[viewStyles.iconicTaxaButtons, selected && viewStyles.selected]}
        />
      </Pressable>
    );
  };

  const displayIdentification = ( ) => {
    if ( taxon ) {
      return (
        <View style={viewStyles.row}>
          <View>
            <Text style={textStyles.text}>
              {taxon.preferred_common_name}
            </Text>
            <Text style={textStyles.text}>
              {taxon.name}
            </Text>
          </View>
          <Pressable
            onPress={navToSuggestionsPage}
          >
            <Text style={textStyles.text}>edit</Text>
          </Pressable>
        </View>
      );
    } else {
      return (
        <>
          <RoundGreenButton
            handlePress={navToSuggestionsPage}
            buttonText="View Identification Suggestions"
            testID="ObsEdit.Suggestions"
          />
          <Text style={textStyles.text}>
            {taxon && taxon.id && t( iconicTaxaNames[taxon.id] )}
          </Text>
        </>
      );
    }
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
