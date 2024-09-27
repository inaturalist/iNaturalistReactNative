// @flow

import { searchObservations } from "api/observations";
import { flatten, last, noop } from "lodash";
import { RealmContext } from "providers/contexts.ts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery, useCurrentUser } from "sharedHooks";

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
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( { pageParam }, optsWithAuth ) => {
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
      const { results } = await searchObservations( params, optsWithAuth );
      return results.map( observation => Observation.mapApiToRealm( observation ) ) || [];
    },
    {
      getNextPageParam: lastPage => last( lastPage )?.id,
      enabled: !!( currentUser )
    }
  );

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
