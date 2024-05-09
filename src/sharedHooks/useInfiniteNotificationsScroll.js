// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchObservationUpdates, fetchRemoteObservation } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten } from "lodash";
import { RealmContext } from "providers/contexts";
import Observation from "realmModels/Observation";
import { reactQueryRetry } from "sharedHelpers/logging";
import { useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const BASE_PARAMS = {
  observations_by: "owner",
  fields: "all",
  per_page: 30,
  ttl: -1,
  page: 1
};

const useInfiniteNotificationsScroll = ( ): Object => {
  const currentUser = useCurrentUser( );
  const realm = useRealm( );

  const infQueryResult = useInfiniteQuery( {
    queryKey: ["useInfiniteNotificationsScroll"],
    queryFn: async ( { pageParam } ) => {
      const apiToken = await getJWT( );
      const options = {
        api_token: apiToken
      };

      const params = { ...BASE_PARAMS };

      if ( pageParam ) {
        params.page = pageParam;
      } else {
        params.page = 1;
      }

      const response = await fetchObservationUpdates( params, options );

      // for notification in notifications
      //     fetch observation in notification
      //     update local database with observation in notification

      console.log( "[DEBUG useInfiniteNotificationsScroll.js] response: ", response );
      // TODO: request all obs at once
      // TODO: make sure we don't overwrite obs w changes
      const upsertPromises = response?.map( async notification => {
        const remoteObs = await fetchRemoteObservation(
          notification.resource_uuid,
          { fields: Observation.FIELDS },
          options
        );
        console.log( "[DEBUG useInfiniteNotificationsScroll.js] remoteObs: ", remoteObs );
        Observation.upsertRemoteObservations(
          [remoteObs],
          realm
        );
      } )
      if(upsertPromises){
        await Promise.all( upsertPromises );
      }
      console.log( "finished upserting notifications obs" );

      return response;
    },
    initialPageParam: 0,
    getNextPageParam: ( lastPage, allPages ) => ( lastPage.length > 0
      ? allPages.length + 1
      : undefined ),
    enabled: !!currentUser,
    retry: reactQueryRetry
  } );

  return {
    ...infQueryResult,
    // Disable fetchNextPage if signed out
    fetchNextPage: currentUser
      ? infQueryResult.fetchNextPage
      : ( ) => undefined,
    notifications: flatten( infQueryResult?.data?.pages )
  };
};

export default useInfiniteNotificationsScroll;
