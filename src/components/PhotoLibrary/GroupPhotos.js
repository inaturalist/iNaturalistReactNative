// @flow

import React, { useContext, useState } from "react";
import { FlatList, ActivityIndicator } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/photoLibrary/photoGallery";
import GroupPhotosHeader from "./GroupPhotosHeader";
import { ObsEditContext, PhotoGalleryContext } from "../../providers/contexts";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import GroupPhotosFooter from "./GroupPhotosFooter";
import Observation from "../../models/Observation";
import { orderByTimestamp, flattenAndOrderSelectedPhotos } from "./helpers/groupPhotoHelpers";
import GroupPhotoImage from "./GroupPhotoImage";

const GroupPhotos = ( ): Node => {
  const { addObservations } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { selectedPhotos, setSelectedPhotos } = useContext( PhotoGalleryContext );
  const albums = Object.keys( selectedPhotos );
  const observations = orderByTimestamp( albums, selectedPhotos );
  const [selectionMode, setSelectionMode] = useState( false );

  // nesting observations under observations key to be able to rerender flatlist on selections
  const [obsToEdit, setObsToEdit] = useState( { observations } );
  const [selectedObservations, setSelectedObservations] = useState( [] );

  const updateFlatList = ( rerenderFlatList ) => {
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

  const clearSelection = ( ) => setSelectedObservations( [] );

  const renderImage = ( { item } ) => (
    <GroupPhotoImage
      item={item}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
      selectionMode={selectionMode}
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

    let separatedPhotos = [];
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
    let removedPhotos = {};
    let removedFromGroup = [];

    const orderedPhotos = flattenAndOrderSelectedPhotos( );

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
    const obs = obsToEdit.observations;
    const obsPhotos = await Observation.createMutipleObsFromGalleryPhotos( obs );
    addObservations( obsPhotos );
    navigation.navigate( "ObsEdit" );
  };

  const loadingWheel = ( ) => <ActivityIndicator />;

  return (
    <ViewNoFooter>
      <GroupPhotosHeader
        photos={observations.length}
        observations={groupedPhotos.length}
      />
      <FlatList
        contentContainerStyle={viewStyles.centerImages}
        data={groupedPhotos}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={2}
        renderItem={renderImage}
        testID="GroupPhotos.list"
        ListEmptyComponent={loadingWheel}
      />
      <GroupPhotosFooter
        combinePhotos={combinePhotos}
        separatePhotos={separatePhotos}
        removePhotos={removePhotos}
        navToObsEdit={navToObsEdit}
        clearSelection={clearSelection}
        selectedObservations={selectedObservations}
        setSelectionMode={setSelectionMode}
        selectionMode={selectionMode}
      />
    </ViewNoFooter>
  );
};

export default GroupPhotos;
