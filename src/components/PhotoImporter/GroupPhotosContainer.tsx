// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import { useLayoutPrefs } from "sharedHooks";
import useStore from "stores/useStore";

import GroupPhotos from "./GroupPhotos";
import flattenAndOrderSelectedPhotos from "./helpers/groupPhotoHelpers";

const GroupPhotosContainer = ( ): Node => {
  const navigation = useNavigation( );
  const {
    screenAfterPhotoEvidence, isDefaultMode,
  } = useLayoutPrefs( );
  const setObservations = useStore( state => state.setObservations );
  const setGroupedPhotos = useStore( state => state.setGroupedPhotos );
  const groupedPhotos = useStore( state => state.groupedPhotos );
  const firstObservationDefaults = useStore( state => state.firstObservationDefaults ) || {};

  const [selectedObservations, setSelectedObservations] = useState( [] );
  const [isCreatingObservations, setIsCreatingObservations] = useState( false );
  const totalPhotos = groupedPhotos
    .reduce( ( count, current ) => count + current.photos.length, 0 );

  useEffect( ( ) => {
    navigation.setOptions( {
      headerTitle: t( "Group-Photos" ),
      headerSubtitle: t( "X-PHOTOS-X-OBSERVATIONS", {
        photoCount: totalPhotos,
        observationCount: groupedPhotos.length,
      } ),
    } );
  }, [totalPhotos, groupedPhotos, navigation] );

  const selectObservationPhotos = ( isSelected, observation ) => {
    if ( !isSelected ) {
      const updatedObservations = selectedObservations.concat( observation );
      setSelectedObservations( [...updatedObservations] );
    } else {
      const newSelection = selectedObservations;
      const selectedIndex = selectedObservations.indexOf( observation );
      newSelection.splice( selectedIndex, 1 );
      setSelectedObservations( [...newSelection] );
    }
  };

  const combinePhotos = () => {
    if ( selectedObservations.length < 2 ) {
      return;
    }

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
        const filteredPhotos = obsPhotos.filter(
          item => !orderedPhotos.includes( item ),
        );
        if ( filteredPhotos.length > 0 ) {
          newObsList.push( { photos: filteredPhotos } );
        }
      }
    } );

    setGroupedPhotos( newObsList );
    setSelectedObservations( [] );
  };

  const separatePhotos = () => {
    let maxCombinedPhotos = 0;

    selectedObservations.forEach( obs => {
      const numPhotos = obs.photos.length;
      if ( numPhotos > maxCombinedPhotos ) {
        maxCombinedPhotos = numPhotos;
      }
    } );

    // make sure at least one set of combined photos is selected
    if ( maxCombinedPhotos < 2 ) {
      return;
    }

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
    setGroupedPhotos( separatedPhotos );
    setSelectedObservations( [] );
  };

  const removePhotos = () => {
    const removedFromGroup = [];
    const orderedPhotos = flattenAndOrderSelectedPhotos( selectedObservations );

    // create a list of grouped photos, with selected photos removed
    groupedPhotos.forEach( obs => {
      const obsPhotos = obs.photos;
      const filteredGroupedPhotos = obsPhotos.filter(
        item => !orderedPhotos.includes( item ),
      );
      if ( filteredGroupedPhotos.length > 0 ) {
        removedFromGroup.push( { photos: filteredGroupedPhotos } );
      }
    } );

    // remove from group photos screen
    setGroupedPhotos( removedFromGroup );
    setSelectedObservations( [] );
  };

  const navBasedOnUserSettings = async ( ) => {
    setIsCreatingObservations( true );
    const newObservations = await Promise.all( groupedPhotos.map(
      ( { photos } ) => Observation.createObservationWithPhotos( photos ),
    ) );
    // If there are default attributes for new observations, assign them
    setObservations( newObservations.map( ( newObs, idx ) => ( {
      ...( idx === 0
        ? firstObservationDefaults
        : {}
      ),
      ...newObs,
    } ) ) );
    setIsCreatingObservations( false );
    if ( newObservations.length === 1 ) {
      if ( isDefaultMode ) {
        return navigation.navigate( "NoBottomTabStackNavigator", {
          screen: "Match",
          params: {
            entryScreen: "GroupPhotos",
            lastScreen: "GroupPhotos",
          },
        } );
      }

      // in advanced mode, navigate based on user preference
      return navigation.navigate( "NoBottomTabStackNavigator", {
        screen: screenAfterPhotoEvidence,
        params: {
          entryScreen: "GroupPhotos",
          lastScreen: "GroupPhotos",
        },
      } );
    }
    return navigation.navigate( "ObsEdit", { lastScreen: "GroupPhotos" } );
  };

  return (
    <GroupPhotos
      combinePhotos={combinePhotos}
      groupedPhotos={groupedPhotos}
      isCreatingObservations={isCreatingObservations}
      navBasedOnUserSettings={navBasedOnUserSettings}
      removePhotos={removePhotos}
      selectObservationPhotos={selectObservationPhotos}
      selectedObservations={selectedObservations}
      separatePhotos={separatePhotos}
      totalPhotos={totalPhotos}
    />
  );
};

export default GroupPhotosContainer;
