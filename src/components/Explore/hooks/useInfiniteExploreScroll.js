// @flow

import { searchObservations } from "api/observations";
import { addSeconds, formatISO, parseISO } from "date-fns";
import { flatten, last } from "lodash";
import { useCallback } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";

const useInfiniteExploreScroll = ( { params: newInputParams, enabled }: Object ): Object => {
  const baseParams = {
    ...newInputParams,
    fields: Observation.EXPLORE_LIST_FIELDS,
    ttl: -1
  };

  const { fields, ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteExploreScroll", "searchObservations", queryKeyParams];

  const getNextPageParam = useCallback( lastPage => {
    const lastObs = last( lastPage.results );
    const orderBy = baseParams.order_by;

    if ( !lastObs ) return null;

    if ( ["observed_on", "created_at"].includes( orderBy ) ) {
      const lastObsDate = orderBy === "observed_on"
        ? lastObs?.time_observed_at
        : lastObs?.created_at;

      if ( !lastObsDate ) {
        return null;
      }

      const lastObsDateParsed = parseISO( lastObsDate );
      const newObsDate = addSeconds( lastObsDateParsed, baseParams.order === "asc"
        ? 1
        : -1 );
      return formatISO( newObsDate );
    }

    return lastObs?.id;
  }, [baseParams.order_by, baseParams.order] );

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
        if ( params.order_by === "observed_on" ) {
          if ( baseParams.order === "asc" ) {
            params.d1 = pageParam;
          } else {
            params.d2 = pageParam;
          }
        } else if ( params.order_by === "created_at" ) {
          if ( baseParams.order === "asc" ) {
            params.created_d1 = pageParam;
          } else {
            params.created_d2 = pageParam;
          }
        } else {
          // $FlowIgnore
          params.id_below = pageParam;
        }
      } else {
        // $FlowIgnore
        params.page = 1;
        // For the first page and only for the first page, get the bounds as
        // well
        params.return_bounds = true;
      }
      const response = await searchObservations( params, optsWithAuth );
      return response;
    },
    {
      getNextPageParam,
      enabled
    }
  );

  const observations = flatten( data?.pages?.map( r => r.results ) ) || [];
  let totalResults = data?.pages?.[0].total_results;
  if ( totalResults !== 0 && !totalResults ) {
    totalResults = null;
  }

  return {
    isFetchingNextPage,
    fetchNextPage,
    observations: flatten( observations ),
    queryKey,
    status,
    totalBounds: data?.pages?.[0].total_bounds,
    totalResults
  };
};

export default useInfiniteExploreScroll;
