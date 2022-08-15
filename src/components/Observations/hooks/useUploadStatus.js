// @flow

import _ from "lodash";
import {
  useCallback, useEffect, useState
} from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";

const useUploadStatus = ( ): Object => {
  const [uploadStatus, setUploadStatus] = useState( {
    allObsToUpload: [],
    uploadInProgress: false
  } );

  const updateUnsyncedObs = useCallback( realm => {
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
    setUploadStatus( {
      ...uploadStatus,
      allObsToUpload: obsToUpload
    } );
  }, [uploadStatus] );

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
    const fetchUnuploadedObs = async ( ) => {
      if ( !isCurrent ) { return; }
      const realm = await Realm.open( realmConfig );
      // determine which local observations are new or modified
      // and need to be uploaded
      updateUnsyncedObs( realm );
    };

    fetchUnuploadedObs( );

    return ( ) => {
      isCurrent = false;
    };
  }, [updateUnsyncedObs] );

  return {
    updateUploadStatus,
    uploadStatus
  };
};

export default useUploadStatus;
