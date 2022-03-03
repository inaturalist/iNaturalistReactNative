// @flow

import React, { useContext, useState } from "react";
import type { Node } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from "react-native";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import ObsEditSearch from "./ObsEditSearch";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import useCVSuggestions from "./hooks/useCVSuggestions";
import { viewStyles, textStyles } from "../../styles/obsEdit/cvSuggestions";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

const CVSuggestions = ( ): Node => {
  const {
    observations,
    currentObsNumber,
    updateTaxaId,
    setIdentification
  } = useContext( ObsEditContext );
  const [showSeenNearby, setShowSeenNearby] = useState( true );
  const [selectedPhoto, setSelectedPhoto] = useState( 0 );

  const currentObs = observations[currentObsNumber];
  const suggestions = useCVSuggestions( currentObs, showSeenNearby, selectedPhoto );

  const renderSuggestions = ( { item } ) => {
    const uri = { uri: item.taxon.taxon_photos[0].photo.medium_url };

    const updateIdentification = ( ) => {
      setIdentification( item.taxon );
      updateTaxaId( item.taxon.id );
    };

    return (
      <Pressable
        onPress={updateIdentification}
        style={viewStyles.row}
      >
        <Image
          source={uri}
          style={viewStyles.imageBackground}
        />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{item.taxon.preferred_common_name}</Text>
          <Text style={textStyles.text}>{item.taxon.name}</Text>
          {showSeenNearby && <Text style={textStyles.greenText}>seen nearby</Text>}
        </View>
      </Pressable>
    );
  };

  const toggleSeenNearby = ( ) => setShowSeenNearby( !showSeenNearby );

  return (
    <ViewNoFooter>
      <EvidenceList
        currentObs={currentObs}
        setSelectedPhoto={setSelectedPhoto}
        selectedPhoto={selectedPhoto}
      />
      {/* <ObsEditSearch
        source="taxa"
        handlePress={updateTaxaId}
      /> */}
      <FlatList
        data={suggestions}
        renderItem={renderSuggestions}
        ListEmptyComponent={( ) => <ActivityIndicator />}
      />
      <RoundGreenButton
        handlePress={toggleSeenNearby}
        buttonText={showSeenNearby ? "View species not seen nearby" : "View seen nearby"}
        testID="CVSuggestions.toggleSeenNearby"
      />
    </ViewNoFooter>
  );
};

export default CVSuggestions;
