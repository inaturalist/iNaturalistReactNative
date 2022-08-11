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
    const unsyncedObs = obs.filtered( "_synced_at == null || _synced_at <= _updated_at" );

    const photos = realm.objects( "ObservationPhoto" );
    const unsyncedPhotos = photos.filtered( "_synced_at == null || _synced_at <= _updated_at" );
    // const linkedObservation = unsyncedPhotos
    // ?.[0]?.linkingObjects( "Observation", "observationPhotos" )[0];
    console.log( unsyncedPhotos.length, "unsynced photos in useObs" );
    // console.log( linkedObservation, "linked observation" );
    const obsWithUnsyncedPhotos = _.uniq( unsyncedPhotos
      .map( photo => photo.linkingObjects( "Observation", "observationPhotos" )[0] ) );
    console.log( obsWithUnsyncedPhotos, "obs with unsynced photos" );

    // fetch unsynced photos
    // figure out which observation they are attached to
    // show correct number of observations needing upload
    // only try to upload photos, not the existing observation
    // make sure observation photos are created with _created_at
    // and records are correctly updated

    if ( unsyncedObs?.length && unsyncedObs?.length !== numOfUnuploadedObs ) {
      setUploadStatus( {
        ...uploadStatus,
        unuploadedObs: unsyncedObs,
        allObsToUpload: unsyncedObs,
        totalObsToUpload: Math.max( unsyncedObs.length, totalObsToUpload )
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
