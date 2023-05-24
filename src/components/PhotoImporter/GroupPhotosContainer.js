// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";

import GroupPhotos from "./GroupPhotos";
import flattenAndOrderSelectedPhotos from "./helpers/groupPhotoHelpers";

const GroupPhotosContainer = ( ): Node => {
  const { createObservationsFromGroupedPhotos, photosToGroup } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const observations = photosToGroup.map( photo => ( {
    photos: [photo]
  } ) );

  const [obsToEdit, setObsToEdit] = useState( [] );
  const [selectedObservations, setSelectedObservations] = useState( [] );
  const totalPhotos = obsToEdit.reduce( ( count, current ) => count + current.photos.length, 0 );

  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        setObsToEdit( observations );
      } );
      navigation.addListener( "blur", ( ) => {
        setObsToEdit( [] );
      } );
    },
    [navigation, observations]
  );

  useEffect( ( ) => {
    navigation.setOptions( {
      headerSubtitle: t( "X-PHOTOS-X-OBSERVATIONS", {
        photoCount: totalPhotos,
        observationCount: obsToEdit.length
      } )
    } );
  }, [totalPhotos, obsToEdit, navigation] );

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
    obsToEdit.forEach( obs => {
      const obsPhotos = obs.photos;
      const mostRecentSelected = obsPhotos.indexOf( mostRecentPhoto );

      if ( mostRecentSelected !== -1 ) {
        const newObs = { photos: orderedPhotos };
        newObsList.push( newObs );
      } else {
        const filteredPhotos = obsPhotos.filter(
          item => !orderedPhotos.includes( item )
        );
        if ( filteredPhotos.length > 0 ) {
          newObsList.push( { photos: filteredPhotos } );
        }
      }
    } );

    setObsToEdit( newObsList );
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
    obsToEdit.forEach( obs => {
      const obsPhotos = obs.photos;
      const filteredobsToEdit = obsPhotos.filter( item => orderedPhotos.includes( item ) );
      if ( filteredobsToEdit.length > 0 ) {
        filteredobsToEdit.forEach( photo => {
          separatedPhotos.push( { photos: [photo] } );
        } );
      } else {
        separatedPhotos.push( obs );
      }
    } );
    setObsToEdit( separatedPhotos );
    setSelectedObservations( [] );
  };

  const removePhotos = () => {
    const removedFromGroup = [];
    const orderedPhotos = flattenAndOrderSelectedPhotos( selectedObservations );

    // create a list of grouped photos, with selected photos removed
    obsToEdit.forEach( obs => {
      const obsPhotos = obs.photos;
      const filteredobsToEdit = obsPhotos.filter(
        item => !orderedPhotos.includes( item )
      );
      if ( filteredobsToEdit.length > 0 ) {
        removedFromGroup.push( { photos: filteredobsToEdit } );
      }
    } );
    // remove from group photos screen
    setObsToEdit( removedFromGroup );
  };

  const navToObsEdit = async () => {
    createObservationsFromGroupedPhotos( obsToEdit );
    navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );
  };

  return (
    <GroupPhotos
      navToObsEdit={navToObsEdit}
      obsToEdit={obsToEdit}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
      combinePhotos={combinePhotos}
      removePhotos={removePhotos}
      separatePhotos={separatePhotos}
    />
  );
};

export default GroupPhotosContainer;
