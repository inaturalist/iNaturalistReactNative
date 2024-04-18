// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchObservationUpdates } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten } from "lodash";
import { reactQueryRetry } from "sharedHelpers/logging";
import { useCurrentUser } from "sharedHooks";

const BASE_PARAMS = {
  observations_by: "owner",
  fields: "all",
  per_page: 30,
  ttl: -1,
  page: 1
};

const useInfiniteNotificationsScroll = ( ): object => {
  const currentUser = useCurrentUser( );

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
      : ( ) => { },
    notifications: flatten( infQueryResult?.data?.pages )
  };
};

export default useInfiniteNotificationsScroll;
