// @flow
import { useNavigation } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { searchObservations } from "api/observations";
import type { Node } from "react";
import React, {
  useCallback, useEffect,
  useMemo, useState
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import { formatDateStringFromTimestamp } from "sharedHelpers/dateAndTime";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { formatExifDateAsString, parseExif } from "sharedHelpers/parseExif";
import useApiToken from "sharedHooks/useApiToken";
import useCurrentUser from "sharedHooks/useCurrentUser";

import { log } from "../../react-native-logs.config";
import { ObsEditContext, RealmContext } from "./contexts";

const { useRealm } = RealmContext;

type Props = {
  children: any
}

const logger = log.extend( "ObsEditProvider" );

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const realm = useRealm( );
  const apiToken = useApiToken( );
  const currentUser = useCurrentUser( );
  const [currentObservationIndex, setCurrentObservationIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );
  const [cameraPreviewUris, setCameraPreviewUris] = useState( [] );
  const [galleryUris, setGalleryUris] = useState( [] );
  const [evidenceToAdd, setEvidenceToAdd] = useState( [] );
  const [album, setAlbum] = useState( null );
  const [loading, setLoading] = useState( false );
  const [unsavedChanges, setUnsavedChanges] = useState( false );
  const [uploadProgress, setUploadProgress] = useState( { } );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );

  const resetObsEditContext = useCallback( ( ) => {
    setObservations( [] );
    setCurrentObservationIndex( 0 );
    setCameraPreviewUris( [] );
    setGalleryUris( [] );
    setEvidenceToAdd( [] );
    setUnsavedChanges( false );
    setPassesEvidenceTest( false );
  }, [] );

  useEffect( () => {
    const progressListener = EventRegister.addEventListener(
      "INCREMENT_OBSERVATIONS_PROGRESS",
      increments => {
        setUploadProgress( currentProgress => {
          increments.forEach( ( [uuid, increment] ) => {
            currentProgress[uuid] = currentProgress[uuid] ? currentProgress[uuid] : 0;
            currentProgress[uuid] += increment;
          } );
          return { ...currentProgress };
        } );
      }
    );
    return () => {
      EventRegister.removeEventListener( progressListener );
    };
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
    logger.info( `EXIF: ${JSON.stringify( firstPhotoExif, null, 2 )}` );
    const exifDate = firstPhotoExif?.date ? formatExifDateAsString( firstPhotoExif.date ) : null;

    const observedOnDate = exifDate || formatDateStringFromTimestamp( photo.timestamp );
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
    // need empty case for when a user creates an observation with no photos,
    // then tries to add photos to observation later
    const currentObservationPhotos = currentObservation?.observationPhotos || [];

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
          const isSavedObservation = realm.objectForPrimaryKey( "Observation", observation.uuid );
          const updatedObservation = {
            ...( observation.toJSON ? observation.toJSON( ) : observation ),
            ...keysAndValues
          };
          if ( isSavedObservation && !unsavedChanges ) {
            setUnsavedChanges( true );
          }
          return updatedObservation;
        }
        return observation;
      } );
      setObservations( updatedObservations );
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
      if ( !realm ) {
        throw new Error( "Gack, tried to save an observation without realm!" );
      }
      return Observation.saveLocalObservationForUpload( currentObservation, realm );
    };

    const saveAllObservations = async ( ) => {
      if ( !realm ) {
        throw new Error( "Gack, tried to save an observation without realm!" );
      }
      setLoading( true );
      await Promise.all( observations.map( async observation => {
        await Observation.saveLocalObservationForUpload( observation, realm );
      } ) );
      setLoading( false );
    };

    const uploadObservation = async observation => {
      // don't bother trying to upload unless there's a logged in user
      if ( !currentUser ) { return {}; }
      if ( !apiToken ) {
        throw new Error( "Gack, tried to upload an observation without API token!" );
      }
      activateKeepAwake( );
      const response = Observation.uploadObservation( observation, apiToken, realm );
      deactivateKeepAwake( );
      return response;
    };

    const saveAndUploadObservation = async ( ) => {
      const savedObservation = await saveObservation( );
      return uploadObservation( savedObservation );
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

    const startSingleUpload = async observation => {
      setLoading( true );
      const { uuid } = observation;
      setUploadProgress( {
        ...uploadProgress,
        [uuid]: 0.5
      } );
      const response = await uploadObservation( observation );
      if ( Object.keys( response ).length === 0 ) {
        return;
      }
      // TODO: mostly making sure UI presentation works at the moment, but we will
      // need to figure out what counts as progress towards an observation uploading
      // and add that functionality.
      // maybe uploading an observation is 0.33, starting to upload photos is 0.5,
      // checking for sounds is 0.66 progress?
      // and we need a way to track this progress from the Observation.uploadObservation function

      setLoading( false );
      setUploadProgress( {
        ...uploadProgress,
        [uuid]: 1
      } );
    };

    const downloadRemoteObservationsFromServer = async ( ) => {
      const params = {
        user_id: currentUser?.id,
        per_page: 50,
        fields: Observation.FIELDS
      };
      const results = await searchObservations( params, { api_token: apiToken } );

      Observation.upsertRemoteObservations( results, realm );
    };

    const syncObservations = async ( ) => {
      // TODO: GET observation/deletions once this is enabled in API v2
      activateKeepAwake( );
      setLoading( true );
      await downloadRemoteObservationsFromServer( );
      // we at least want to keep the device awake while uploads are happening
      // not sure about downloads/deletions
      deactivateKeepAwake( );
      setLoading( false );
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
      uploadObservation,
      setNextScreen,
      loading,
      setLoading,
      unsavedChanges,
      syncObservations,
      startSingleUpload,
      uploadProgress,
      setUploadProgress,
      saveAllObservations,
      setPassesEvidenceTest,
      passesEvidenceTest,
      passesIdentificationTest,
      setPassesIdentificationTest
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
    loading,
    setLoading,
    unsavedChanges,
    currentUser,
    uploadProgress,
    passesEvidenceTest,
    passesIdentificationTest
  ] );

  return (
    <ObsEditContext.Provider value={uploadValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
