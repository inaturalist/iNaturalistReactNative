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
    if ( !remoteObservation || isMarkingViewed ) { return; }
    if ( localObservation?.unviewed( ) === true ) {
      setIsMarkingViewed( true );
      markViewedMutation.mutate( { id: uuid } );
    }
  }, [
    localObservation,
    remoteObservation,
    uuid,
    markViewedMutation,
    isMarkingViewed
  ] );
};

export default useMarkViewedMutation;
