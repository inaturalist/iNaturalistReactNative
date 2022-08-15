// @flow

import _ from "lodash";
import {
  useCallback, useEffect, useState
} from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";

const useRemoteObservations = ( ): Object => {
  const [loading, setLoading] = useState( false );
  const [page, setPage] = useState( 1 );
  const [uploadStatus, setUploadStatus] = useState( {
    allObsToUpload: [],
    unuploadedObs: [],
    totalObsToUpload: 0,
    uploadInProgress: false
  } );
  const [fetchFromServer, setFetchFromServer] = useState( true );

  const syncObservations = useCallback( ( ) => {
    setFetchFromServer( true );
  }, [] );

  const updateUnsyncedObs = useCallback( realm => {
    const { unuploadedObs, totalObsToUpload } = uploadStatus;
    const numOfUnuploadedObs = unuploadedObs?.length;
    const obs = realm?.objects( "Observation" );
    // includes obs which have never been synced or which have been updated
    // locally since the last sync
    const unsyncedFilter = "_synced_at == null || _synced_at <= _updated_at";
    const unsyncedObs = obs.filtered( unsyncedFilter );

    const photos = realm?.objects( "ObservationPhoto" );
    const unsyncedPhotos = photos.filtered( unsyncedFilter );

    // fetch unsynced photos & figure out which observation they are linked to
    const obsWithUnsyncedPhotos = _.uniq( unsyncedPhotos
      .map( photo => photo.linkingObjects( "Observation", "observationPhotos" )[0] ) );

    // combine all the observations & obs with photos needing upload
    const combinedObsAndPhotos = _.concat( unsyncedObs.map( o => o ), obsWithUnsyncedPhotos );
    const obsToUpload = _.uniqBy( combinedObsAndPhotos, "uuid" );

    // console.log( obsToUpload, "obs to upload, useRemoteObservations" );
    // console.log( obsToUpload.map( o => o.uuid ), "all obs to upload length" );

    if ( obsToUpload?.length && obsToUpload?.length !== numOfUnuploadedObs ) {
      setUploadStatus( {
        ...uploadStatus,
        unuploadedObs: obsToUpload,
        allObsToUpload: obsToUpload,
        totalObsToUpload: Math.max( obsToUpload.length, totalObsToUpload )
      } );
    }
  }, [uploadStatus] );

  const fetchNextObservations = useCallback( numOfObs => {
    const nextPageToFetch = numOfObs > 0
      ? Math.ceil( numOfObs / 6 )
      : 1;
    setPage( nextPageToFetch );
    setFetchFromServer( true );
  }, [] );

  const updateUploadStatus = useCallback( ( ) => {
    if ( uploadStatus.uploadInProgress === false ) {
      setUploadStatus( {
        ...uploadStatus,
        uploadInProgress: true
      } );
    }
  }, [uploadStatus] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      if ( !isCurrent ) { return; }
      setLoading( true );
      const realm = await Realm.open( realmConfig );
      // determine which local observations are new or modified
      // and need to be uploaded
      updateUnsyncedObs( realm );

      // update local observations with unviewed comment or id statuses
      await Observation.fetchObservationUpdates( realm );

      // fetch remote observations
      const results = await Observation.fetchRemoteObservations( page );
      if ( results ) {
        // update realm with new or modified remote observations
        Observation.updateLocalObservationsFromRemote( realm, results );
      }

      if ( !isCurrent ) { return; }
      setLoading( false );
    };

    if ( fetchFromServer ) {
      fetchObservations( );
      setFetchFromServer( false );
    }
    return ( ) => {
      isCurrent = false;
    };
  }, [updateUnsyncedObs, page, fetchFromServer] );

  return {
    loading,
    syncObservations,
    fetchNextObservations,
    updateUploadStatus,
    uploadStatus,
    setUploadStatus
  };
};

export default useRemoteObservations;
