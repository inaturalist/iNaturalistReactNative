// @flow
import { useNavigation } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  createObservation, createOrUpdateEvidence, searchObservations, updateObservation
} from "api/observations";
import inatjs from "inaturalistjs";
import type { Node } from "react";
import React, {
  useCallback, useEffect,
  useMemo, useState
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import emitUploadProgress, {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { formatExifDateAsString, parseExif } from "sharedHelpers/parseExif";
import {
  useApiToken,
  useCurrentUser
} from "sharedHooks";

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
  const [mediaViewerUris, setMediaViewerUris] = useState( [] );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( 0 );
  const [groupedPhotos, setGroupedPhotos] = useState( [] );
  const [uploadInProgress, setUploadInProgress] = useState( false );
  const [shouldUpload, setShouldUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [error, setError] = useState( null );
  const [uploads, setUploads] = useState( [] );
  const [uploadedUUIDs, setUploadedUUIDS] = useState( [] );

  const resetObsEditContext = useCallback( ( ) => {
    setObservations( [] );
    setCurrentObservationIndex( 0 );
    setCameraPreviewUris( [] );
    setGalleryUris( [] );
    setEvidenceToAdd( [] );
    setUnsavedChanges( false );
    setPassesEvidenceTest( false );
    setGroupedPhotos( [] );
  }, [] );

  const stopUpload = ( ) => {
    setUploadInProgress( false );
    setShouldUpload( false );
    setCurrentUploadIndex( 0 );
    setError( null );
    deactivateKeepAwake( );
  };

  useEffect( ( ) => {
    const currentProgress = uploadProgress;
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];

        currentProgress[uuid] = ( uploadProgress[uuid] || 0 ) + increment;
        setUploadProgress( currentProgress );
      }
    );
    return () => {
      EventRegister.removeEventListener( progressListener );
    };
  }, [uploadProgress] );

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
    const firstPhotoExif = await parseExif( photo?.image?.uri );
    logger.info( `EXIF: ${JSON.stringify( firstPhotoExif, null, 2 )}` );

    const { latitude, longitude } = firstPhotoExif;
    const placeGuess = await fetchPlaceName( latitude, longitude );

    const newObservation = {
      latitude,
      longitude,
      place_guess: placeGuess,
      observed_on_string: formatExifDateAsString( firstPhotoExif.date ) || null
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
    const updateObservationKeys = keysAndValues => {
      const updatedObservations = observations;
      const obsToUpdate = observations[currentObservationIndex];
      const isSavedObservation = realm.objectForPrimaryKey( "Observation", obsToUpdate.uuid );
      const updatedObservation = {
        ...( obsToUpdate.toJSON
          ? obsToUpdate.toJSON( )
          : obsToUpdate ),
        ...keysAndValues
      };
      if ( isSavedObservation && !unsavedChanges ) {
        setUnsavedChanges( true );
      }
      updatedObservations[currentObservationIndex] = updatedObservation;
      setObservations( [...updatedObservations] );
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

    const markRecordUploaded = ( recordUUID, type, response ) => {
      if ( !response ) { return; }
      const { id } = response.results[0];

      const record = realm.objectForPrimaryKey( type, recordUUID );
      realm?.write( ( ) => {
        record.id = id;
        record._synced_at = new Date( );
      } );
    };

    const uploadToServer = async (
      evidenceUUID: string,
      type: string,
      params: Object,
      apiEndpoint: Function,
      options: Object,
      observationUUID?: string
    ) => {
      emitUploadProgress( observationUUID, 0.5 );
      const response = await createOrUpdateEvidence(
        apiEndpoint,
        params,
        options
      );
      if ( response ) {
        emitUploadProgress( observationUUID, 0.5 );
        markRecordUploaded( evidenceUUID, type, response );
      }
    };

    const uploadEvidence = async (
      evidence: Array<Object>,
      type: string,
      apiSchemaMapper: Function,
      observationId: ?number,
      apiEndpoint: Function,
      options: Object,
      observationUUID?: string,
      forceUpload?: boolean
    ): Promise<any> => {
      // only try to upload evidence which is not yet on the server
      const unsyncedEvidence = forceUpload
        ? evidence
        : evidence.filter( item => !item.wasSynced( ) );

      const responses = await Promise.all( unsyncedEvidence.map( item => {
        const currentEvidence = item.toJSON( );
        const evidenceUUID = currentEvidence.uuid;

        // Remove all null values, b/c the API doesn't seem to like them
        const newPhoto = {};
        const photo = currentEvidence?.photo;
        Object.keys( photo ).forEach( k => {
          if ( photo[k] !== null ) {
            newPhoto[k] = photo[k];
          }
        } );

        currentEvidence.photo = newPhoto;

        const params = apiSchemaMapper( observationId, currentEvidence );
        return uploadToServer(
          evidenceUUID,
          type,
          params,
          apiEndpoint,
          options,
          observationUUID
        );
      } ) );
      // eslint-disable-next-line consistent-return
      return responses[0];
    };

    const uploadObservation = async obs => {
      setLoading( true );
      // don't bother trying to upload unless there's a logged in user
      if ( !currentUser ) { return {}; }
      if ( !apiToken ) {
        throw new Error( "Gack, tried to upload an observation without API token!" );
      }
      activateKeepAwake( );
      // every observation and observation photo counts for a total of 1 progress
      // we're showing progress in 0.5 increments: when an upload of obs/obsPhoto starts
      // and when the upload of obs/obsPhoto successfully completes
      emitUploadProgress( obs.uuid, 0.5 );
      const obsToUpload = Observation.mapObservationForUpload( obs );
      const options = { api_token: apiToken };

      // Remove all null values, b/c the API doesn't seem to like them for some
      // reason (might be an error with the API as of 20220801)
      const newObs = {};
      Object.keys( obsToUpload ).forEach( k => {
        if ( obsToUpload[k] !== null ) {
          newObs[k] = obsToUpload[k];
        }
      } );

      let response;

      // First upload the photos/sounds (before uploading the observation itself)
      const hasPhotos = obs?.observationPhotos?.length > 0;

      await Promise.all( [
        hasPhotos
          ? uploadEvidence(
            obs.observationPhotos,
            "ObservationPhoto",
            ObservationPhoto.mapPhotoForUpload,
            null,
            inatjs.photos.create,
            options
          )
          : null
      ] );

      const wasPreviouslySynced = obs.wasSynced( );
      const uploadParams = {
        observation: { ...newObs },
        fields: { id: true }
      };

      if ( wasPreviouslySynced ) {
        response = await updateObservation( {
          ...uploadParams,
          id: newObs.uuid,
          ignore_photos: true
        }, options );
        emitUploadProgress( obs.uuid, 0.5 );
      } else {
        response = await createObservation( uploadParams, options );
        emitUploadProgress( obs.uuid, 0.5 );
      }

      if ( !response ) {
        return response;
      }

      const { uuid: obsUUID } = response.results[0];

      await Promise.all( [
        markRecordUploaded( obs.uuid, "Observation", response ),
        // Next, attach the uploaded photos/sounds to the uploaded observation
        hasPhotos
          ? uploadEvidence(
            obs.observationPhotos,
            "ObservationPhoto",
            ObservationPhoto.mapPhotoForAttachingToObs,
            obsUUID,
            inatjs.observation_photos.create,
            options,
            obsUUID,
            true
          )
          : null
      ] );
      deactivateKeepAwake( );
      setLoading( false );
      return response;
    };

    const saveAndUploadObservation = async ( ) => {
      const savedObservation = await saveObservation( );
      return uploadObservation( savedObservation );
    };

    const removePhotoFromList = ( list, photo ) => {
      const i = list.findIndex( p => p === photo );
      list.splice( i, 1 );
      return list;
    };

    const deleteObservationPhoto = ( list, photo ) => {
      const i = list.findIndex(
        p => p.photo.localFilePath === photo || p.originalPhotoUri === photo
      );
      list.splice( i, 1 );
      return list;
    };

    const deletePhotoFromObservation = async photoUriToDelete => {
      // photos displayed in EvidenceList
      const updatedObs = currentObservation;
      if ( updatedObs ) {
        const obsPhotos = Array.from( currentObservation?.observationPhotos );
        if ( obsPhotos.length > 0 ) {
          const updatedObsPhotos = deleteObservationPhoto( obsPhotos, photoUriToDelete );
          updatedObs.observationPhotos = updatedObsPhotos;
          setObservations( [updatedObs] );
        }
      }

      // photos to show in media viewer
      const newMediaViewerUris = removePhotoFromList( mediaViewerUris, photoUriToDelete );
      setMediaViewerUris( [...newMediaViewerUris] );

      // photos displayed in PhotoPreview
      const newCameraPreviewUris = removePhotoFromList( cameraPreviewUris, photoUriToDelete );
      setCameraPreviewUris( [...newCameraPreviewUris] );

      // when deleting photo from StandardCamera while adding new evidence, remember to clear
      // the list of new evidence to add
      if ( evidenceToAdd.length > 0 ) {
        const updatedEvidence = removePhotoFromList( evidenceToAdd, photoUriToDelete );
        setEvidenceToAdd( [...updatedEvidence] );
      }

      await Photo.deletePhoto( realm, photoUriToDelete );
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

    const uploadMultipleObservations = allObsToUpload => {
      setShouldUpload( true );
      const upload = async observationToUpload => {
        setUploadedUUIDS( [
          ...uploadedUUIDs,
          observationToUpload.uuid
        ] );
        try {
          await uploadObservation( observationToUpload );
        } catch ( e ) {
          console.warn( e );
          setError( e.message );
        }
        setCurrentUploadIndex( currentIndex => currentIndex + 1 );
      };

      const observationToUpload = allObsToUpload[currentUploadIndex];
      const continueUpload = shouldUpload && observationToUpload && !!apiToken;

      if ( !continueUpload ) {
        return;
      }

      if ( allObsToUpload.length >= uploads.length ) {
        setUploads( allObsToUpload );
      }
      activateKeepAwake( );
      setUploadInProgress( true );
      // only try to upload every observation once
      if ( !uploadedUUIDs.includes( observationToUpload.uuid ) ) {
        upload( observationToUpload );
      }
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
      uploadProgress,
      setUploadProgress,
      saveAllObservations,
      setPassesEvidenceTest,
      passesEvidenceTest,
      passesIdentificationTest,
      setPassesIdentificationTest,
      mediaViewerUris,
      setMediaViewerUris,
      selectedPhotoIndex,
      setSelectedPhotoIndex,
      groupedPhotos,
      setGroupedPhotos,
      stopUpload,
      uploadMultipleObservations,
      uploadInProgress,
      error,
      currentUploadIndex
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
    passesIdentificationTest,
    mediaViewerUris,
    selectedPhotoIndex,
    groupedPhotos,
    currentUploadIndex,
    shouldUpload,
    uploadedUUIDs,
    uploads,
    error,
    uploadInProgress
  ] );

  return (
    <ObsEditContext.Provider value={uploadValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
