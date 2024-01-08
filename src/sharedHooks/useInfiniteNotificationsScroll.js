// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchObservationUpdates } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten, last } from "lodash";
import { reactQueryRetry } from "sharedHelpers/logging";
import { useCurrentUser } from "sharedHooks";

const useInfiniteNotificationsScroll = ( { params: newInputParams }: Object ): Object => {
  const currentUser = useCurrentUser( );

  // Request params for fetching unviewed updates
  const baseParams = {
    ...newInputParams,
    observations_by: "owner",
    viewed: true,
    fields: "all",
    per_page: 10
  };

  // const queryKey = ["fetchNotifications"];
  const queryKey = ["useInfiniteNotificationsScroll", "fetchNotifications"];

  const {
    data,
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
    getNextPageParam: lastPage => last( lastPage )?.id,
    enabled: true,
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
      beforeRetry: ( ) => console.log( "error", error )
    } )
  } );

  return currentUser
    && {
      isFetchingNextPage,
      fetchNextPage,
      data: flatten( data.pages ),
      status
    };
};

export default useInfiniteNotificationsScroll;
