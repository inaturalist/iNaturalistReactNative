// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { Body2, Button, Heading4 } from "components/SharedComponents";
import ViewNoFooter from "components/SharedComponents/ViewNoFooter";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Appbar } from "react-native-paper";

import GroupPhotoImage from "./GroupPhotoImage";
import flattenAndOrderSelectedPhotos from "./helpers/groupPhotoHelpers";

const GroupPhotos = ( ): Node => {
  const { createObservationsFromGroupedPhotos } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { selectedPhotos } = params;
  const observations = selectedPhotos.map( photo => ( {
    photos: [photo]
  } ) );

  // nesting observations under observations key to be able to rerender flatlist on selections
  const [obsToEdit, setObsToEdit] = useState( { observations } );
  const [selectedObservations, setSelectedObservations] = useState( [] );

  const updateFlatList = rerenderFlatList => {
    setObsToEdit( {
      ...obsToEdit,
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

  const renderImage = ( { item } ) => (
    <GroupPhotoImage
      item={item}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
    />
  );

  const extractKey = ( item, index ) => `${item.photos[0].uri}${index}`;

  const groupedPhotos = obsToEdit.observations;

  const combinePhotos = ( ) => {
    if ( selectedObservations.length < 2 ) { return; }

    const newObsList = [];

    const orderedPhotos = flattenAndOrderSelectedPhotos( selectedObservations );
    const mostRecentPhoto = orderedPhotos[0];

    // remove selected photos from observations
    groupedPhotos.forEach( obs => {
      const obsPhotos = obs.photos;
      const mostRecentSelected = obsPhotos.indexOf( mostRecentPhoto );

      if ( mostRecentSelected !== -1 ) {
        const newObs = { photos: orderedPhotos };
        newObsList.push( newObs );
      } else {
        const filteredPhotos = obsPhotos.filter( item => !orderedPhotos.includes( item ) );
        if ( filteredPhotos.length > 0 ) {
          newObsList.push( { photos: filteredPhotos } );
        }
      }
    } );

    setObsToEdit( { observations: newObsList } );
    setSelectedObservations( [] );
  };

  const separatePhotos = ( ) => {
    let maxCombinedPhotos = 0;

    selectedObservations.forEach( obs => {
      const numPhotos = obs.photos.length;
      if ( numPhotos > maxCombinedPhotos ) {
        maxCombinedPhotos = numPhotos;
      }
    } );

    // make sure at least one set of combined photos is selected
    if ( maxCombinedPhotos < 2 ) { return; }

    const separatedPhotos = [];
    const orderedPhotos = flattenAndOrderSelectedPhotos( selectedObservations );

    // create a list of grouped photos, with selected photos split into individual observations
    groupedPhotos.forEach( obs => {
      const obsPhotos = obs.photos;
      const filteredGroupedPhotos = obsPhotos.filter( item => orderedPhotos.includes( item ) );
      if ( filteredGroupedPhotos.length > 0 ) {
        filteredGroupedPhotos.forEach( photo => {
          separatedPhotos.push( { photos: [photo] } );
        } );
      } else {
        separatedPhotos.push( obs );
      }
    } );
    setObsToEdit( { observations: separatedPhotos } );
    setSelectedObservations( [] );
  };

  const removePhotos = ( ) => {
    const removedFromGroup = [];
    const orderedPhotos = flattenAndOrderSelectedPhotos( selectedObservations );

    // create a list of grouped photos, with selected photos removed
    groupedPhotos.forEach( obs => {
      const obsPhotos = obs.photos;
      const filteredGroupedPhotos = obsPhotos.filter( item => !orderedPhotos.includes( item ) );
      if ( filteredGroupedPhotos.length > 0 ) {
        removedFromGroup.push( { photos: filteredGroupedPhotos } );
      }
    } );
    // remove from group photos screen
    setObsToEdit( { observations: removedFromGroup } );
  };

  const navToObsEdit = async ( ) => {
    createObservationsFromGroupedPhotos( obsToEdit.observations );
    navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );
  };

  const loadingWheel = ( ) => <ActivityIndicator />;

  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected = selectedObservations?.[0]?.photos?.length > 1;

  return (
    <ViewNoFooter>
      <View className="mx-5">
        <Heading4 className="self-center">
          {t( "X-PHOTOS-X-OBSERVATIONS", {
            photoCount: groupedPhotos.length,
            observationCount: observations.length
          } )}
        </Heading4>
        <Body2 className="mt-5">{t( "Group-photos-onboarding" )}</Body2>
      </View>
      <FlatList
        className="mt-5"
        data={groupedPhotos}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        testID="GroupPhotos.list"
        ListEmptyComponent={loadingWheel}
      />
      {selectedObservations.length > 0 && (
        <Appbar.Header className="bg-white m-5">
          <Appbar.Action
            icon="combine-photos"
            onPress={( ) => combinePhotos( )}
            disabled={noObsSelected || oneObsSelected}
            accessibilityLabel={t( "Combine-Photos" )}
          />
          <Appbar.Action
            icon="separate-photos"
            onPress={( ) => separatePhotos( )}
            disabled={!obsWithMultiplePhotosSelected}
            accessibilityLabel={t( "Separate-Photos" )}
          />
          <Appbar.Action
            icon="trash-can"
            onPress={( ) => removePhotos( )}
            disabled={noObsSelected}
            accessibilityLabel={t( "Remove-Photos" )}
          />
        </Appbar.Header>
      )}
      <Button
        className="mx-5"
        level="focus"
        text={t( "UPLOAD-X-OBSERVATIONS", { count: observations.length } )}
        onPress={navToObsEdit}
        testID="GroupPhotos.next"
      />
    </ViewNoFooter>
  );
};

export default GroupPhotos;
