// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  searchObservations
} from "api/observations";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useReducer, useState
} from "react";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import uploadObservation from "sharedHelpers/uploadObservation";
import {
  useApiToken,
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations,
  useTranslation
} from "sharedHooks";

import MyObservations from "./MyObservations";

export const INITIAL_UPLOAD_STATE = {
  currentUploadIndex: 0,
  error: null,
  singleUpload: true,
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
  console.log( action.type, "action type in myobs" );
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
        ...startUploadState( action.uploads ),
        singleUpload: false
      };
    case "START_SINGLE_UPLOAD":
      return {
        ...state,
        ...startUploadState( [action.observation] ),
        singleUpload: true
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

  const showInternetErrorAlert = useCallback( ( ) => {
    console.log( isOnline, "is online" );
    if ( !isOnline ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
  }, [isOnline, t] );

  const toggleLoginSheet = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
    }
  }, [currentUser] );

  const startUpload = useCallback( ( observation, options ) => {
    console.log( options, "options in start upload" );
    toggleLoginSheet( );
    showInternetErrorAlert( );
    if ( options?.singleUpload !== false ) {
      dispatch( { type: "START_SINGLE_UPLOAD", observation } );
    }
    uploadObservation( observation, realm );
  }, [
    showInternetErrorAlert,
    toggleLoginSheet,
    realm
  ] );

  const uploadMultipleObservations = useCallback( ( ) => {
    const {
      currentUploadIndex,
      uploadInProgress,
      uploadProgress
    } = state;
    toggleLoginSheet( );
    showInternetErrorAlert( );
    const currentUploads = allObsToUpload;
    console.log( currentUploads.length, "current uploads" );
    dispatch( { type: "START_MULTIPLE_UPLOADS", uploads: currentUploads } );
    const upload = async observationToUpload => {
      console.log( observationToUpload, "observationToUpload" );
      try {
        await startUpload( observationToUpload, { singleUpload: false } );
      } catch ( e ) {
        console.warn( e );
        dispatch( { type: "SET_UPLOAD_ERROR", error: e.message } );
      }
      if ( currentUploadIndex === currentUploads.length - 1 ) {
        // Finished uploading the last observation
        dispatch( { type: "PAUSE_UPLOADS" } );
      } else {
        dispatch( { type: "START_NEXT_UPLOAD" } );
      }
    };

    const observationToUpload = currentUploads[currentUploadIndex];
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
  }, [
    apiToken,
    showInternetErrorAlert,
    state,
    allObsToUpload,
    startUpload,
    toggleLoginSheet
  ] );

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
      startUpload( savedObservation );
    }
  }, [savedObservation, startUpload] );

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

  console.log( state, "state in MyObs" );

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
      uploadObservation={startUpload}
      syncObservations={syncObservations}
    />
  );
};

export default MyObservationsContainer;
