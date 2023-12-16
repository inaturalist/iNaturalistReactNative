// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  checkForDeletedObservations, searchObservations
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { format } from "date-fns";
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
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations,
  useObservationsUpdates,
  useTranslation
} from "sharedHooks";

import MyObservations from "./MyObservations";

export const INITIAL_UPLOAD_STATE = {
  currentUploadCount: 0,
  error: null,
  singleUpload: true,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  // $FlowIgnore
  uploadProgress: { },
  // $FlowIgnore
  uploads: [],
  uploadsComplete: false
};

const startUploadState = uploads => ( {
  error: null,
  uploadInProgress: true,
  uploadsComplete: false,
  uploads,
  uploadProgress: { },
  currentUploadCount: 1,
  totalProgressIncrements: uploads
    .reduce(
      ( count, current ) => count + ( current?.observationPhotos?.length || 0 ),
      uploads.length
    )
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
  const [state, dispatch] = useReducer( uploadReducer, INITIAL_UPLOAD_STATE );
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const {
    getItem: getStoredLayout,
    setItem: setStoredLayout
  } = useAsyncStorage( "myObservationsLayout" );
  const [layout, setLayout] = useState( null );
  const isOnline = useIsConnected( );

  const currentUser = useCurrentUser();
  useObservationsUpdates( !!currentUser );
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

  const writeLayoutToStorage = useCallback( async newValue => {
    await setStoredLayout( newValue );
    setLayout( newValue );
  }, [setStoredLayout] );

  useEffect( ( ) => {
    const readLayoutFromStorage = async ( ) => {
      const storedLayout = await getStoredLayout( );
      setLayout( storedLayout || "list" );
    };

    readLayoutFromStorage( );
  }, [getStoredLayout, writeLayoutToStorage] );

  const toggleLayout = ( ) => {
    if ( layout === "grid" ) {
      writeLayoutToStorage( "list" );
    } else {
      writeLayoutToStorage( "grid" );
    }
  };

  useEffect( ( ) => {
    // show progress in toolbar for observations uploaded on ObsEdit
    if ( navParams?.uuid && !state.uploadInProgress && currentUser ) {
      const savedObservation = realm?.objectForPrimaryKey( "Observation", navParams?.uuid );
      const wasSynced = savedObservation?.wasSynced( );
      if ( !wasSynced ) {
        dispatch( {
          type: "START_UPLOAD",
          observation: savedObservation,
          singleUpload: true
        } );
      }
    }
  }, [navParams, state.uploadInProgress, realm, currentUser] );

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

        if ( state.singleUpload
          && state.uploadProgress[uuid] >= state.totalProgressIncrements ) {
          dispatch( {
            type: "UPLOADS_COMPLETE"
          } );
        } else {
          dispatch( {
            type: "UPDATE_PROGRESS",
            uploadProgress: currentProgress
          } );
        }
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [state.uploadProgress, state.singleUpload, state.totalProgressIncrements, uploadInProgress] );

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

  const uploadObservationAndCatchError = useCallback( async observation => {
    try {
      await uploadObservation( observation, realm );
    } catch ( uploadError ) {
      console.warn( "MyObservationsContainer, uploadError: ", uploadError );
      let { message } = uploadError;
      if ( uploadError?.json?.errors ) {
        // TODO localize comma join
        message = uploadError.json.errors.map( error => {
          if ( error.message?.errors ) {
            return error.message.errors.flat( ).join( ", " );
          }
          return error.message;
        } ).join( ", " );
      }
      dispatch( { type: "SET_UPLOAD_ERROR", error: message } );
    }
  }, [realm] );

  const uploadSingleObservation = useCallback( async ( observation, options ) => {
    toggleLoginSheet( );
    showInternetErrorAlert( );
    if ( !options || options?.singleUpload !== false ) {
      dispatch( { type: "START_UPLOAD", observation, singleUpload: true } );
    }
    await uploadObservationAndCatchError( observation );
    dispatch( { type: "UPLOADS_COMPLETE" } );
  }, [
    showInternetErrorAlert,
    toggleLoginSheet,
    uploadObservationAndCatchError
  ] );

  const uploadMultipleObservations = useCallback( async ( ) => {
    if ( uploadsComplete || uploadInProgress ) {
      return;
    }
    dispatch( { type: "START_UPLOAD", singleUpload: uploads.length === 1 } );

    uploads.forEach( async ( obsToUpload, i ) => {
      await uploadObservationAndCatchError( obsToUpload );
      if ( i > 0 ) {
        dispatch( { type: "START_NEXT_UPLOAD" } );
      }
      if ( i === uploads.length - 1 ) {
        dispatch( { type: "UPLOADS_COMPLETE" } );
      }
    } );
  }, [
    uploadsComplete,
    uploadObservationAndCatchError,
    uploads,
    uploadInProgress
  ] );

  const stopUploads = useCallback( ( ) => {
    dispatch( { type: "STOP_UPLOADS" } );
    deactivateKeepAwake( );
  }, [] );

  const downloadRemoteObservationsFromServer = useCallback( async ( ) => {
    const apiToken = await getJWT( );
    const params = {
      user_id: currentUser?.id,
      per_page: 50,
      fields: Observation.FIELDS
    };
    const { results } = await searchObservations( params, { api_token: apiToken } );

    Observation.upsertRemoteObservations( results, realm );
  }, [currentUser, realm] );

  // TODO move this logic to a helper or a model so it can be more easily unit tested
  const syncRemoteDeletedObservations = useCallback( async ( ) => {
    const apiToken = await getJWT( );
    const lastSyncTime = realm.objects( "LocalPreferences" )?.[0]?.last_sync_time;
    const params = { since: format( new Date( ), "yyyy-MM-dd" ) };
    if ( lastSyncTime ) {
      try {
        params.since = format( lastSyncTime, "yyyy-MM-dd" );
      } catch ( lastSyncTimeFormatError ) {
        if ( lastSyncTimeFormatError instanceof RangeError ) {
          // If we can't parse that date, assume we've never synced and use the default
        } else {
          throw lastSyncTimeFormatError;
        }
      }
    }
    const response = await checkForDeletedObservations( params, { api_token: apiToken } );
    const deletedObservations = response?.results;
    if ( !deletedObservations ) { return; }
    if ( deletedObservations?.length > 0 ) {
      realm.write( ( ) => {
        deletedObservations.forEach( observationId => {
          const localObsToDelete = realm.objects( "Observation" )
            .filtered( `id == ${observationId}` );
          realm.delete( localObsToDelete );
        } );
      } );
    }
  }, [realm] );

  const updateSyncTime = useCallback( ( ) => {
    const currentSyncTime = new Date( );
    realm.write( ( ) => {
      const localPrefs = realm.objects( "LocalPreferences" )[0];
      if ( !localPrefs ) {
        realm.create( "LocalPreferences", {
          ...localPrefs,
          last_sync_time: currentSyncTime
        } );
      } else {
        localPrefs.last_sync_time = currentSyncTime;
      }
    } );
  }, [realm] );

  const syncObservations = useCallback( async ( ) => {
    if ( !uploadInProgress && uploadsComplete ) {
      dispatch( { type: "RESET_UPLOAD_STATE" } );
    }
    toggleLoginSheet( );
    showInternetErrorAlert( );
    activateKeepAwake( );
    await syncRemoteDeletedObservations( );
    await downloadRemoteObservationsFromServer( );
    updateSyncTime( );
    deactivateKeepAwake( );
  }, [uploadInProgress,
    uploadsComplete,
    syncRemoteDeletedObservations,
    downloadRemoteObservationsFromServer,
    toggleLoginSheet,
    showInternetErrorAlert,
    updateSyncTime
  ] );

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
      navigation.addListener( "focus", ( ) => {
        dispatch( { type: "RESET_UPLOAD_STATE" } );
      } );
    },
    [navigation, realm]
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
      stopUploads={stopUploads}
      uploadSingleObservation={uploadSingleObservation}
      syncObservations={syncObservations}
      toolbarProgress={toolbarProgress}
    />
  );
};

export default MyObservationsContainer;
