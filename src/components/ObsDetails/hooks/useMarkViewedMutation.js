// @flow
import { useQueryClient } from "@tanstack/react-query";
import {
  markObservationUpdatesViewed
} from "api/observations";
import { RealmContext } from "providers/contexts.ts";
import {
  useEffect,
  useState
} from "react";
import Observation from "realmModels/Observation";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useObservationsUpdates
} from "sharedHooks";
import { fetchObservationUpdatesKey } from "sharedHooks/useObservationsUpdates";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const useMarkViewedMutation = (
  localObservation: Object,
  remoteObservation: Object
) => {
  const currentUser = useCurrentUser( );
  const realm = useRealm( );
  const setObservationMarkedAsViewedAt = useStore(
    state => state.setObservationMarkedAsViewedAt
  );
  const queryClient = useQueryClient( );
  const [isMarkingViewed, setIsMarkingViewed] = useState( false );

  const observation = localObservation || Observation.mapApiToRealm( remoteObservation );
  const uuid = observation?.uuid;

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation
  );

  const markViewedLocally = async ( ) => {
    if ( !localObservation ) { return; }
    safeRealmWrite( realm, ( ) => {
      // Flags if all comments and identifications have been viewed
      localObservation.comments_viewed = true;
      localObservation.identifications_viewed = true;
    }, "marking viewed locally in ObsDetailsContainer" );
  };

  const markViewedMutation = useAuthenticatedMutation(
    ( viewedParams, optsWithAuth ) => markObservationUpdatesViewed( viewedParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        markViewedLocally( );
        queryClient.invalidateQueries( { queryKey: [fetchObservationUpdatesKey] } );
        refetchObservationUpdates( );
        // Set this value so NotificationsIconContainer knows to update the
        // notifications count
        setObservationMarkedAsViewedAt( new Date( ) );
      }
    }
  );

  useEffect( ( ) => {
    // If user is not signed in, we can't mark as viewed
    if ( !currentUser ) return;
    // If a remote obs doesn't exist, we can't mark it as viewed, and if we
    // don't have a copy b/c of no/weak internet connection, we also probably
    // can't mark it as viewed
    if ( !remoteObservation ) return;
    // If we're already in the process of marking as viewed, we don't want to
    // do it again
    if ( isMarkingViewed ) return;
    // If a local copy exists and it's already been marked as viewed, we're
    // probably good. Might be redundant with the prior check, though.
    if ( localObservation && localObservation.viewed( ) ) return;

    setIsMarkingViewed( true );
    markViewedMutation.mutate( { id: uuid } );
  }, [
    currentUser,
    localObservation,
    remoteObservation,
    uuid,
    markViewedMutation,
    isMarkingViewed
  ] );
};

export default useMarkViewedMutation;
