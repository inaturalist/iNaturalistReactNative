import { useNavigation, useRoute } from "@react-navigation/native";
import { deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useState
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import uploadObservation, { handleUploadError } from "sharedHelpers/uploadObservation";
import {
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

export default useUploadObservations = (
  toggleLoginSheet,
  showInternetErrorAlert,
  currentUser,
  isOnline
): Object => {
  const realm = useRealm( );
  const startSingleUpload = useStore( state => state.startSingleUpload );
  const startMultipleUploads = useStore( state => state.startMultipleUploads );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const addUploadError = useStore( state => state.addUploadError );
  const addUploaded = useStore( state => state.addUploaded );
  const setUploads = useStore( state => state.setUploads );
  const startNextUpload = useStore( state => state.startNextUpload );
  const completeUploads = useStore( state => state.completeUploads );
  const error = useStore( state => state.uploadError );
  const uploadStatus = useStore( state => state.uploadStatus );
  const uploads = useStore( state => state.uploads );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const stopAllUploads = useStore( state => state.stopAllUploads );
  const [uploadingObsUUID, setUploadingObsUUID] = useState( null );

  // The existing abortController lets you abort...
  const abortController = useStore( storeState => storeState.abortController );
  // ...but whenever you start a new abortable upload process, you need to
  //    mint a new abort controller
  const newAbortController = useStore( storeState => storeState.newAbortController );

  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const allObsToUpload = Observation.filterUnsyncedObservations( realm );
  const numUnuploadedObs = allObsToUpload.length;
  const { params: navParams } = useRoute( );

  useEffect( () => {
    let timer;
    if ( uploadStatus === "complete" && !error ) {
      timer = setTimeout( () => {
        resetUploadObservationsSlice( );
      }, 5000 );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [uploadStatus, error, resetUploadObservationsSlice] );

  useEffect( ( ) => {
    setUploadingObsUUID( navParams?.uploadingObsUUID );
  }, [navParams?.uploadingObsUUID] );

  useEffect( ( ) => {
    // show progress in toolbar for observations uploaded on ObsEdit
    if (
      uploadingObsUUID
      && uploadStatus !== "uploadInProgress"
      && currentUser
      && realm
    ) {
      const savedObservation = realm.objectForPrimaryKey(
        "Observation",
        uploadingObsUUID
      );
      // Reset this value so we don't run this effect again. We only need to
      // show uploading UI once.
      setUploadingObsUUID( null );
      const wasSynced = savedObservation?.wasSynced( );
      if ( savedObservation && !wasSynced ) {
        // FYI, this doesn't actually start the upload. Here we're assuming
        // the upload was started from ObsEdit and we're just updating upload
        // state to match.
        startSingleUpload( savedObservation );
      }
    }
  }, [uploadStatus, realm, currentUser, startSingleUpload, uploadingObsUUID] );

  useEffect( ( ) => {
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];
        updateTotalUploadProgress( uuid, increment );
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [
    updateTotalUploadProgress
  ] );

  const uploadObservationAndCatchError = useCallback( async observation => {
    try {
      await uploadObservation( observation, realm, { signal: newAbortController( ).signal } );
      addUploaded( observation.uuid );
    } catch ( uploadError ) {
      const message = handleUploadError( uploadError, t );
      addUploadError( message, observation.uuid );
    }
  }, [
    realm,
    addUploaded,
    addUploadError,
    newAbortController,
    t
  ] );

  const uploadSingleObservation = useCallback( async ( observation, options ) => {
    if ( !currentUser ) {
      toggleLoginSheet( );
      return;
    }
    if ( !isOnline ) {
      showInternetErrorAlert( );
      return;
    }
    if ( !options || options?.singleUpload !== false ) {
      startSingleUpload( observation );
    }
    try {
      await uploadObservationAndCatchError( observation );
    } catch ( uploadSingleObservationError ) {
      if ( uploadSingleObservationError.message === "Aborted" ) {
        stopAllUploads( );
        return;
      }
      throw uploadSingleObservationError;
    }
    completeUploads( );
  }, [
    completeUploads,
    currentUser,
    isOnline,
    showInternetErrorAlert,
    toggleLoginSheet,
    uploadObservationAndCatchError,
    startSingleUpload,
    stopAllUploads
  ] );

  const uploadMultipleObservations = useCallback( async ( ) => {
    if ( !currentUser ) {
      toggleLoginSheet( );
      return;
    }
    if ( numUnuploadedObs === 0 || uploadStatus === "uploadInProgress" ) {
      return;
    }
    if ( !isOnline ) {
      showInternetErrorAlert( );
      return;
    }
    startMultipleUploads( );

    try {
      await Promise.all( uploads.map( async obsToUpload => {
        await uploadObservationAndCatchError( obsToUpload );
        startNextUpload( );
      } ) );
      completeUploads( );
    } catch ( uploadMultipleObservationsError ) {
      if ( uploadMultipleObservationsError.message === "Aborted" ) {
        stopAllUploads( );
      }
    }
  }, [
    completeUploads,
    currentUser,
    isOnline,
    numUnuploadedObs,
    showInternetErrorAlert,
    startMultipleUploads,
    startNextUpload,
    stopAllUploads,
    toggleLoginSheet,
    uploadObservationAndCatchError,
    uploadStatus,
    uploads
  ] );

  useEffect( ( ) => {
    // put uploads into upload stack
    if ( uploadStatus === "pending"
      && allObsToUpload?.length > 0
      && allObsToUpload.length > uploads.length
    ) {
      setUploads( allObsToUpload );
    }
  }, [allObsToUpload, uploads, uploadStatus, setUploads] );

  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        resetUploadObservationsSlice( );
      } );
    },
    [
      allObsToUpload,
      navigation,
      realm,
      resetUploadObservationsSlice,
      setUploads
    ]
  );

  const stopUploads = useCallback( ( ) => {
    stopAllUploads( );
    abortController.abort( );
    deactivateKeepAwake( );
  }, [abortController, stopAllUploads] );

  return {
    uploadMultipleObservations,
    uploadSingleObservation,
    stopUploads
  };
};
