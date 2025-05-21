// @flow

import { searchObservations } from "api/observations";
import { flatten, last, noop } from "lodash";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import {
  useAuthenticatedInfiniteQuery,
  useCurrentUser
} from "sharedHooks";

const { useRealm } = RealmContext;

const useInfiniteObservationsScroll = ( {
  params: newInputParams
}: Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const baseParams = {
    ...newInputParams,
    per_page: 20,
    fields: Observation.ADVANCED_MODE_LIST_FIELDS,
    ttl: -1
  };

  const { fields, ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteObservationsScroll", "searchObservations", queryKeyParams];

  const {
    data,
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
      const response = await searchObservations( params, optsWithAuth );
      return response;
    },
    {
      getNextPageParam: lastPage => last( lastPage.results )?.id,
      enabled: !!( currentUser )
    }
  );

  const newlyFetchedObservations = useMemo( ( ) => {
    if ( data?.pages ) {
      return flatten( last( data.pages )?.results );
    }
    return null;
  }, [data?.pages] );

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
    observations: flatten( data?.pages?.map( page => page.results ) ),
    status,
    firstObservationsInRealm: hasLocalObservations,
    totalResults: data?.pages?.[0]?.total_results
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
