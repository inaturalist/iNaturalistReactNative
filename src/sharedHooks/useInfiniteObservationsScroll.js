// @flow

import { searchObservations } from "api/observations";
import { flatten, last, noop } from "lodash";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useMemo, useRef
} from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const useInfiniteObservationsScroll = ( {
  params: newInputParams
}: Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const lastObservationIdRef = useRef( null );

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

      let idToUse = pageParam;
      if ( lastObservationIdRef.current !== null ) {
        idToUse = lastObservationIdRef.current;
        // reset last observation ID
        lastObservationIdRef.current = null;
      }

      if ( idToUse ) {
        params.id_below = idToUse;
      } else {
        params.page = 1;
      }

      const response = await searchObservations( params, optsWithAuth );
      return response;
    },
    {
      getNextPageParam: lastPage => last( lastPage.results )?.id,
      enabled: !!( currentUser ),
      // wait for user to scroll, since we're already using syncRemoteObservations
      // to fetch 50 observations on mount
      refetchOnMount: false
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

  const fetchFromLastObservation = useCallback( async lastObservationId => {
    lastObservationIdRef.current = lastObservationId;

    await fetchNextPage( );
  }, [fetchNextPage] );

  const infiniteScrollObject = {
    observations: flatten( data?.pages?.map( page => page.results ) ),
    status,
    firstObservationsInRealm: hasLocalObservations,
    totalResults: data?.pages?.[0]?.total_results,
    fetchFromLastObservation
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
