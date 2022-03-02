// @flow

import React, { useContext } from "react";
import type { Node } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Observation from "../../models/Observation";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import ObsEditSearch from "./ObsEditSearch";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import useTaxaSuggestions from "./hooks/useTaxaSuggestions";
import { viewStyles, textStyles } from "../../styles/obsEdit/taxaSuggestions";

const TaxaSuggestions = ( ): Node => {
  const {
    observations,
    currentObsNumber,
    updateObservationKey
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );

  const currentObs = observations[currentObsNumber];

  const suggestions = useTaxaSuggestions( currentObs );

  const updateTaxaId = taxaId => {
    updateObservationKey( "taxon_id", taxaId );
    navigation.navigate( "ObsEdit" );
  };

  const renderSuggestions = ( { item } ) => {
    const uri = { uri: item.taxon.taxon_photos[0].photo.medium_url };
    return (
      <Pressable
        onPress={( ) => console.log( "handle press in render suggestions" )}
        style={viewStyles.row}
      >
        <Image
          source={uri}
          style={viewStyles.imageBackground}
        />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{item.taxon.preferred_common_name}</Text>
          <Text style={textStyles.text}>{item.taxon.name}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ViewNoFooter>
      <EvidenceList currentObs={currentObs} />
      <ObsEditSearch
        source="taxa"
        handlePress={updateTaxaId}
      />
      <FlatList
        data={suggestions}
        renderItem={renderSuggestions}
        ListEmptyComponent={( ) => <ActivityIndicator />}
        contentContainerStyle={viewStyles.suggestionList}
      />
    </ViewNoFooter>
  );
};

export default TaxaSuggestions;
