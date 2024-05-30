import { useNavigation } from "@react-navigation/native";
import { deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect
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

export default useUploadObservations = ( ): Object => {
  const realm = useRealm( );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const addUploadError = useStore( state => state.addUploadError );
  const completeUploads = useStore( state => state.completeUploads );
  const error = useStore( state => state.uploadError );
  const uploadStatus = useStore( state => state.uploadStatus );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const removeFromUploadQueue = useStore( state => state.removeFromUploadQueue );
  const uploadQueue = useStore( state => state.uploadQueue );
  const setCurrentUpload = useStore( state => state.setCurrentUpload );
  const currentUpload = useStore( state => state.currentUpload );
  const setTotalToolbarIncrements = useStore( state => state.setTotalToolbarIncrements );
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const numObservationsInQueue = useStore( state => state.numObservationsInQueue );

  // The existing abortController lets you abort...
  const abortController = useStore( storeState => storeState.abortController );
  // ...but whenever you start a new abortable upload process, you need to
  //    mint a new abort controller
  const newAbortController = useStore( storeState => storeState.newAbortController );

  const navigation = useNavigation( );
  const { t } = useTranslation( );

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
    setCurrentUpload( observation );
    try {
      await uploadObservation( observation, realm, { signal: newAbortController( ).signal } );
      removeFromUploadQueue( );
      if (
        uploadQueue.length === 0
        && !currentUpload
      ) {
        completeUploads( );
      }
    } catch ( uploadError ) {
      const message = handleUploadError( uploadError, t );
      addUploadError( message, observation.uuid );
    }
  }, [
    addUploadError,
    completeUploads,
    currentUpload,
    newAbortController,
    realm,
    removeFromUploadQueue,
    setCurrentUpload,
    t,
    uploadQueue
  ] );

  useEffect( ( ) => {
    const startUpload = async ( ) => {
      const lastQueuedUuid = uploadQueue[uploadQueue.length - 1];
      const localObservation = realm.objectForPrimaryKey( "Observation", lastQueuedUuid );
      if ( localObservation ) {
        await uploadObservationAndCatchError( localObservation );
      }
    };
    if ( uploadStatus === "uploadInProgress"
      && uploadQueue.length > 0
      && !currentUpload
    ) {
      startUpload( );
    }
  }, [
    currentUpload,
    realm,
    uploadObservationAndCatchError,
    uploadQueue,
    uploadStatus
  ] );

  useEffect( ( ) => {
    if ( uploadStatus === "pending" ) {
      const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );
      const numUnuploadedObs = allUnsyncedObservations.length;
      setNumUnuploadedObservations( numUnuploadedObs );
    }
  }, [realm, setNumUnuploadedObservations, uploadStatus] );

  useEffect( ( ) => {
    if ( uploadQueue.length === numObservationsInQueue ) {
      const uuidsQuery = uploadQueue.map( uploadUuid => `'${uploadUuid}'` ).join( ", " );
      const uploads = realm.objects( "Observation" )
        .filtered( `uuid IN { ${uuidsQuery} }` );
      setTotalToolbarIncrements( uploads );
    }
  }, [
    numObservationsInQueue,
    realm,
    setTotalToolbarIncrements,
    uploadQueue,
    uploadQueue.length
  ] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        resetUploadObservationsSlice( );
      } );
    },
    [
      navigation,
      resetUploadObservationsSlice
    ]
  );

  useEffect( ( ) => {
    // fully stop uploads when cancel upload button is tapped
    if ( uploadStatus === "pending" ) {
      abortController.abort( );
      deactivateKeepAwake( );
    }
  }, [abortController, uploadStatus] );

  return null;
};
