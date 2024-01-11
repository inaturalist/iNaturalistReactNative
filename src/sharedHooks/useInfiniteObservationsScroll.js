// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten, last, noop } from "lodash";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import { useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const useInfiniteObservationsScroll = ( { upsert, params: newInputParams }: Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const baseParams = {
    ...newInputParams,
    per_page: 50,
    fields: Observation.LIST_FIELDS,
    ttl: -1
  };

  const { fields, ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteObservationsScroll", "searchObservations", queryKeyParams];

  const {
    data: observations,
    isFetchingNextPage,
    fetchNextPage,
    status
  } = useInfiniteQuery( {
    // eslint-disable-next-line
    queryKey,
    keepPreviousData: false,
    queryFn: async ( { pageParam } ) => {
      const apiToken = await getJWT( );
      const options = {
        api_token: apiToken
      };

      const params = {
        ...baseParams
      };

      if ( pageParam ) {
        // $FlowIgnore
        params.id_below = pageParam;
      } else {
        // $FlowIgnore
        params.page = 1;
      }
      const { results } = await searchObservations( params, options );
      return results || [];
    },
    getNextPageParam: lastPage => last( lastPage )?.id,
    // allow a user to see the Explore screen Observations
    // content while logged out
    enabled: !!currentUser || upsert === false
  } );

  useEffect( ( ) => {
    if ( observations?.pages && upsert ) {
      Observation.upsertRemoteObservations(
        flatten( last( observations.pages ) ),
        realm
      );
    }
  }, [realm, observations, upsert] );

  return currentUser
    ? {
      isFetchingNextPage,
      fetchNextPage,
      observations: flatten( observations?.pages ),
      status
    }
    : {
      isFetchingNextPage: false,
      fetchNextPage: noop,
      observations: flatten( observations?.pages ),
      status
    };
};

export default useInfiniteObservationsScroll;
