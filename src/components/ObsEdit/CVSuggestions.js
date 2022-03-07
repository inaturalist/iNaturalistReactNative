// @flow

import React, { useContext, useState } from "react";
import type { Node } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from "react-native";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import useCVSuggestions from "./hooks/useCVSuggestions";
import { viewStyles, textStyles } from "../../styles/obsEdit/cvSuggestions";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import useRemoteObsEditSearchResults from "../../sharedHooks/useRemoteSearchResults";
import InputField from "../SharedComponents/InputField";

const CVSuggestions = ( ): Node => {
  const {
    observations,
    currentObsNumber,
    updateTaxaId,
    setIdentification
  } = useContext( ObsEditContext );
  const [showSeenNearby, setShowSeenNearby] = useState( true );
  const [selectedPhoto, setSelectedPhoto] = useState( 0 );
  const [q, setQ] = React.useState( "" );
  // choose users or taxa
  const list = useRemoteObsEditSearchResults( q, "taxa" );

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

  const renderSearchResults = ( { item } ) => {
    const uri = { uri: item.default_photo.square_url };

    const updateIdentification = ( ) => {
      setIdentification( {
        name: item.name,
        preferred_common_name: item.preferred_common_name
      } );
      updateTaxaId( item.taxon_id );
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
          <Text style={textStyles.text}>{item.preferred_common_name}</Text>
          <Text style={textStyles.text}>{item.name}</Text>
        </View>
      </Pressable>
    );
  };

  const toggleSeenNearby = ( ) => setShowSeenNearby( !showSeenNearby );

  const displaySuggestions = ( ) => (
    <FlatList
      data={suggestions}
      renderItem={renderSuggestions}
      ListEmptyComponent={( ) => <ActivityIndicator />}
    />
  );

  const displaySearchResults = ( ) => (
    <FlatList
      data={list}
      renderItem={renderSearchResults}
    />
  );

  return (
    <ViewNoFooter>
      <EvidenceList
        currentObs={currentObs}
        setSelectedPhoto={setSelectedPhoto}
        selectedPhoto={selectedPhoto}
      />
      <InputField
        handleTextChange={setQ}
        placeholder="search for taxa"
        text={q}
        type="none"
      />
      {list ? displaySearchResults( ) : displaySuggestions( )}
      <RoundGreenButton
        handlePress={toggleSeenNearby}
        buttonText={showSeenNearby ? "View species not seen nearby" : "View seen nearby"}
        testID="CVSuggestions.toggleSeenNearby"
      />
    </ViewNoFooter>
  );
};

export default CVSuggestions;
