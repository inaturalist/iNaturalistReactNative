// @flow

import React, { useContext, useState } from "react";
import { Pressable, Image, FlatList, ActivityIndicator, Text, View } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import { imageStyles, viewStyles, textStyles } from "../../styles/photoLibrary/photoGallery";
import GroupPhotosHeader from "./GroupPhotosHeader";
import { ObsEditContext } from "../../providers/contexts";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import GroupPhotosFooter from "./GroupPhotosFooter";

const GroupPhotos = ( ): Node => {
  const navigation = useNavigation( );
  const { selectedPhotos, setSelectedPhotos } = useContext( ObsEditContext );
  const albums = Object.keys( selectedPhotos );
  console.log( selectedPhotos, "selected photos" );

  const sortByTime = array => array.sort( ( a, b ) => b.timestamp - a.timestamp );

  const orderByTimestamp = ( ) => {
    let unorderedPhotos = [];
    albums.forEach( album => {
      unorderedPhotos = unorderedPhotos.concat( selectedPhotos[album] );
    } );

    // sort photos from all albums by time
    const ordered = sortByTime( unorderedPhotos );

    // nest under observationPhotos
    return ordered.map( photo => {
      return {
        observationPhotos: [photo]
      };
    } );
  };

  const observations = orderByTimestamp( );

  const [photosForObservations, setPhotosForObservations] = useState( {
    observations
  } );
  const [selectedObservations, setSelectedObservations] = useState( [] );

  const updateFlatList = ( rerenderFlatList ) => {
    setPhotosForObservations( {
      ...photosForObservations,
      // there might be a better way to do this, but adding this key forces the FlatList
      // to rerender anytime an observation is unselected
      rerenderFlatList
     } );
  };

  const selectObservationPhotos = ( isSelected, observation ) => {
    // select individual observation photos, which can be combined into a single observation
    // if selecting a combined observation, can separate photos into multiple observations
    // can a user select more than one combined observation at once?
    if ( !isSelected ) {
      const updatedObservations = selectedObservations.concat( observation );
      setSelectedObservations( updatedObservations );
      updateFlatList( false );
    } else {
      const newSelection = selectedObservations;
      const selectedIndex = selectedObservations.indexOf( observation );
      newSelection.splice( selectedIndex, 1 );

      setSelectedObservations( newSelection );
      updateFlatList( true );
    }
  };

  const clearSelection = ( ) => setSelectedObservations( [] );

  const renderImage = ( { item } ) => {
    const firstPhoto = item.observationPhotos[0];
    const isSelected = selectedObservations.includes( item );
    const hasMultiplePhotos = item.observationPhotos.length > 1;

    const handlePress = ( ) => selectObservationPhotos( isSelected, item );

    const imageUri = firstPhoto && { uri: firstPhoto.uri };
    return (
      <Pressable
        onPress={handlePress}
        testID={`GroupPhotos.${firstPhoto.uri}`}
      >
        {hasMultiplePhotos && (
          <View style={viewStyles.multiplePhotoTextBackground}>
            <Text style={textStyles.multiplePhotoText}>{item.observationPhotos.length}</Text>
          </View>
        )}
        <Image
          testID="GroupPhotos.photo"
          source={imageUri}
          style={[
            imageStyles.imagesForGrouping,
            isSelected ? imageStyles.selected : null
          ]}
        />
      </Pressable>
    );
  };

  const extractKey = ( item, index ) => `${item}${index}`;

  const photos = photosForObservations.observations;
  const photoSelected = selectedObservations.length > 0;

  const flattenAndOrderSelectedPhotos = ( ) => {
    // combine selected observations into a single array
    let combinedPhotos = [];
    selectedObservations.forEach( obs => {
      combinedPhotos = combinedPhotos.concat( obs.observationPhotos );
    } );

    // sort selected observations by timestamp and avoid duplicates
    return [...new Set( sortByTime( combinedPhotos ) ) ];
  };

  // this feels like a lot of convoluted code, but it works
  const combinePhotos = ( ) => {
    if ( selectedObservations < 2 ) {
      return;
    }
    const orderedPhotos = flattenAndOrderSelectedPhotos( );
    const mostRecentPhoto = orderedPhotos[0];

    let list = photosForObservations.observations;

    const newObsList = { observations: [] };

    // remove selected photos from observations
    list.forEach( observation => {
      const obsPhotos = observation.observationPhotos;
      const mostRecentSelected = obsPhotos.indexOf( mostRecentPhoto );
      if ( mostRecentSelected !== -1 ) {
        const newObs = { observationPhotos: orderedPhotos };
        newObsList.observations.push( newObs );
      } else {
        const removeSelectedPhotos = {
          observationPhotos: []
        };
        obsPhotos.forEach( photo => {
          if ( orderedPhotos.includes( photo ) ) {
            return;
          } else {
            removeSelectedPhotos.observationPhotos.push( photo );
          }
          newObsList.observations.push( removeSelectedPhotos );
        } );
      }
    } );

    setPhotosForObservations( newObsList );
  };

  const separatePhotos = ( ) => {
    if ( selectedObservations < 2 ) {
      return;
    }
    console.log( "separate photos", photosForObservations );
  };

  const removePhotos = ( ) => {
    let removedPhotos = {};
    let removedFromGroup = [];

    const orderedPhotos = flattenAndOrderSelectedPhotos( );
    const groupedPhotos = photosForObservations.observations;

    // create a list of selected photos in each album, with selected photos removed
    albums.forEach( album => {
      const currentAlbum = selectedPhotos[album];
      const filteredAlbum = currentAlbum && currentAlbum.filter( item => !orderedPhotos.includes( item ) );
      removedPhotos.album = filteredAlbum;
    } );

    // remove from camera roll screen
    setSelectedPhotos( removedPhotos );

    // create a list of grouped photos, with selected photos removed
    groupedPhotos.forEach( obs => {
      const obsPhotos = obs.observationPhotos;
      const filteredGroupedPhotos = obsPhotos.filter( item => !orderedPhotos.includes( item ) );
      if ( filteredGroupedPhotos.length > 0 ) {
        removedFromGroup.push( { observationPhotos: filteredGroupedPhotos } );
      }
    } );
    // remove from group photos screen
    setPhotosForObservations( { observations: removedFromGroup } );
  };

  const navToObsEdit = ( ) => {
    console.log( "nav to obs edit" );
    // on obs edit, can delete one obs

    // 10 photos, 1 sound per obs
  };

  // cap at 20 photos
  // max 10 photos per observation

  // animation
  // in 1.2 second
  // stay 3-4 seconds
  // out 1.2 second

  return (
    <ViewNoFooter>
      <GroupPhotosHeader
        photos={observations.length}
        observations={photos.length}
        isSelected={photoSelected}
        clearSelection={clearSelection}
      />
      <FlatList
        contentContainerStyle={viewStyles.centerImages}
        data={photos}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        testID="GroupPhotos.list"
        ListEmptyComponent={( ) => <ActivityIndicator />}
      />
      {photoSelected && (
        <GroupPhotosFooter
          combinePhotos={combinePhotos}
          separatePhotos={separatePhotos}
          removePhotos={removePhotos}
          navToObsEdit={navToObsEdit}
        />
      )}
    </ViewNoFooter>
  );
};

export default GroupPhotos;
