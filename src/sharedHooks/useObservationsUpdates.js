// @flow

import { fetchObservationUpdates } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

export const fetchObservationUpdatesKey = "fetchObservationUpdates";

const useObservationsUpdates = ( enabled: boolean ): Object => {
  const realm = useRealm();

  // Request params for fetching unviewed updates
  const baseParams = {
    observations_by: "owner",
    viewed: false,
    fields: "viewed,resource_uuid,comment_id,identification_id",
    per_page: 50
  };

  const {
    data,
    refetch
  } = useAuthenticatedQuery(
    [fetchObservationUpdatesKey],
    optsWithAuth => fetchObservationUpdates( baseParams, optsWithAuth ),
    { enabled: !!( enabled ) }
  );

  /*
    Example data:
    data [
      {
        "id": 444891990,
        "identification_id": 351030378,
        "resource_uuid": "7875be1b-37aa-4db7-8dd3-12d8fd95641f",
        "viewed": false
      },
      {
        "comment_id": 11903880,
        "id": 444891374,
        "resource_uuid": "04000bd3-1911-46ca-b574-a9146a1f0924",
        "viewed": false
      },
      {
        "id": 444769999,
        "identification_id": 351012490,
        "resource_uuid": "92974209-f91c-4144-a237-9a4cdccba298",
        "viewed": false
      },
      {
        "comment_id": 11903367,
        "id": 444764480,
        "resource_uuid": "92974209-f91c-4144-a237-9a4cdccba298",
        "viewed": false
      }
    ]
  */

  useEffect( ( ) => {
    // Looping through all unviewed updates
    const remoteUnviewed = data?.filter( result => result.viewed === false );
    safeRealmWrite( realm, ( ) => {
      remoteUnviewed?.forEach( update => {
        // Get the observation from local realm that matches the update's resource_uuid
        const existingObs = realm?.objectForPrimaryKey(
          "Observation",
          update.resource_uuid
        );
        if ( !existingObs ) {
          return;
        }
        // If both comments and identifications are already unviewed, nothing to do here
        if (
          existingObs.comments_viewed === false
          && existingObs.identifications_viewed === false
        ) {
          return;
        }
        // If the update is a comment, set the observation's comments_viewed to false
        if (
          existingObs.comments_viewed || existingObs.comments_viewed === null
        ) {
          if ( update.comment_id ) {
            existingObs.comments_viewed = false;
          }
        }
        // If the update is an identification, set the observation's identifications_viewed to false
        if (
          existingObs.identifications_viewed || existingObs.identifications_viewed === null
        ) {
          if ( update.identification_id ) {
            existingObs.identifications_viewed = false;
          }
        }
      } );
    }, "setting comments and/or identifications false in useObservationsUpdates" );
  }, [data, realm] );

  return { refetch };
};

export default useObservationsUpdates;
