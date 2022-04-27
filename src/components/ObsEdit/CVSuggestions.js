// @flow

import React, { useContext, useState } from "react";
import type { Node } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Searchbar } from "react-native-paper";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import { ObsEditContext } from "../../providers/contexts";
import EvidenceList from "./EvidenceList";
import useCVSuggestions from "./hooks/useCVSuggestions";
import { viewStyles, textStyles } from "../../styles/obsEdit/cvSuggestions";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import useRemoteObsEditSearchResults from "../../sharedHooks/useRemoteSearchResults";
import InputField from "../SharedComponents/InputField";
import { useLoggedIn } from "../../sharedHooks/useLoggedIn";
import { t } from "i18next";
// TODO: do we need custom hook useTranslation or can we just use t from "i18next"?
// saves some lines of code if we don't need the extra hook

const CVSuggestions = ( ): Node => {
  const {
    observations,
    currentObsNumber,
    updateTaxaId,
    setIdentification
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const [showSeenNearby, setShowSeenNearby] = useState( true );
  const [selectedPhoto, setSelectedPhoto] = useState( 0 );
  const [q, setQ] = React.useState( "" );
  const list = useRemoteObsEditSearchResults( q, "taxa" );
  const isLoggedIn = useLoggedIn( );

  const currentObs = observations[currentObsNumber];
  const hasPhotos = currentObs.observationPhotos;
  const suggestions = useCVSuggestions( currentObs, showSeenNearby, selectedPhoto );

  const speciesGuess = ( taxon ) => {
    if ( !taxon ) { return null; }
    return taxon.preferred_common_name ? taxon.preferred_common_name : taxon.name;
  };

  const renderNavButtons = ( updateIdentification, id ) => {
    const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id } );
    return (
      <View>
        <Pressable onPress={navToTaxonDetails}>
          <Text>info</Text>
        </Pressable>
        <Text>compare tool</Text>
        <Pressable onPress={updateIdentification}>
          <Text>confirm id</Text>
        </Pressable>
      </View>
    );
  };

  const renderSuggestions = ( { item } ) => {
    const taxon = item && item.taxon;
    // destructuring so this doesn't cause a crash
    const mediumUrl = ( taxon && taxon.taxon_photos && taxon.taxon_photos[0].photo ) ? taxon.taxon_photos[0].photo.medium_url : null;
    const uri = { uri: mediumUrl };

    const updateIdentification = ( ) => {
      setIdentification( taxon );
      updateTaxaId( taxon.id, speciesGuess( taxon ) );
    };

    return (
      <View style={viewStyles.row}>
        <Image
          source={uri}
          style={viewStyles.imageBackground}
        />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{taxon.preferred_common_name}</Text>
          <Text style={textStyles.text}>{taxon.name}</Text>
          {showSeenNearby && <Text style={textStyles.greenText}>seen nearby</Text>}
        </View>
        {renderNavButtons( updateIdentification, taxon.id )}
      </View>
    );
  };

  const renderSearchResults = ( { item } ) => {
    const uri = { uri: item.default_photo.square_url };

    const updateIdentification = ( ) => {
      setIdentification( {
        name: item.name,
        preferred_common_name: item.preferred_common_name
      } );
      updateTaxaId( item.id, speciesGuess( item ) );
    };

    return (
      <View style={viewStyles.row}>
        <Image
          source={uri}
          style={viewStyles.imageBackground}
        />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{item.preferred_common_name}</Text>
          <Text style={textStyles.text}>{item.name}</Text>
        </View>
        {renderNavButtons( updateIdentification, item.id )}
      </View>
    );
  };

  const toggleSeenNearby = ( ) => setShowSeenNearby( !showSeenNearby );

  const emptySuggestionsList = ( ) => {
    if ( !isLoggedIn ) {
      return <Text style={textStyles.explainerText}>you must be logged in to see computer vision suggestions</Text>;
    } else {
      return <ActivityIndicator />;
    }
  };

  const displaySuggestions = ( ) => (
    <FlatList
      data={suggestions}
      renderItem={renderSuggestions}
      ListEmptyComponent={hasPhotos && emptySuggestionsList}
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
      <View>
        {hasPhotos && (
          <EvidenceList
            currentObs={currentObs}
            setSelectedPhoto={setSelectedPhoto}
            selectedPhoto={selectedPhoto}
          />
        )}
        <Searchbar
          placeholder={t( "Tap-to-search-for-taxa" )}
          onChangeText={setQ}
          value={q}
        />
        {/* <InputField
          handleTextChange={setQ}
          placeholder={t( "Tap-to-search-for-taxa" )}
          text={q}
          type="none"
        /> */}
      </View>
      {list.length > 0 ? displaySearchResults( ) : displaySuggestions( )}
      <RoundGreenButton
        handlePress={toggleSeenNearby}
        buttonText={showSeenNearby ? "View species not seen nearby" : "View seen nearby"}
        testID="CVSuggestions.toggleSeenNearby"
      />
    </ViewNoFooter>
  );
};

export default CVSuggestions;
