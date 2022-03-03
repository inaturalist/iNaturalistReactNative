// @flow

import React, { useContext } from "react";
import type { Node } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from "react-native";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import ObsEditSearch from "./ObsEditSearch";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import useCVSuggestions from "./hooks/useCVSuggestions";
import { viewStyles, textStyles } from "../../styles/obsEdit/cvSuggestions";

const CVSuggestions = ( ): Node => {
  const {
    observations,
    currentObsNumber,
    updateTaxaId,
    setIdentification
  } = useContext( ObsEditContext );

  const currentObs = observations[currentObsNumber];
  const suggestions = useCVSuggestions( currentObs );

  const renderSuggestions = ( { item } ) => {
    const uri = { uri: item.taxon.taxon_photos[0].photo.medium_url };
    return (
      <Pressable
        onPress={( ) => {
          setIdentification( item.taxon );
          updateTaxaId( item.taxon.id );
        }}
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
      {/* <ObsEditSearch
        source="taxa"
        handlePress={updateTaxaId}
      /> */}
      <FlatList
        data={suggestions}
        renderItem={renderSuggestions}
        ListEmptyComponent={( ) => <ActivityIndicator />}
      />
    </ViewNoFooter>
  );
};

export default CVSuggestions;
