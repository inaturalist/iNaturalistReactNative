// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, Pressable, Text, View
} from "react-native";
import { Searchbar } from "react-native-paper";

import { ObsEditContext } from "../../providers/contexts";
import useLoggedIn from "../../sharedHooks/useLoggedIn";
import useRemoteObsEditSearchResults from "../../sharedHooks/useRemoteSearchResults";
import { textStyles, viewStyles } from "../../styles/obsEdit/cvSuggestions";
import PlaceholderText from "../PlaceholderText";
import Button from "../SharedComponents/Buttons/Button";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import useCVSuggestions from "./hooks/useCVSuggestions";

const CVSuggestions = ( ): Node => {
  const {
    observations,
    currentObsIndex,
    updateTaxon
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const [showSeenNearby, setShowSeenNearby] = useState( true );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( 0 );
  const [q, setQ] = React.useState( "" );
  const list = useRemoteObsEditSearchResults( q, "taxa", "all" );
  const isLoggedIn = useLoggedIn( );

  const currentObs = observations[currentObsIndex];
  const hasPhotos = currentObs.observationPhotos;
  const { suggestions, status } = useCVSuggestions(
    currentObs,
    showSeenNearby,
    selectedPhotoIndex
  );

  const renderNavButtons = ( updateIdentification, id ) => {
    const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id } );
    return (
      <View>
        <Pressable onPress={navToTaxonDetails}>
          <PlaceholderText text="info" />
        </Pressable>
        <PlaceholderText text="compare tool" />
        <Pressable onPress={updateIdentification}>
          <PlaceholderText text="confirm id" />
        </Pressable>
      </View>
    );
  };

  const renderSuggestions = ( { item } ) => {
    const taxon = item && item.taxon;
    // destructuring so this doesn't cause a crash
    const mediumUrl = ( taxon && taxon.taxon_photos && taxon.taxon_photos[0].photo )
      ? taxon.taxon_photos[0].photo.medium_url
      : null;
    const uri = { uri: mediumUrl };

    const updateIdentification = ( ) => updateTaxon( taxon );

    return (
      <View style={viewStyles.row}>
        <Image
          source={uri}
          style={viewStyles.imageBackground}
        />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{taxon.preferred_common_name}</Text>
          <Text style={textStyles.text}>{taxon.name}</Text>
          {showSeenNearby
            && <PlaceholderText style={[textStyles.greenText]} text="seen nearby" />}
        </View>
        {renderNavButtons( updateIdentification, taxon.id )}
      </View>
    );
  };

  const renderSearchResults = ( { item } ) => {
    const uri = { uri: item.default_photo.square_url };

    const newTaxon = {
      name: item.name,
      preferred_common_name: item.preferred_common_name,
      id: item.id
    };

    const updateIdentification = ( ) => updateTaxon( newTaxon );

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
      return (
        <PlaceholderText
          style={[textStyles.explainerText]}
          text="you must be logged in to see computer vision suggestions"
        />
      );
    }
    if ( status === "no_results" ) {
      return (
        <PlaceholderText
          style={[textStyles.explainerText]}
          text="no computervision suggestions found"
        />
      );
    }

    return <ActivityIndicator />;
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

  const displayPhotos = ( ) => currentObs.observationPhotos.map( p => ( {
    uri: p.photo?.url || p?.photo?.localFilePath
  } ) );

  return (
    <ViewNoFooter>
      <View>
        {hasPhotos && (
          <PhotoCarousel
            photoUris={displayPhotos( )}
            setSelectedPhotoIndex={setSelectedPhotoIndex}
            selectedPhotoIndex={selectedPhotoIndex}
          />
        )}
        <Searchbar
          placeholder={t( "Tap-to-search-for-taxa" )}
          onChangeText={setQ}
          value={q}
          style={viewStyles.searchBar}
        />
      </View>
      {list.length > 0 ? displaySearchResults( ) : displaySuggestions( )}
      <Button
        level="primary"
        onPress={toggleSeenNearby}
        text={showSeenNearby ? "View species not seen nearby" : "View seen nearby"}
        testID="CVSuggestions.toggleSeenNearby"
      />
    </ViewNoFooter>
  );
};

export default CVSuggestions;
