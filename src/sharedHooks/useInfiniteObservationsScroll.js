// @flow

import { searchObservations } from "api/observations";
import { flatten, last, noop } from "lodash";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const useInfiniteObservationsScroll = ( {
  params: newInputParams
}: Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const baseParams = {
    ...newInputParams,
    per_page: 20,
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
        params.id_below = pageParam;
      } else {
        params.page = 1;
      }
      const { results } = await searchObservations( params, optsWithAuth );
      return results || [];
    },
    {
      getNextPageParam: lastPage => last( lastPage )?.id,
      enabled: !!( currentUser )
    }
  );

  const newlyFetchedObservations = useMemo( ( ) => {
    if ( observations?.pages ) {
      return flatten( last( observations.pages ) );
    }
    return null;
  }, [observations?.pages] );

  useEffect( ( ) => {
    if ( newlyFetchedObservations ) {
      Observation.upsertRemoteObservations(
        newlyFetchedObservations,
        realm
      );
    }
  }, [realm, newlyFetchedObservations] );

  const hasLocalObservations = realm?.objects( "Observation" )?.length > 0;

  const infiniteScrollObject = {
    observations: flatten( observations?.pages ),
    status,
    firstObservationsInRealm: hasLocalObservations
  };

  return currentUser
    ? {
      ...infiniteScrollObject,
      isFetchingNextPage,
      fetchNextPage
    }
    : {
      ...infiniteScrollObject,
      isFetchingNextPage: false,
      fetchNextPage: noop
    };
};

export default useInfiniteObservationsScroll;
