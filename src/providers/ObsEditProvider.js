// @flow
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { createIdentification } from "api/identifications";
import {
  createObservation,
  createOrUpdateEvidence,
  searchObservations,
  updateObservation
} from "api/observations";
import inatjs from "inaturalistjs";
import _ from "lodash";
import type { Node } from "react";
import React, {
  useEffect,
  useMemo,
  useReducer
} from "react";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import rnUUID from "react-native-uuid";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import emitUploadProgress, {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import { formatExifDateAsString, parseExif, writeExifToFile } from "sharedHelpers/parseExif";
import {
  useApiToken,
  useAuthenticatedMutation,
  useCurrentUser,
  useIsConnected,
  useLocalObservation,
  useTranslation
} from "sharedHooks";

import { log } from "../../react-native-logs.config";
import { ObsEditContext, RealmContext } from "./contexts";
import createObsReducer, {
  INITIAL_CREATE_OBS_STATE
} from "./reducers/createObsReducer";
import uploadReducer, {
  INITIAL_UPLOAD_STATE
} from "./reducers/uploadReducer";

const { useRealm } = RealmContext;

type Props = {
  children: any,
};

const logger = log.extend( "ObsEditProvider" );

const uploadProgressIncrement = 0.5;

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const realm = useRealm( );
  const apiToken = useApiToken( );
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );
  const isOnline = useIsConnected( );

  const combineReducers = ( ...reducers ) => ( prevState, value ) => reducers
    .reduce( ( newState, reducer ) => reducer( newState, value ), prevState );

  const obsEditReducer = combineReducers( uploadReducer, createObsReducer );

  const [state, dispatch] = useReducer( obsEditReducer, {
    ...INITIAL_CREATE_OBS_STATE,
    ...INITIAL_UPLOAD_STATE
  } );

  const {
    cameraPreviewUris,
    currentObservationIndex,
    galleryUris,
    observations,
    singleUpload,
    uploadProgress
  } = state;

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

  const totalObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris].length,
    [cameraPreviewUris, galleryUris]
  );

  const currentObservation = observations[currentObservationIndex];
  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  const localObservation = useLocalObservation( currentObservation?.uuid );
  const wasSynced = localObservation?.wasSynced( );

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => {
        const belongsToCurrentUser = currentObservation?.user?.login === currentUser?.login;
        if ( belongsToCurrentUser && wasSynced ) {
          realm?.write( ( ) => {
            const localIdentifications = currentObservation?.identifications;
            const newIdentification = data[0];
            newIdentification.user = currentUser;
            newIdentification.taxon = realm?.objectForPrimaryKey(
              "Taxon",
              newIdentification.taxon.id
            ) || newIdentification.taxon;
            const realmIdentification = realm?.create( "Identification", newIdentification );
            localIdentifications.push( realmIdentification );
          } );
        }
        dispatch( { type: "SET_LOADING", loading: false } );
        navigation.navigate( "ObservationsStackNavigator", {
          screen: "ObsDetails",
          params: { uuid: currentObservation.uuid }
        } );
      },
      onError: e => {
        const showErrorAlert = err => Alert.alert( "Error", err, [{ text: t( "OK" ) }], {
          cancelable: true
        } );
        let identificationError = null;
        if ( e ) {
          identificationError = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          identificationError = t( "Couldnt-create-identification-unknown-error" );
        }
        dispatch( { type: "SET_LOADING", loading: false } );
        return showErrorAlert( identificationError );
      }
    }
  );

  const uploadValue = useMemo( ( ) => {
    const {
      cameraRollUris,
      comment,
      currentUploadIndex,
      groupedPhotos,
      error,
      evidenceToAdd,
      loading,
      originalCameraUrisMap,
      photoEvidenceUris,
      selectedPhotoIndex,
      unsavedChanges,
      uploadInProgress,
      uploads,
      totalProgressIncrements
    } = state;
    const currentUploadProgress = Object.values( uploadProgress )
      .reduce( ( count, current ) => count + Number( current ), 0 );

    const progress = totalProgressIncrements > 0
      ? currentUploadProgress / totalProgressIncrements
      : 0;

    const clearUploadProgress = ( ) => {
      dispatch( { type: "UPDATE_PROGRESS", uploadProgress: { } } );
    };

    const resetObsEditContext = ( ) => {
      dispatch( { type: "RESET_OBS_CREATE" } );
      if ( !_.isEmpty( uploadProgress ) ) {
        clearUploadProgress( );
      }
    };

    const stopUpload = ( ) => {
      dispatch( { type: "STOP_UPLOADS" } );
      deactivateKeepAwake( );
    };

    const setUploads = allUploads => {
      dispatch( {
        type: "START_MULTIPLE_UPLOADS",
        uploads: allUploads
      } );
    };

    const setLoading = isLoading => dispatch( { type: "SET_LOADING", loading: isLoading } );

    const updateObservations = updatedObservations => {
      const isSavedObservation = (
        currentObservation
        && realm.objectForPrimaryKey( "Observation", currentObservation.uuid )
      );
      dispatch( {
        type: "SET_OBSERVATIONS",
        observations: updatedObservations,
        unsavedChanges: isSavedObservation
      } );
    };

    const addSound = async ( ) => {
      const newObservation = await Observation.createObsWithSounds( );
      updateObservations( [newObservation] );
    };

    const addObservations = obs => updateObservations( obs );

    const createObservationNoEvidence = async ( ) => {
      const newObservation = await Observation.new( );
      updateObservations( [newObservation] );
    };

    const createObsPhotos = async ( photos, { position, local } ) => {
      let photoPosition = position;
      return Promise.all(
        photos.map( async photo => {
          const newPhoto = ObservationPhoto.new(
            local
              ? photo
              : photo?.image?.uri,
            photoPosition
          );
          photoPosition += 1;
          return newPhoto;
        } )
      );
    };

    const createObservationFromGalleryPhoto = async photo => {
      const firstPhotoExif = await parseExif( photo?.image?.uri );

      const { latitude, longitude } = firstPhotoExif;

      const newObservation = {
        latitude,
        longitude,
        observed_on_string: formatExifDateAsString( firstPhotoExif.date ) || null
      };

      if ( firstPhotoExif.positional_accuracy ) {
        // $FlowIgnore
        newObservation.positional_accuracy = firstPhotoExif.positional_accuracy;
      }
      return Observation.new( newObservation );
    };

    const createObservationWithPhotos = async photos => {
      const newLocalObs = await createObservationFromGalleryPhoto( photos[0] );
      newLocalObs.observationPhotos = await createObsPhotos( photos, { position: 0 } );
      return newLocalObs;
    };

    const createObservationsFromGroupedPhotos = async groupedPhotoObservations => {
      const newObservations = await Promise.all( groupedPhotoObservations.map(
        ( { photos } ) => createObservationWithPhotos( photos )
      ) );
      updateObservations( newObservations );
    };

    const createObservationFromGallery = async photo => {
      const newObservation = await createObservationWithPhotos( [photo] );
      updateObservations( [newObservation] );
    };

    const appendObsPhotos = obsPhotos => {
      // need empty case for when a user creates an observation with no photos,
      // then tries to add photos to observation later
      const currentObservationPhotos = currentObservation?.observationPhotos || [];

      const updatedObs = currentObservation;
      updatedObs.observationPhotos = [...currentObservationPhotos, ...obsPhotos];
      updateObservations( [updatedObs] );
      // clear additional evidence
      dispatch( { type: "CLEAR_ADDITIONAL_EVIDENCE" } );
    };

    const addGalleryPhotosToCurrentObservation = async photos => {
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: true } );
      const obsPhotos = await createObsPhotos( photos, { position: numOfObsPhotos } );
      appendObsPhotos( obsPhotos );
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: false } );
    };

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
      dispatch( { type: "SET_CAMERA_ROLL_URIS", cameraRollUris: savedUris } );
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

    const createObsWithCameraPhotos = async ( localFilePaths, localTaxon ) => {
      const newObservation = await Observation.new( );
      newObservation.observationPhotos = await createObsPhotos( localFilePaths, {
        position: 0,
        local: true
      } );

      if ( localTaxon ) {
        newObservation.taxon = localTaxon;
      }
      updateObservations( [newObservation] );
      logger.info(
        "createObsWithCameraPhotos, calling savePhotosToCameraGallery with paths: ",
        localFilePaths
      );
      // TODO catch the error that gets raised here if the user denies gallery permission
      await savePhotosToCameraGallery( localFilePaths );
    };

    const addCameraPhotosToCurrentObservation = async localFilePaths => {
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: true } );
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
      dispatch( { type: "SET_SAVING_PHOTO", savingPhoto: false } );
    };

    const updateObservationKeys = keysAndValues => {
      const updatedObservations = observations;
      const updatedObservation = {
        ...( currentObservation.toJSON
          ? currentObservation.toJSON( )
          : currentObservation ),
        ...keysAndValues
      };
      updatedObservations[currentObservationIndex] = updatedObservation;
      updateObservations( [...updatedObservations] );
    };

    const formatIdentification = taxon => {
      const newIdent = {
        uuid: rnUUID.v4(),
        body: comment,
        taxon
      };

      return newIdent;
    };

    const createId = identification => {
      setLoading( true );
      const newIdentification = formatIdentification( identification );
      const createRemoteIdentification = localObservation?.wasSynced( );
      if ( createRemoteIdentification ) {
        createIdentificationMutation.mutate( {
          identification: {
            observation_id: currentObservation.uuid,
            taxon_id: newIdentification.taxon.id,
            body: newIdentification.body
          }
        } );
      } else {
        updateObservationKeys( {
          taxon: newIdentification.taxon
        } );
      }
    };

    const deleteLocalObservation = uuid => {
      const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );
      if ( !localObsToDelete ) { return; }
      realm?.write( ( ) => {
        realm?.delete( localObsToDelete );
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
      setLoading( true );
      ensureRealm( );
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

    const showInternetErrorAlert = ( ) => {
      if ( !isOnline ) {
        Alert.alert(
          t( "Internet-Connection-Required" ),
          t( "Please-try-again-when-you-are-connected-to-the-internet" )
        );
      }
      return null;
    };

    const uploadObservation = async ( obs, uploadOptions ) => {
      showInternetErrorAlert( );
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
        navigation.navigate( "TabNavigator", {
          screen: "ObservationsStackNavigator",
          params: {
            screen: "ObsList"
          }
        } );
      } else if ( currentObservationIndex === observations.length - 1 ) {
        observations.pop( );
        dispatch( {
          type: "SET_DISPLAYED_OBSERVATION",
          currentObservationIndex: currentObservationIndex - 1,
          observations
        } );
      } else {
        observations.splice( currentObservationIndex, 1 );
        // this seems necessary for rerendering the ObsEdit screen
        dispatch( {
          type: "SET_DISPLAYED_OBSERVATION",
          currentObservationIndex,
          observations: []
        } );
        updateObservations( observations );
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
          updateObservations( [updatedObs] );
        }
      }

      // photos to show in MediaViewer
      const newPhotoEvidenceUris = removePhotoFromList( photoEvidenceUris, photoUriToDelete );
      // photos displayed in PhotoPreview
      const newCameraPreviewUris = removePhotoFromList( cameraPreviewUris, photoUriToDelete );

      // when deleting photo from StandardCamera while adding new evidence, remember to clear
      // the list of new evidence to add
      if ( evidenceToAdd.length > 0 ) {
        const updatedEvidence = removePhotoFromList( evidenceToAdd, photoUriToDelete );
        dispatch( {
          type: "DELETE_PHOTO",
          photoEvidenceUris: [...newPhotoEvidenceUris],
          cameraPreviewUris: [...newCameraPreviewUris],
          evidenceToAdd: [...updatedEvidence]
        } );
      } else {
        dispatch( {
          type: "DELETE_PHOTO",
          photoEvidenceUris: [...newPhotoEvidenceUris],
          cameraPreviewUris: [...newCameraPreviewUris],
          evidenceToAdd: []
        } );
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
      showInternetErrorAlert( );
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
      showInternetErrorAlert( );
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

    const setComment = newComment => dispatch( { type: "SET_COMMENT", comment: newComment } );

    const setCurrentObservationIndex = index => dispatch( {
      type: "SET_DISPLAYED_OBSERVATION",
      currentObservationIndex: index,
      observations
    } );

    const setGalleryUris = uris => dispatch( { type: "SET_GALLERY_URIS", galleryUris: uris } );

    const setGroupedPhotos = uris => dispatch( {
      type: "SET_GROUPED_PHOTOS",
      groupedPhotos: uris
    } );

    const setCameraPreviewUris = uris => dispatch( {
      type: "SET_CAMERA_PREVIEW_URIS",
      cameraPreviewUris: uris
    } );

    const setEvidenceToAdd = uris => dispatch( {
      type: "SET_EVIDENCE_TO_ADD",
      evidenceToAdd: uris
    } );

    const setOriginalCameraUrisMap = uriMap => dispatch( {
      type: "SET_ORIGINAL_CAMERA_URIS_MAP",
      originalCameraUrisMap: uriMap
    } );

    const setPhotoEvidenceUris = uris => dispatch( {
      type: "SET_PHOTO_EVIDENCE_URIS",
      photoEvidenceUris: uris
    } );

    const setSelectedPhotoIndex = index => dispatch( {
      type: "SET_SELECTED_PHOTO_INDEX",
      selectedPhotoIndex: index
    } );

    return {
      addCameraPhotosToCurrentObservation,
      addGalleryPhotosToCurrentObservation,
      addObservations,
      addSound,
      totalObsPhotoUris,
      apiToken,
      cameraPreviewUris,
      cameraRollUris,
      clearUploadProgress,
      createId,
      createIdentificationMutation,
      createObservationFromGallery,
      createObservationNoEvidence,
      createObservationsFromGroupedPhotos,
      createObsWithCameraPhotos,
      currentObservation,
      currentObservationIndex,
      currentUploadIndex,
      currentUser,
      deleteLocalObservation,
      deletePhotoFromObservation,
      error,
      evidenceToAdd,
      galleryUris,
      groupedPhotos,
      loading,
      localObservation,
      navigation,
      numOfObsPhotos,
      observations,
      originalCameraUrisMap,
      photoEvidenceUris,
      progress,
      realm,
      resetObsEditContext,
      saveAllObservations,
      saveCurrentObservation,
      selectedPhotoIndex,
      setCameraPreviewUris,
      setComment,
      setCurrentObservationIndex,
      setEvidenceToAdd,
      setGalleryUris,
      setGroupedPhotos,
      setNextScreen,
      updateObservations,
      setOriginalCameraUrisMap,
      setPhotoEvidenceUris,
      setSelectedPhotoIndex,
      setUploads,
      singleUpload,
      stopUpload,
      syncObservations,
      totalProgressIncrements,
      unsavedChanges,
      uploadProgress,
      uploadInProgress,
      uploads,
      updateObservationKeys,
      uploadObservation,
      uploadMultipleObservations
    };
  }, [
    totalObsPhotoUris,
    apiToken,
    cameraPreviewUris,
    createIdentificationMutation,
    currentObservation,
    currentObservationIndex,
    currentUser,
    galleryUris,
    isOnline,
    localObservation,
    navigation,
    numOfObsPhotos,
    observations,
    realm,
    t,
    singleUpload,
    state,
    uploadProgress
  ] );

  return (
    <ObsEditContext.Provider value={uploadValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
