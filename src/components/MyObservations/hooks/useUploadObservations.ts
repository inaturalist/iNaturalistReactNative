import { useNavigation, useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import uploadObservation from "sharedHelpers/uploadObservation";
import {
  useNumUnuploadedObservations,
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
  const startSingleUpload = useStore( state => state.startSingleUpload );
  const startMultipleUploads = useStore( state => state.startMultipleUploads );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const setMultiUploadError = useStore( state => state.setMultiUploadError );
  const addUploadError = useStore( state => state.addUploadError );
  const addUploaded = useStore( state => state.addUploaded );
  const setUploads = useStore( state => state.setUploads );
  const startNextUpload = useStore( state => state.startNextUpload );
  const completeUploads = useStore( state => state.completeUploads );
  const updateUploadProgress = useStore( state => state.updateUploadProgress );
  const singleUpload = useStore( state => state.singleUpload );
  const totalProgressIncrements = useStore( state => state.totalProgressIncrements );
  const uploadProgress = useStore( state => state.uploadProgress );
  const error = useStore( state => state.uploadError );
  const uploadsComplete = useStore( state => state.uploadsComplete );
  const uploadInProgress = useStore( state => state.uploadInProgress );
  const uploads = useStore( state => state.uploads );

  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const allObsToUpload = Observation.filterUnsyncedObservations( realm );
  const { params: navParams } = useRoute( );

  const numUnuploadedObservations = useNumUnuploadedObservations( );

  useEffect( () => {
    let timer;
    if ( uploadsComplete && !error ) {
      timer = setTimeout( () => {
        resetUploadObservationsSlice( );
      }, 5000 );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [uploadsComplete, error, resetUploadObservationsSlice] );

  useEffect( ( ) => {
    // show progress in toolbar for observations uploaded on ObsEdit
    if ( navParams?.uuid && !uploadInProgress && currentUser ) {
      const savedObservation = realm?.objectForPrimaryKey( "Observation", navParams?.uuid );
      const wasSynced = savedObservation?.wasSynced( );
      if ( !wasSynced ) {
        startSingleUpload( savedObservation );
      }
    }
  }, [navParams, uploadInProgress, realm, currentUser, startSingleUpload] );

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

        // This is really hacky, but our obs upload logic is distributed so much that I can not
        // figure out a better way to do this. This is true for an observation without media
        // for which this useEffect is only triggered once, and therefore completeUploads( )
        // is never dispatched.
        const isOne = totalProgressIncrements === 1;
        if (
          singleUpload
          && (
            uploadProgress[uuid] >= totalProgressIncrements
            || isOne
          )
        ) {
          if ( isOne ) {
            updateUploadProgress( currentProgress );
          }
          completeUploads( );
        } else {
          updateUploadProgress( currentProgress );
        }
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [
    updateUploadProgress,
    completeUploads,
    uploadProgress,
    singleUpload,
    totalProgressIncrements,
    uploadInProgress
  ] );

  const uploadObservationAndCatchError = useCallback( async observation => {
    try {
      await uploadObservation( observation, realm );
      addUploaded( observation.uuid );
    } catch ( uploadError ) {
      let { message } = uploadError;
      if ( uploadError?.json?.errors ) {
        // TODO localize comma join
        message = uploadError.json.errors.map( e => {
          if ( e.message?.errors ) {
            return e.message.errors.flat( ).join( ", " );
          }
          return e.message;
        } ).join( ", " );
      } else if ( uploadError.message?.match( /Network request failed/ ) ) {
        message = t( "Connection-problem-Please-try-again-later" );
      } else {
        throw uploadError;
      }
      addUploadError( message, observation.uuid );
    }
  }, [
    realm,
    addUploaded,
    addUploadError,
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
    await uploadObservationAndCatchError( observation );
    completeUploads( );
  }, [
    completeUploads,
    currentUser,
    isOnline,
    showInternetErrorAlert,
    toggleLoginSheet,
    uploadObservationAndCatchError,
    startSingleUpload
  ] );

  const uploadMultipleObservations = useCallback( async ( ) => {
    if ( !currentUser ) {
      toggleLoginSheet( );
      return;
    }
    if ( numUnuploadedObservations === 0 || uploadInProgress ) {
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
      logger.error( "Failed to uploadMultipleObservations: ", uploadMultipleObservationsError );
      setMultiUploadError( t( "Something-went-wrong" ) );
    }
  }, [
    completeUploads,
    currentUser,
    isOnline,
    startNextUpload,
    numUnuploadedObservations,
    showInternetErrorAlert,
    t,
    toggleLoginSheet,
    uploadInProgress,
    uploadObservationAndCatchError,
    uploads,
    startMultipleUploads,
    setMultiUploadError
  ] );

  useEffect( ( ) => {
    if ( uploadInProgress || uploadsComplete ) {
      return;
    }
    if ( allObsToUpload?.length > 0 && allObsToUpload.length > uploads.length ) {
      setUploads( allObsToUpload );
    }
  }, [
    allObsToUpload,
    setUploads,
    uploads,
    uploadInProgress,
    uploadsComplete
  ] );

  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        resetUploadObservationsSlice( );
      } );
    },
    [navigation, realm, resetUploadObservationsSlice]
  );

  return {
    uploadMultipleObservations,
    uploadSingleObservation
  };
};
