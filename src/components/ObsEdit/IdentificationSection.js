// @flow

import React, { useContext } from "react";
import {
  Text, Pressable, FlatList, View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "react-native-paper";

import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import { textStyles, viewStyles } from "../../styles/obsEdit/obsEdit";
import { iconicTaxaIds, iconicTaxaNames } from "../../dictionaries/iconicTaxaIds";
import { ObsEditContext } from "../../providers/contexts";
import PlaceholderText from "../PlaceholderText";

const IdentificationSection = ( ): Node => {
  const {
    currentObsIndex,
    observations,
    updateTaxon
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

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
            onPress={navToAddID}
          >
            <PlaceholderText text="edit" style={[textStyles.text]} />
          </Pressable>
        </View>
      );
    }
    return (
      <>
        <RoundGreenButton
          handlePress={navToAddID}
          buttonText="View Identification Suggestions"
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
