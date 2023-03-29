// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten, last, noop } from "lodash";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import useCurrentUser from "sharedHooks/useCurrentUser";

const { useRealm } = RealmContext;

const useInfiniteScroll = ( ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const baseParams = {
    user_id: currentUser?.id,
    per_page: 50,
    fields: Observation.FIELDS
  };

  const {
    data: observations,
    isLoading,
    fetchNextPage
  } = useInfiniteQuery( {
    queryKey: ["searchObservations", baseParams],
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

      return searchObservations( params, options );
    },
    getNextPageParam: lastPage => last( lastPage )?.id,
    enabled: !!currentUser
  } );

  useEffect( ( ) => {
    if ( observations?.pages ) {
      Observation.upsertRemoteObservations(
        flatten( last( observations.pages ) ),
        realm
      );
    }
  }, [realm, observations] );

  return currentUser
    ? {
      isLoading,
      fetchNextPage
    }
    : { isLoading: false, fetchNextPage: noop };
};

export default useInfiniteScroll;
