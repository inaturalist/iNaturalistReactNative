// @flow

import { useQueryClient } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { addSeconds, formatISO, parseISO } from "date-fns";
import { flatten, last } from "lodash";
import { useCallback } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";

const useInfiniteExploreScroll = ( { params: newInputParams, enabled }: Object ): Object => {
  const queryClient = useQueryClient( );

  const fields = {
    ...Observation.EXPLORE_LIST_FIELDS,
    user: { // included here for "exclude by current user" in explore filters
      id: true,
      uuid: true,
      login: true
    }
  };
  const baseParams = {
    ...newInputParams,
    fields,
    ttl: -1
  };

  const excludedUser = newInputParams.excludeUser;

  const queryKey = ["useInfiniteExploreScroll", newInputParams];

  // Pagination using our API is complicated. The page param will only work
  // for the first 10k results. Frequently-updated result sets (like the
  // default), can potentially show duplicate observations on subsequent
  // pages using the page param as well. To avoid both of those issues, we're
  // paginating results using the id_below / id_above or d1 / d2 params when
  // possible, i.e. when sorting by date created or date observed. Other
  // sorts must use the page param and suffer the limitations described
  // above.
  const getNextPageParam = useCallback( lastPage => {
    const lastObs = last( lastPage.results );
    const orderBy = baseParams.order_by;

    // Returning null tells useInfiniteQuery there is no next page, so the
    // query method should not even run. If there are no observations in the
    // results, we're done and can stop requesting new pages.
    if ( !lastObs ) return null;

    // Datetime sorts need to use d1 / d2 or created_d1 / created_d2 to
    // paginate results, so were storing a datetime from the last observation
    // as the "page" and we'll use that to adjust the query when we perform
    // it
    if ( ["observed_on", "created_at"].includes( orderBy ) ) {
      const lastObsDate = orderBy === "observed_on"
        ? lastObs?.time_observed_at
        : lastObs?.created_at;

      // If there are results but the last one doesn't have a datetime, we're
      // also done... but this is probably impossible.
      if ( !lastObsDate ) {
        return null;
      }

      const lastObsDateParsed = parseISO( lastObsDate );
      // Adding / subtracting a second helps us not include this last
      // observation on the next page of results
      const newObsDate = addSeconds( lastObsDateParsed, baseParams.order === "asc"
        ? 1
        : -1 );
      return formatISO( newObsDate );
    }

    // Any sort that isn't observed_on or created_at and isn't the default
    // (blank, meaning created_at) should use basic pagination.
    if ( typeof ( orderBy ) === "string" ) {
      return lastPage.page + 1;
    }

    // If we got here that means orderBy is undefined or null, i.e. the
    // default sort order by id
    return lastObs?.id;
  }, [baseParams.order_by, baseParams.order] );

  const {
    data,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    isRefetching,
    status
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( { pageParam }, optsWithAuth ) => {
      const params = { ...baseParams };

      // For the purposes of Explore, an undefined page or a page of 0 is the
      // default state before any data has loaded, so those values mean we're
      // requesting the first page
      const requestingFirstPage = typeof ( pageParam ) === "undefined" || pageParam === 0;
      if ( requestingFirstPage ) {
        // For the first page and only for the first page, we need to retrieve
        // the georaphic bounds of the results so we can pan and zoom the map
        // to contain them
        params.return_bounds = true;
      } else if ( params.order_by === "observed_on" ) {
        // If we're ordering by date observed, we are "paginating" by date and
        // getNextPageParam will have set the pageParam to a date string from
        // the last obs in the previous page
        if ( baseParams.order === "asc" ) {
          params.d1 = pageParam;
        } else {
          params.d2 = pageParam;
        }
      } else if ( params.order_by === "created_at" ) {
        // If we're ordering by date created, we are "paginating" by date and
        // getNextPageParam will have set the pageParam to a date string from
        // the last obs in the previous page
        if ( baseParams.order === "asc" ) {
          params.created_d1 = pageParam;
        } else {
          params.created_d2 = pageParam;
        }
      } else if ( typeof ( params.order_by ) === "string" ) {
        // If this is any kind of sort other than the date sorts and isn't the
        // default (blank), assume basic pagination using the page param
        params.page = pageParam;
      } else {
        // If we're using default sort order by id, getNextPageParam will have
        // set pageParam to a serial id
        params.id_below = pageParam;
      }
      return searchObservations( params, optsWithAuth );
    },
    {
      getNextPageParam,
      enabled
    }
  );

  const handlePullToRefresh = async ( ) => {
    queryClient.removeQueries( { queryKey } );
    await refetch( );
  };

  let observations = flatten( data?.pages?.map( r => r.results ) ) || [];
  let totalResults = data?.pages?.[0].total_results;
  let filtered = [];

  // filter out obs from excluded user and adjust count
  if ( excludedUser && observations ) {
    filtered = observations.filter( observation => observation?.user.id !== excludedUser.id );
    observations = filtered;
  }

  if ( totalResults !== 0 && !totalResults ) {
    totalResults = null;
  }

  return {
    fetchNextPage,
    isLoading,
    isFetchingNextPage: isFetchingNextPage || isRefetching,
    handlePullToRefresh,
    observations,
    status,
    totalBounds: data?.pages?.[0].total_bounds,
    totalResults
  };
};

export default useInfiniteExploreScroll;
