// @flow

import { fetchObservationUpdates } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

export const fetchObservationUpdatesKey = "fetchObservationUpdates";

const PER_PAGE = 100;

const useObservationsUpdates = ( enabled: boolean ): Object => {
  const realm = useRealm();

  // Request params for fetching unviewed updates
  const baseParams = {
    observations_by: "owner",
    viewed: false,
    fields: "viewed,resource_uuid,comment_id,identification_id",
    per_page: PER_PAGE,
  };

  const {
    data,
    refetch,
  } = useAuthenticatedQuery(
    [fetchObservationUpdatesKey],
    optsWithAuth => fetchObservationUpdates( baseParams, optsWithAuth ),
    { enabled: !!( enabled ) },
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

    // Per-observation summary of what kinds of updates the server still considers unviewed,
    // used below to reconcile obs the user viewed elsewhere (e.g. the website).
    const unviewedByUuid = new Map();
    remoteUnviewed?.forEach( update => {
      const entry = unviewedByUuid.get( update.resource_uuid )
        || { hasComment: false, hasIdent: false };
      if ( update.comment_id ) entry.hasComment = true;
      if ( update.identification_id ) entry.hasIdent = true;
      unviewedByUuid.set( update.resource_uuid, entry );
    } );

    safeRealmWrite( realm, ( ) => {
      remoteUnviewed?.forEach( update => {
        // Get the observation from local realm that matches the update's resource_uuid
        const existingObs = realm?.objectForPrimaryKey(
          "Observation",
          update.resource_uuid,
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

      // If the response was capped at per_page, we can't tell if observations beyond that cap
      // are truly viewed or not, so we'll skip the sweep to avoid falsely clearing filled state.
      if ( data && data.length >= PER_PAGE ) {
        return;
      }

      // Reconcile obs the user viewed elsewhere (e.g. the website): any observation currently
      // marked unviewed locally that no longer has a matching unviewed update on the
      // server should flip back to viewed.
      const locallyUnviewed = realm.objects( "Observation" ).filtered(
        "comments_viewed == false OR identifications_viewed == false",
      );
      locallyUnviewed.forEach( obs => {
        const serverUnviewed = unviewedByUuid.get( obs.uuid );
        if ( !serverUnviewed ) {
          obs.comments_viewed = true;
          obs.identifications_viewed = true;
          return;
        }
        if ( obs.comments_viewed === false && !serverUnviewed.hasComment ) {
          obs.comments_viewed = true;
        }
        if ( obs.identifications_viewed === false && !serverUnviewed.hasIdent ) {
          obs.identifications_viewed = true;
        }
      } );
    }, "reconciling comments and/or identifications viewed state in useObservationsUpdates" );
  }, [data, realm] );

  return { refetch };
};

export default useObservationsUpdates;
