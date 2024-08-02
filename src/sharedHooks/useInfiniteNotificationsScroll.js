// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchObservationUpdates, fetchRemoteObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { flatten } from "lodash";
import { RealmContext } from "providers/contexts";
import { useCallback } from "react";
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

  const fetchObsByUUIDs = useCallback( async ( uuids, authOptions ) => {
    const observations = await fetchRemoteObservations(
      uuids,
      { fields: Observation.FIELDS },
      authOptions
    );
    Observation.upsertRemoteObservations( observations, realm );
  }, [realm] );

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
      const obsUUIDs = response?.map( obsUpdate => obsUpdate.resource_uuid ) || [];
      if ( obsUUIDs.length > 0 ) {
        await fetchObsByUUIDs( obsUUIDs, options );
      }

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
