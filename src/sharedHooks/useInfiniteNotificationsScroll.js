// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchObservationUpdates } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten } from "lodash";
import { reactQueryRetry } from "sharedHelpers/logging";
import { useCurrentUser } from "sharedHooks";

const useInfiniteNotificationsScroll = ( ): Object => {
  const currentUser = useCurrentUser( );

  // Request params for fetching unviewed updates
  const baseParams = {
    observations_by: "owner",
    viewed: true,
    fields: "all",
    per_page: 5,
    ttl: -1
  };

  const queryKey = ["useInfiniteNotificationsScroll", "fetchNotifications"];

  const {
    data: notifications,
    isFetchingNextPage,
    fetchNextPage,
    dataCanBeFetched,
    status,
    refetch
  } = useInfiniteQuery( {
    // eslint-disable-next-line
    queryKey,
    keepPreviousData: false,
    queryFn: async ( { pageParam } ) => {
      const apiToken = await getJWT( );
      const options = {
        api_token: apiToken
      };

      if ( pageParam ) {
        // $FlowIgnore
        baseParams.page = pageParam;
      } else {
        // $FlowIgnore
        baseParams.page = 0;
      }

      const response = await fetchObservationUpdates( baseParams, options );

      return response;
    },
    getNextPageParam: ( lastPage, allPages ) => ( lastPage.length > 0
      ? allPages.length + 1
      : undefined ),
    enabled: true,
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
      beforeRetry: ( ) => console.log( "error", error )
    } )
  } );

  return currentUser
    && {
      isFetchingNextPage,
      fetchNextPage,
      dataCanBeFetched,
      notifications: flatten( notifications?.pages ),
      status,
      refetch
    };
};

export default useInfiniteNotificationsScroll;
