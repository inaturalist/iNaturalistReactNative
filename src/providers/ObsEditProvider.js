// @flow
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  createObservation,
  createOrUpdateEvidence,
  searchObservations,
  updateObservation
} from "api/observations";
import inatjs from "inaturalistjs";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import emitUploadProgress, {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import { formatExifDateAsString, parseExif, writeExifToFile } from "sharedHelpers/parseExif";
import {
  useApiToken,
  useCurrentUser
} from "sharedHooks";

import { log } from "../../react-native-logs.config";
import { ObsEditContext, RealmContext } from "./contexts";

const { useRealm } = RealmContext;

type Props = {
  children: any,
};

const logger = log.extend( "ObsEditProvider" );

const uploadProgressIncrement = 0.5;

const initialState = {
  currentUploadIndex: 0,
  error: null,
  singleUpload: false,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  uploadProgress: { },
  uploads: []
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "CONTINUE_UPLOADS":
      return {
        ...state,
        uploadInProgress: true
      };
    case "PAUSE_UPLOADS":
      return {
        ...state,
        uploadInProgress: false,
        currentUploadIndex: 0
      };
    case "SET_UPLOAD_ERROR":
      return {
        ...state,
        error: action.error
      };
    case "START_MULTIPLE_UPLOADS":
      return {
        ...state,
        error: null,
        uploadInProgress: true,
        uploads: action.uploads,
        uploadProgress: action.uploadProgress,
        totalProgressIncrements: action.uploads.length + action.uploads
          .reduce( ( count, current ) => count
            + current.observationPhotos.length, 0 )
      };
    case "START_NEXT_UPLOAD":
      return {
        ...state,
        currentUploadIndex: Math.min( state.currentUploadIndex + 1, state.uploads.length - 1 )
      };
    case "STOP_UPLOADS":
      return {
        ...state,
        ...initialState
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploadProgress: action.uploadProgress
      };
    case "UPLOAD_SINGLE_OBSERVATION":
      return {
        ...state,
        uploads: [action.observation],
        singleUpload: true,
        uploadInProgress: true,
        totalProgressIncrements: 1 + [action.observation]
          .reduce( ( count, current ) => count
            + current.observationPhotos.length, 0 )
      };
    default:
      throw new Error( );
  }
};

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const realm = useRealm( );
  const apiToken = useApiToken( );
  const currentUser = useCurrentUser( );
  // state related to creating/editing an observation
  const [currentObservationIndex, setCurrentObservationIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );
  const [cameraPreviewUris, setCameraPreviewUris] = useState( [] );
  const [galleryUris, setGalleryUris] = useState( [] );
  const [evidenceToAdd, setEvidenceToAdd] = useState( [] );
  const [originalCameraUrisMap, setOriginalCameraUrisMap] = useState( {} );
  const [cameraRollUris, setCameraRollUris] = useState( [] );
  const [album, setAlbum] = useState( null );
  const [loading, setLoading] = useState( false );
  const [unsavedChanges, setUnsavedChanges] = useState( false );
  const [passesEvidenceTest, setPassesEvidenceTest] = useState( false );
  const [passesIdentificationTest, setPassesIdentificationTest] = useState( false );
  const [mediaViewerUris, setMediaViewerUris] = useState( [] );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( 0 );
  const [groupedPhotos, setGroupedPhotos] = useState( [] );
  const [savingPhoto, setSavingPhoto] = useState( false );

  // state related to uploads in useReducer
  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    currentUploadIndex,
    error,
    singleUpload,
    totalProgressIncrements,
    uploadInProgress,
    uploadProgress,
    uploads
  } = state;

  const totalUploadCount = uploads.length;
  const totalUploadProgress = Object.values( uploadProgress ).reduce( ( count, current ) => count
  + Number( current ), 0 );

  const progress = totalProgressIncrements > 0
    ? totalUploadProgress / totalProgressIncrements
    : 0;

  const resetObsEditContext = useCallback( ( ) => {
    setObservations( [] );
    setCurrentObservationIndex( 0 );
    setCameraPreviewUris( [] );
    setOriginalCameraUrisMap( {} );
    setGalleryUris( [] );
    setEvidenceToAdd( [] );
    setCameraRollUris( [] );
    setUnsavedChanges( false );
    setPassesEvidenceTest( false );
    setGroupedPhotos( [] );
  }, [] );

  const stopUpload = ( ) => {
    dispatch( { type: "STOP_UPLOADS" } );
    deactivateKeepAwake( );
  };

  const setUploads = allUploads => {
    const resetProgress = { };
    dispatch( {
      type: "START_MULTIPLE_UPLOADS",
      uploads: allUploads,
      uploadProgress: resetProgress
    } );
  };

  useEffect( ( ) => {
    let currentProgress = uploadProgress;
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];

        if ( singleUpload && !currentProgress[uuid] ) {
          currentProgress = { };
        }

        currentProgress[uuid] = ( uploadProgress[uuid] || 0 ) + increment;
        dispatch( {
          type: "UPDATE_PROGRESS",
          uploadProgress: currentProgress
        } );
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [uploadProgress, singleUpload] );

  const allObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris],
    [cameraPreviewUris, galleryUris]
  );

  const currentObservation = observations[currentObservationIndex];
  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  const addSound = async ( ) => {
    const newObservation = await Observation.createObsWithSounds( );
    setObservations( [newObservation] );
  };

  const addObservations = async obs => setObservations( obs );

  const createObservationNoEvidence = async ( ) => {
    const newObservation = await Observation.new( );
    setObservations( [newObservation] );
  };

  const createObsPhotos = useCallback(
    async ( photos, { position, local } ) => {
      let photoPosition = position;
      return Promise.all(
        photos.map( async photo => {
          const newPhoto = ObservationPhoto.new( local
            ? photo
            : photo?.image?.uri, photoPosition );
          photoPosition += 1;
          return newPhoto;
        } )
      );
    },
    []
  );

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
        newLocalObs.observationPhotos = await createObsPhotos( photos, { position: 0 } );
        return newLocalObs;
      }
    ) );
    setObservations( newObservations );
  }, [createObsPhotos, createObservationFromGalleryPhoto] );

  const createObservationFromGallery = useCallback( async photo => {
    const newLocalObs = await createObservationFromGalleryPhoto( photo );
    newLocalObs.observationPhotos = await createObsPhotos( [photo], { position: 0 } );
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
    setSavingPhoto( true );
    const obsPhotos = await createObsPhotos( photos, { position: numOfObsPhotos } );
    appendObsPhotos( obsPhotos );
    setSavingPhoto( false );
  }, [createObsPhotos, appendObsPhotos, numOfObsPhotos] );

  const uploadValue = useMemo( ( ) => {
    // Save URIs to camera gallery (if a photo was taken using the app,
    // we want it accessible in the camera's folder, as if the user has taken those photos
    // via their own camera app).
    const savePhotosToCameraGallery = async uris => {
      const savedUris = await Promise.all( uris.map( async uri => {
        // Find original camera URI of each scaled-down photo
        const cameraUri = originalCameraUrisMap[uri];

        if ( !cameraUri ) {
          console.error( `Couldn't find original camera URI for: ${uri}` );
        }
        logger.info( "savePhotosToCameraGallery, saving cameraUri: ", cameraUri );
        return CameraRoll.save( cameraUri, { type: "photo", album: "Camera" } );
      } ) );

      logger.info( "savePhotosToCameraGallery, savedUris: ", savedUris );
      // Save these camera roll URIs, so later on observation editor can update
      // the EXIF metadata of these photos, once we retrieve a location.
      setCameraRollUris( savedUris );
    };

    const writeExifToCameraRollPhotos = async exif => {
      if ( !cameraRollUris || cameraRollUris.length === 0 || !currentObservation ) {
        return;
      }
      // Update all photos taken via the app with the new fetched location.
      cameraRollUris.forEach( uri => {
        logger.info( "writeExifToCameraRollPhotos, writing exif for uri: ", uri );
        writeExifToFile( uri, exif );
      } );
    };

    const createObsWithCameraPhotos = async ( localFilePaths, taxonPrediction ) => {
      const newObservation = await Observation.new( );
      newObservation.observationPhotos = await createObsPhotos( localFilePaths, {
        position: 0,
        local: true
      } );

      if ( taxonPrediction ) {
        newObservation.taxon = taxonPrediction;
      }
      setObservations( [newObservation] );
      logger.info(
        "createObsWithCameraPhotos, calling savePhotosToCameraGallery with paths: ",
        localFilePaths
      );
      await savePhotosToCameraGallery( localFilePaths );
    };

    const addCameraPhotosToCurrentObservation = async localFilePaths => {
      setSavingPhoto( true );
      const obsPhotos = await createObsPhotos( localFilePaths, {
        position: numOfObsPhotos,
        local: true
      } );
      appendObsPhotos( obsPhotos );
      logger.info(
        "addCameraPhotosToCurrentObservation, calling savePhotosToCameraGallery with paths: ",
        localFilePaths
      );
      await savePhotosToCameraGallery( localFilePaths );
      setSavingPhoto( false );
    };

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

    const deleteLocalObservation = uuid => {
      const localObservation = realm.objectForPrimaryKey( "Observation", uuid );
      if ( !localObservation ) { return; }
      realm?.write( ( ) => {
        realm?.delete( localObservation );
      } );
    };

    function ensureRealm( ) {
      if ( !realm ) {
        throw new Error( "Gack, tried to save an observation without realm!" );
      }
    }

    const saveObservation = async observation => {
      ensureRealm( );
      await writeExifToCameraRollPhotos( {
        latitude: observation.latitude,
        longitude: observation.longitude,
        positional_accuracy: observation.positionalAccuracy
      } );
      return Observation.saveLocalObservationForUpload( observation, realm );
    };

    const saveCurrentObservation = async ( ) => saveObservation( currentObservation );

    const saveAllObservations = async ( ) => {
      ensureRealm( );
      setLoading( true );
      await Promise.all( observations.map( async observation => {
        // Note that this should only happen after import when ObsEdit has
        // multiple observations to save, none of which should have
        // corresponding photos in cameraRollPhotos, so there's no need to
        // write EXIF for those.
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
      emitUploadProgress( observationUUID, uploadProgressIncrement );
      const response = await createOrUpdateEvidence(
        apiEndpoint,
        params,
        options
      );
      if ( response ) {
        emitUploadProgress( observationUUID, uploadProgressIncrement );
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

    const uploadObservation = async ( obs, uploadOptions ) => {
      if ( uploadOptions?.isSingleUpload ) {
        dispatch( {
          type: "UPLOAD_SINGLE_OBSERVATION",
          observation: obs
        } );
      }
      setLoading( true );
      // don't bother trying to upload unless there's a logged in user
      if ( !currentUser ) { return {}; }
      if ( !apiToken ) {
        throw new Error(
          "Gack, tried to upload an observation without API token!"
        );
      }
      activateKeepAwake( );
      // every observation and observation photo counts for a total of 1 progress
      // we're showing progress in 0.5 increments: when an upload of obs/obsPhoto starts
      // and when the upload of obs/obsPhoto successfully completes
      emitUploadProgress( obs.uuid, uploadProgressIncrement );
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
        emitUploadProgress( obs.uuid, uploadProgressIncrement );
      } else {
        response = await createObservation( uploadParams, options );
        emitUploadProgress( obs.uuid, uploadProgressIncrement );
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

    const setNextScreen = async ( { type }: Object ) => {
      const savedObservation = await saveCurrentObservation( );
      if ( type === "upload" ) {
        uploadObservation( savedObservation, { isSingleUpload: true } );
      }

      if ( observations.length === 1 ) {
        setCurrentObservationIndex( 0 );
        setObservations( [] );

        navigation.navigate( "TabNavigator", {
          screen: "ObservationsStackNavigator",
          params: {
            screen: "ObsList"
          }
        } );
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
      const { results } = await searchObservations( params, { api_token: apiToken } );

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

    const uploadMultipleObservations = ( ) => {
      // if ( totalProgressIncrements === 0 ) {
      //   dispatch( { type: "SET_TOTAL_PROGRESS" } );
      // }
      const upload = async observationToUpload => {
        try {
          await uploadObservation( observationToUpload );
        } catch ( e ) {
          console.warn( e );
          dispatch( { type: "SET_UPLOAD_ERROR", error: e.message } );
        }
        if ( currentUploadIndex === uploads.length - 1 ) {
          // Finished uploading the last observation
          dispatch( { type: "PAUSE_UPLOADS" } );
        } else {
          dispatch( { type: "START_NEXT_UPLOAD" } );
        }
      };

      const observationToUpload = uploads[currentUploadIndex];
      const continueUpload = observationToUpload && !!apiToken;

      if ( !continueUpload && uploadInProgress ) {
        dispatch( { type: "PAUSE_UPLOADS" } );
        return;
      }

      const uploadedUUIDS = Object.keys( uploadProgress );
      // only try to upload every observation once
      if ( !uploadedUUIDS.includes( observationToUpload.uuid ) ) {
        dispatch( { type: "CONTINUE_UPLOADS" } );
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
      saveCurrentObservation,
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
      currentUploadIndex,
      progress,
      setUploads,
      uploads,
      originalCameraUrisMap,
      setOriginalCameraUrisMap,
      savingPhoto,
      singleUpload,
      totalUploadCount
    };
  }, [
    currentObservation,
    currentObservationIndex,
    observations,
    cameraPreviewUris,
    galleryUris,
    allObsPhotoUris,
    createObservationsFromGroupedPhotos,
    addGalleryPhotosToCurrentObservation,
    createObservationFromGallery,
    evidenceToAdd,
    setEvidenceToAdd,
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
    error,
    uploadInProgress,
    progress,
    uploads,
    setOriginalCameraUrisMap,
    originalCameraUrisMap,
    appendObsPhotos,
    cameraRollUris,
    savingPhoto,
    singleUpload,
    totalUploadCount,
    createObsPhotos,
    numOfObsPhotos
  ] );

  return (
    <ObsEditContext.Provider value={uploadValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
