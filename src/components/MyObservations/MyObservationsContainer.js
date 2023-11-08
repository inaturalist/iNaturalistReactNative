// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  createObservation,
  createOrUpdateEvidence,
  searchObservations,
  updateObservation
} from "api/observations";
import inatjs from "inaturalistjs";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useReducer, useState
} from "react";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import emitUploadProgress, {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import {
  useApiToken,
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations,
  useTranslation
} from "sharedHooks";

import MyObservations from "./MyObservations";

const uploadProgressIncrement = 0.5;

export const INITIAL_UPLOAD_STATE = {
  currentUploadIndex: 0,
  error: null,
  singleUpload: false,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  // $FlowIgnore
  uploadProgress: { },
  // $FlowIgnore
  uploads: []
};

const startUploadState = uploads => ( {
  error: null,
  uploadInProgress: true,
  uploads,
  uploadProgress: { },
  totalProgressIncrements: uploads
    .reduce( ( count, current ) => count
      + current.observationPhotos.length, 1 )
} );

const uploadReducer = ( state: Object, action: Function ): Object => {
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
        ...startUploadState( action.uploads )
      };
    case "START_NEXT_UPLOAD":
      return {
        ...state,
        currentUploadIndex: Math.min( state.currentUploadIndex + 1, state.uploads.length - 1 )
      };
    case "STOP_UPLOADS":
      return {
        ...state,
        ...INITIAL_UPLOAD_STATE
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploadProgress: action.uploadProgress
      };
    case "UPLOAD_SINGLE_OBSERVATION":
      return {
        ...state,
        ...startUploadState( [action.observation] ),
        singleUpload: true
      };
    default:
      return state;
  }
};

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const { params: navParams } = useRoute( );
  const apiToken = useApiToken( );
  const [state, dispatch] = useReducer( uploadReducer, INITIAL_UPLOAD_STATE );
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const { getItem, setItem } = useAsyncStorage( "myObservationsLayout" );
  const [layout, setLayout] = useState( null );
  const isOnline = useIsConnected( );
  const savedObservation = navParams?.uuid
    && realm.objectForPrimaryKey( "Observation", navParams?.uuid );

  const currentUser = useCurrentUser();
  const { isFetchingNextPage, fetchNextPage } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUser?.id
    }
  } );

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const writeItemToStorage = useCallback( async newValue => {
    await setItem( newValue );
    setLayout( newValue );
  }, [setItem] );

  useEffect( ( ) => {
    const readItemFromStorage = async ( ) => {
      const item = await getItem( );
      if ( !item ) {
        await writeItemToStorage( "list" );
      }
      setLayout( item || "list" );
    };

    readItemFromStorage( );
  }, [getItem, writeItemToStorage] );

  const toggleLayout = ( ) => {
    if ( layout === "grid" ) {
      writeItemToStorage( "list" );
    } else {
      writeItemToStorage( "grid" );
    }
  };

  useEffect( ( ) => {
    let currentProgress = state.uploadProgress;
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];

        if ( state.singleUpload && !currentProgress[uuid] ) {
          currentProgress = { };
        }

        currentProgress[uuid] = ( state.uploadProgress[uuid] || 0 ) + increment;
        dispatch( {
          type: "UPDATE_PROGRESS",
          uploadProgress: currentProgress
        } );
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [state.uploadProgress, state.singleUpload] );

  const markRecordUploaded = useCallback( ( recordUUID, type, response ) => {
    if ( !response ) { return; }
    const { id } = response.results[0];

    const record = realm.objectForPrimaryKey( type, recordUUID );
    realm?.write( ( ) => {
      record.id = id;
      record._synced_at = new Date( );
    } );
  }, [realm] );

  const uploadToServer = useCallback( async (
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
  }, [markRecordUploaded] );

  const uploadEvidence = useCallback( async (
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
  }, [uploadToServer] );

  const showInternetErrorAlert = useCallback( ( ) => {
    if ( !isOnline ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
    return null;
  }, [isOnline, t] );

  const uploadObservation = useCallback( async ( obs, uploadOptions ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    showInternetErrorAlert( );
    if ( uploadOptions?.isSingleUpload ) {
      dispatch( {
        type: "UPLOAD_SINGLE_OBSERVATION",
        observation: obs
      } );
    }
    // don't bother trying to upload unless there's a logged in user
    if ( !currentUser ) { return; }
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
      return;
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
  }, [apiToken, currentUser, markRecordUploaded, showInternetErrorAlert, uploadEvidence] );

  const uploadMultipleObservations = useCallback( ( ) => {
    const {
      uploads,
      currentUploadIndex,
      uploadInProgress,
      uploadProgress
    } = state;
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    showInternetErrorAlert( );
    dispatch( { type: "START_MULTIPLE_UPLOADS", uploads: allObsToUpload } );
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
  }, [apiToken, showInternetErrorAlert, uploadObservation, state, allObsToUpload, currentUser] );

  const stopUpload = useCallback( ( ) => {
    dispatch( { type: "STOP_UPLOADS" } );
    deactivateKeepAwake( );
  }, [] );

  const downloadRemoteObservationsFromServer = useCallback( async ( ) => {
    const params = {
      user_id: currentUser?.id,
      per_page: 50,
      fields: Observation.FIELDS
    };
    const { results } = await searchObservations( params, { api_token: apiToken } );

    Observation.upsertRemoteObservations( results, realm );
  }, [apiToken, currentUser, realm] );

  const syncObservations = useCallback( async ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    showInternetErrorAlert( );
    // TODO: GET observation/deletions once this is enabled in API v2
    activateKeepAwake( );
    await downloadRemoteObservationsFromServer( );
    // we at least want to keep the device awake while uploads are happening
    // not sure about downloads/deletions
    deactivateKeepAwake( );
  }, [downloadRemoteObservationsFromServer, currentUser, showInternetErrorAlert] );

  useEffect( ( ) => {
    // upload pressed on ObsEdit screen
    if ( savedObservation ) {
      uploadObservation( savedObservation, { isSingleUpload: true } );
    }
  }, [savedObservation, uploadObservation] );

  // clear upload status when leaving screen
  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        stopUpload( );
      } );
      navigation.addListener( "focus", ( ) => {
        dispatch( { type: "UPDATE_PROGRESS", uploadProgress: { } } );
      } );
    },
    [navigation, stopUpload]
  );

  if ( !layout ) { return null; }

  return (
    <MyObservations
      observations={observations}
      layout={layout}
      toggleLayout={toggleLayout}
      showLoginSheet={showLoginSheet}
      setShowLoginSheet={setShowLoginSheet}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={fetchNextPage}
      currentUser={currentUser}
      isOnline={isOnline}
      uploadState={state}
      uploadMultipleObservations={uploadMultipleObservations}
      stopUpload={stopUpload}
      uploadObservation={uploadObservation}
      syncObservations={syncObservations}
    />
  );
};

export default MyObservationsContainer;
