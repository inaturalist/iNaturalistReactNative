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
  useCallback, useEffect,
  useReducer, useState
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
  error: null,
  singleUpload: true,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  // $FlowIgnore
  uploadProgress: { },
  // $FlowIgnore
  uploads: [],
  uploadsComplete: false,
  currentUploadCount: 0
};

const startUploadState = uploads => ( {
  error: null,
  uploadInProgress: true,
  uploadsComplete: false,
  uploads,
  uploadProgress: { },
  currentUploadCount: 1,
  totalProgressIncrements: uploads
    .reduce( ( count, current ) => count
      + current.observationPhotos.length, uploads.length )
} );

const uploadReducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "PAUSE_UPLOADS":
      return {
        ...state,
        uploadInProgress: false
      };
    case "SET_UPLOAD_ERROR":
      return {
        ...state,
        error: action.error,
        uploadInProgress: false
      };
    case "SET_UPLOADS":
      return {
        ...state,
        uploads: action.uploads
      };
    case "START_UPLOAD":
      return {
        ...state,
        ...startUploadState( action.observation
          ? [action.observation]
          : state.uploads ),
        singleUpload: action.singleUpload
      };
    case "START_NEXT_UPLOAD":
      return {
        ...state,
        currentUploadCount: state.currentUploadCount + 1
      };
    case "STOP_UPLOADS":
      return {
        ...state,
        ...INITIAL_UPLOAD_STATE
      };
    case "UPLOADS_COMPLETE":
      return {
        ...state,
        uploadInProgress: false,
        uploadsComplete: true
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploadProgress: action.uploadProgress
      };
    case "RESET_UPLOAD_STATE":
      return {
        ...INITIAL_UPLOAD_STATE
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

  const currentUser = useCurrentUser();
  const { isFetchingNextPage, fetchNextPage } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUser?.id
    }
  } );

  const {
    uploads,
    uploadsComplete,
    uploadProgress,
    uploadInProgress,
    totalProgressIncrements
  } = state;

  const currentUploadProgress = Object.values( uploadProgress )
    .reduce( ( count, current ) => count + Number( current ), 0 );

  const toolbarProgress = totalProgressIncrements > 0
    ? currentUploadProgress / totalProgressIncrements
    : 0;

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
    // show progress in toolbar for observations uploaded on ObsEdit
    if ( navParams?.uuid && !state.uploadInProgress ) {
      const savedObservation = realm?.objectForPrimaryKey( "Observation", navParams?.uuid );
      dispatch( {
        type: "START_UPLOAD",
        observation: savedObservation,
        singleUpload: true
      } );
    }
  }, [navParams, state.uploadInProgress, realm] );

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

  const upload = useCallback( async observation => {
    try {
      await uploadObservation( observation, realm );
    } catch ( e ) {
      console.warn( e );
      dispatch( { type: "SET_UPLOAD_ERROR", error: e.message } );
    }
  }, [realm] );

  const startUpload = useCallback( async ( observation, options ) => {
    toggleLoginSheet( );
    showInternetErrorAlert( );
    if ( !options || options?.singleUpload !== false ) {
      dispatch( { type: "START_UPLOAD", observation, singleUpload: true } );
    }
    await upload( observation );
    dispatch( { type: "UPLOADS_COMPLETE" } );
  }, [
    showInternetErrorAlert,
    toggleLoginSheet,
    upload
  ] );

  const uploadMultipleObservations = useCallback( async ( ) => {
    if ( uploadsComplete ) {
      return;
    }
    dispatch( { type: "START_UPLOAD", singleUpload: uploads.length === 1 } );

    uploads.forEach( async ( obsToUpload, i ) => {
      await upload( obsToUpload );
      if ( i > 0 ) {
        dispatch( { type: "START_NEXT_UPLOAD" } );
      }
      if ( i === uploads.length - 1 ) {
        dispatch( { type: "UPLOADS_COMPLETE" } );
      }
    } );
  }, [
    uploadsComplete,
    upload,
    uploads
  ] );

  const startMultipleUploads = useCallback( ( ) => {
    toggleLoginSheet( );
    showInternetErrorAlert( );
    uploadMultipleObservations( );
  }, [
    toggleLoginSheet,
    showInternetErrorAlert,
    uploadMultipleObservations
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
    toggleLoginSheet( );
    showInternetErrorAlert( );
    // TODO: GET observation/deletions once this is enabled in API v2
    activateKeepAwake( );
    await downloadRemoteObservationsFromServer( );
    // we at least want to keep the device awake while uploads are happening
    // not sure about downloads/deletions
    deactivateKeepAwake( );
  }, [
    downloadRemoteObservationsFromServer,
    toggleLoginSheet,
    showInternetErrorAlert] );

  useEffect( ( ) => {
    if ( uploadInProgress || uploadsComplete ) {
      return;
    }
    if ( allObsToUpload?.length > 0 && allObsToUpload.length > uploads.length ) {
      dispatch( { type: "SET_UPLOADS", uploads: allObsToUpload } );
    }
  }, [allObsToUpload, uploads, uploadInProgress, uploadsComplete] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        dispatch( { type: "RESET_UPLOAD_STATE" } );
      } );
    },
    [navigation]
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
      uploadMultipleObservations={startMultipleUploads}
      stopUpload={stopUpload}
      uploadObservation={startUpload}
      syncObservations={syncObservations}
      toolbarProgress={toolbarProgress}
    />
  );
};

export default MyObservationsContainer;
