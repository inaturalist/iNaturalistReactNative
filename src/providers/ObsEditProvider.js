// @flow
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import { formatDateAndTime } from "sharedHelpers/dateAndTime";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { parseExif, parseExifDateToLocalTimezone } from "sharedHelpers/parseExif";
import useApiToken from "sharedHooks/useApiToken";

import { ObsEditContext, RealmContext } from "./contexts";

const { useRealm } = RealmContext;

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const realm = useRealm( );
  const apiToken = useApiToken( );
  const [currentObservationIndex, setCurrentObservationIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );
  const [cameraPreviewUris, setCameraPreviewUris] = useState( [] );
  const [galleryUris, setGalleryUris] = useState( [] );
  const [evidenceToAdd, setEvidenceToAdd] = useState( [] );
  const [album, setAlbum] = useState( null );
  const [unsavedChanges, setUnsavedChanges] = useState( false );

  const resetObsEditContext = useCallback( ( ) => {
    setObservations( [] );
    setCurrentObservationIndex( 0 );
    setCameraPreviewUris( [] );
    setGalleryUris( [] );
    setEvidenceToAdd( [] );
  }, [] );

  const allObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris],
    [cameraPreviewUris, galleryUris]
  );

  const currentObservation = observations[currentObservationIndex];

  const addSound = async ( ) => {
    const newObservation = await Observation.createObsWithSounds( );
    setObservations( [newObservation] );
  };

  const addObservations = async obs => setObservations( obs );

  const createObservationNoEvidence = async ( ) => {
    const newObservation = await Observation.new( );
    setObservations( [newObservation] );
  };

  const createObsPhotos = useCallback( async photos => Promise.all(
    photos.map( async photo => ObservationPhoto.new( photo?.image?.uri ) )
  ), [] );

  const createObservationFromGalleryPhoto = useCallback( async photo => {
    const originalPhotoUri = photo?.image?.uri;
    const firstPhotoExif = await parseExif( originalPhotoUri );
    const exifDate = parseExifDateToLocalTimezone( firstPhotoExif.date );

    const observedOnDate = exifDate || formatDateAndTime( photo.timestamp );
    const latitude = firstPhotoExif.latitude || photo?.location?.latitude;
    const longitude = firstPhotoExif.longitude || photo?.location?.longitude;
    const placeGuess = await fetchPlaceName( latitude, longitude );

    const newObservation = {
      latitude,
      longitude,
      place_guess: placeGuess,
      observed_on_string: observedOnDate
    };

    if ( firstPhotoExif.positional_accuracy ) {
      // $FlowIgnore
      newObservation.positional_accuracy = firstPhotoExif.positional_accuracy;
    }
    return Observation.new( newObservation );
  }, [] );

  const createObservationsFromGroupedPhotos = useCallback( async groupedPhotoObservations => {
    const newObservations = await Promise.all( groupedPhotoObservations.map(
      async ( { photos } ) => {
        const firstPhoto = photos[0];
        const newLocalObs = await createObservationFromGalleryPhoto( firstPhoto );
        newLocalObs.observationPhotos = await createObsPhotos( photos );
        return newLocalObs;
      }
    ) );
    setObservations( newObservations );
  }, [createObsPhotos, createObservationFromGalleryPhoto] );

  const createObservationFromGallery = useCallback( async photo => {
    const newLocalObs = await createObservationFromGalleryPhoto( photo );
    newLocalObs.observationPhotos = await createObsPhotos( [photo] );
    setObservations( [newLocalObs] );
  }, [createObsPhotos, createObservationFromGalleryPhoto] );

  const appendObsPhotos = useCallback( obsPhotos => {
    const currentObservationPhotos = currentObservation?.observationPhotos;

    const updatedObs = currentObservation;
    updatedObs.observationPhotos = [...currentObservationPhotos, ...obsPhotos];
    setObservations( [updatedObs] );
    // clear additional evidence
    setEvidenceToAdd( [] );
    setUnsavedChanges( true );
  }, [currentObservation] );

  const addGalleryPhotosToCurrentObservation = useCallback( async photos => {
    const obsPhotos = await createObsPhotos( photos );
    appendObsPhotos( obsPhotos );
  }, [createObsPhotos, appendObsPhotos] );

  const createObsWithCameraPhotos = useCallback( async localFilePaths => {
    const newObservation = await Observation.new( );
    const obsPhotos = await Promise.all( localFilePaths.map(
      async photo => ObservationPhoto.new( photo )
    ) );
    newObservation.observationPhotos = obsPhotos;
    setObservations( [newObservation] );
  }, [] );

  const addCameraPhotosToCurrentObservation = useCallback( async localFilePaths => {
    const obsPhotos = await Promise.all( localFilePaths.map(
      async photo => ObservationPhoto.new( photo )
    ) );
    appendObsPhotos( obsPhotos );
  }, [appendObsPhotos] );

  const uploadValue = useMemo( ( ) => {
    const updateObservationKey = ( key, value ) => {
      const updatedObservations = observations.map( ( observation, index ) => {
        if ( index === currentObservationIndex ) {
          return {
            ...( observation.toJSON ? observation.toJSON( ) : observation ),
            [key]: value
          };
        }
        return observation;
      } );
      setObservations( updatedObservations );
      setUnsavedChanges( true );
    };

    const updateObservationKeys = keysAndValues => {
      const updatedObservations = observations.map( ( observation, index ) => {
        if ( index === currentObservationIndex ) {
          const updatedObservation = {
            ...( observation.toJSON ? observation.toJSON( ) : observation ),
            ...keysAndValues
          };
          return updatedObservation;
        }
        return observation;
      } );
      setObservations( updatedObservations );
      setUnsavedChanges( true );
    };

    const setNextScreen = ( ) => {
      if ( observations.length === 1 ) {
        setCurrentObservationIndex( 0 );
        setObservations( [] );

        navigation.navigate( "ObsList" );
      } else if ( currentObservationIndex === observations.length - 1 ) {
        observations.pop( );
        setCurrentObservationIndex( observations.length - 1 );
        setObservations( observations );
      } else {
        observations.splice( currentObservationIndex, 1 );
        setCurrentObservationIndex( currentObservationIndex );
        // this seems necessary for rerendering the ObsEdit screen
        setObservations( [] );
        setObservations( observations );
      }
    };

    const deleteLocalObservation = uuid => {
      realm?.write( ( ) => {
        realm?.delete( realm.objectForPrimaryKey( "Observation", uuid ) );
      } );
    };

    const saveObservation = async ( ) => {
      const localObs = await Observation.saveLocalObservationForUpload( currentObservation, realm );
      if ( localObs ) {
        setNextScreen( );
      }
    };

    const saveAndUploadObservation = async ( ) => {
      const localObs = await Observation.saveLocalObservationForUpload( currentObservation, realm );
      if ( !realm ) {
        throw new Error( "Gack, tried to save an observation without realm!" );
      }
      if ( !apiToken ) {
        throw new Error( "Gack, tried to save an observation without API token!" );
      }
      Observation.uploadObservation( localObs, apiToken, realm );
      if ( localObs ) {
        setNextScreen( );
      }
    };

    const removePhotoFromList = ( list, photo ) => {
      const updatedPhotoList = list;
      const photoIndex = list.findIndex( p => p === photo );
      updatedPhotoList.splice( photoIndex, 1 );
      return updatedPhotoList || list;
    };

    const deletePhotoFromObservation = async ( photoUriToDelete, photoUris, setPhotoUris ) => {
      if ( !photoUriToDelete ) { return; }
      const updatedPhotos = removePhotoFromList( photoUris, photoUriToDelete );

      // spreading the array forces DeletePhotoDialog to rerender on each photo deletion
      setPhotoUris( [...updatedPhotos] );

      // when deleting photo from StandardCamera while adding new evidence, remember to clear
      // the list of new evidence to add
      if ( evidenceToAdd.length > 0 ) {
        const updatedEvidence = removePhotoFromList( evidenceToAdd, photoUriToDelete );
        setEvidenceToAdd( [...updatedEvidence] );
      }

      await Photo.deletePhoto( realm, photoUriToDelete );
    };

    return {
      createObservationNoEvidence,
      addObservations,
      createObsWithCameraPhotos,
      addSound,
      currentObservation,
      currentObservationIndex,
      observations,
      setCurrentObservationIndex,
      setObservations,
      updateObservationKey,
      updateObservationKeys,
      cameraPreviewUris,
      setCameraPreviewUris,
      galleryUris,
      setGalleryUris,
      allObsPhotoUris,
      createObservationsFromGroupedPhotos,
      addGalleryPhotosToCurrentObservation,
      createObservationFromGallery,
      evidenceToAdd,
      setEvidenceToAdd,
      addCameraPhotosToCurrentObservation,
      resetObsEditContext,
      saveObservation,
      saveAndUploadObservation,
      deleteLocalObservation,
      album,
      setAlbum,
      deletePhotoFromObservation,
      unsavedChanges
    };
  }, [
    currentObservation,
    currentObservationIndex,
    observations,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    galleryUris,
    allObsPhotoUris,
    createObservationsFromGroupedPhotos,
    addGalleryPhotosToCurrentObservation,
    createObservationFromGallery,
    evidenceToAdd,
    setEvidenceToAdd,
    addCameraPhotosToCurrentObservation,
    resetObsEditContext,
    apiToken,
    navigation,
    realm,
    album,
    setAlbum,
    unsavedChanges
  ] );

  return (
    <ObsEditContext.Provider value={uploadValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
