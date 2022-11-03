// @flow
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import { formatDateAndTime } from "sharedHelpers/dateAndTime";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";

import { UploadContext } from "./contexts";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const [currentObsIndex, setCurrentObsIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );
  const [cameraPreviewUris, setCameraPreviewUris] = useState( [] );
  const [galleryUris, setGalleryUris] = useState( [] );
  const [evidenceToAdd, setEvidenceToAdd] = useState( [] );

  const allObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris],
    [cameraPreviewUris, galleryUris]
  );

  const currentObs = observations[currentObsIndex];

  const addSound = async ( ) => {
    const newObs = await Observation.createObsWithSounds( );
    setObservations( [newObs] );
  };

  const addObservations = async obs => setObservations( obs );

  const createObservationNoEvidence = async ( ) => {
    const newObs = await Observation.new( );
    setObservations( [newObs] );
  };

  const createObsPhotos = useCallback( async photos => Promise.all(
    photos.map( async photo => ObservationPhoto.new( photo?.image?.uri ) )
  ), [] );

  const createObservationFromGalleryPhoto = useCallback( async photo => {
    const latitude = photo?.location?.latitude || null;
    const longitude = photo?.location?.longitude || null;
    const placeGuess = await fetchPlaceName( latitude, longitude );
    // create a new observation using the data in the first grouped photo
    // TODO: figure out if we want to loop through observations, looking for one
    // with lat/lng, if the first photo lat/lng is blank
    const newObs = {
      latitude,
      longitude,
      time_observed_at: formatDateAndTime( photo.timestamp ),
      place_guess: placeGuess
    };
    return Observation.new( newObs );
  }, [] );

  const createObservationsFromGroupedPhotos = useCallback( async obs => {
    const newObservations = await Promise.all( obs.map( async ( { photos } ) => {
      const firstPhoto = photos[0];
      const newLocalObs = await createObservationFromGalleryPhoto( firstPhoto );
      newLocalObs.observationPhotos = await createObsPhotos( photos );
      return newLocalObs;
    } ) );
    setObservations( newObservations );
  }, [createObsPhotos, createObservationFromGalleryPhoto] );

  const createObservationFromGallery = useCallback( async photo => {
    const newLocalObs = await createObservationFromGalleryPhoto( photo );
    newLocalObs.observationPhotos = await createObsPhotos( [photo] );
    setObservations( [newLocalObs] );
  }, [createObsPhotos, createObservationFromGalleryPhoto] );

  const appendObsPhotos = useCallback( obsPhotos => {
    const currentObsPhotos = currentObs?.observationPhotos;

    const updatedObs = currentObs;
    updatedObs.observationPhotos = [...currentObsPhotos, ...obsPhotos];
    setObservations( [updatedObs] );
    // clear additional evidence
    setEvidenceToAdd( [] );
  }, [currentObs] );

  const addGalleryPhotosToCurrentObs = useCallback( async photos => {
    const obsPhotos = await createObsPhotos( photos );
    appendObsPhotos( obsPhotos );
  }, [createObsPhotos, appendObsPhotos] );

  const createObsWithCameraPhotos = useCallback( async localFilePaths => {
    const newObs = await Observation.new( );
    const obsPhotos = await Promise.all( localFilePaths.map(
      async photo => ObservationPhoto.new( photo )
    ) );
    newObs.observationPhotos = obsPhotos;
    setObservations( [newObs] );
  }, [] );

  const addCameraPhotosToCurrentObs = useCallback( async localFilePaths => {
    const obsPhotos = await Promise.all( localFilePaths.map(
      async photo => ObservationPhoto.new( photo )
    ) );
    appendObsPhotos( obsPhotos );
  }, [appendObsPhotos] );

  const uploadValue = useMemo( ( ) => {
    const updateObservationKey = ( key, value ) => {
      const updatedObservations = observations.map( ( obs, index ) => {
        if ( index === currentObsIndex ) {
          return {
            ...( obs.toJSON ? obs.toJSON( ) : obs ),
            // $FlowFixMe
            [key]: value
          };
        }
        return obs;
      } );
      setObservations( updatedObservations );
    };

    const updateObservationKeys = keysAndValues => {
      const updatedObservations = observations.map( ( obs, index ) => {
        if ( index === currentObsIndex ) {
          const updatedObservation = {
            ...( obs.toJSON ? obs.toJSON( ) : obs ),
            ...keysAndValues
          };
          return updatedObservation;
        }
        return obs;
      } );
      setObservations( updatedObservations );
    };

    const setNextScreen = ( ) => {
      if ( observations.length === 1 ) {
        setCurrentObsIndex( 0 );
        setObservations( [] );

        navigation.navigate( "ObsList" );
      } else if ( currentObsIndex === observations.length - 1 ) {
        observations.pop( );
        setCurrentObsIndex( observations.length - 1 );
        setObservations( observations );
      } else {
        observations.splice( currentObsIndex, 1 );
        setCurrentObsIndex( currentObsIndex );
        // this seems necessary for rerendering the ObsEdit screen
        setObservations( [] );
        setObservations( observations );
      }
    };

    return {
      createObservationNoEvidence,
      addObservations,
      createObsWithCameraPhotos,
      addSound,
      currentObs,
      currentObsIndex,
      observations,
      setCurrentObsIndex,
      setObservations,
      updateObservationKey,
      updateObservationKeys,
      setNextScreen,
      cameraPreviewUris,
      setCameraPreviewUris,
      galleryUris,
      setGalleryUris,
      allObsPhotoUris,
      createObservationsFromGroupedPhotos,
      addGalleryPhotosToCurrentObs,
      createObservationFromGallery,
      evidenceToAdd,
      setEvidenceToAdd,
      addCameraPhotosToCurrentObs
    };
  }, [
    currentObs,
    currentObsIndex,
    navigation,
    observations,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    galleryUris,
    allObsPhotoUris,
    createObservationsFromGroupedPhotos,
    addGalleryPhotosToCurrentObs,
    createObservationFromGallery,
    evidenceToAdd,
    setEvidenceToAdd,
    addCameraPhotosToCurrentObs
  ] );

  return (
    <UploadContext.Provider value={uploadValue}>
      {children}
    </UploadContext.Provider>
  );
};

export default ObsEditProvider;
