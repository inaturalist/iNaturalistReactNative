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

const IdentificationSection = ( ): Node => {
  const {
    currentObsNumber,
    observations,
    updateObservationKey,
    identification
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const currentObs = observations[currentObsNumber];

  const updateTaxaId = taxaId => updateObservationKey( "taxon_id", taxaId );

  const navToSuggestionsPage = ( ) => navigation.navigate( "Suggestions" );

  const renderIconicTaxaButton = ( { item } ) => {
    const id = iconicTaxaIds[item];
    return (
      <Pressable
        onPress={( ) => updateTaxaId( id )}
        style={viewStyles.iconicTaxaButtons}
      >
        <Avatar.Text
          size={54}
          label={ t( iconicTaxaNames[id] ) }
          labelStyle={textStyles.smallLabel}
        />
      </Pressable>
    );
  };

  const displayIdentification = ( ) => {
    if ( identification ) {
      return (
        <View style={viewStyles.row}>
          <View>
            <Text style={textStyles.text}>
              {identification.preferred_common_name}
            </Text>
            <Text style={textStyles.text}>
              {identification.name}
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
            {currentObs.taxon_id && t( iconicTaxaNames[currentObs.taxon_id] )}
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
