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

const useInfiniteObservationsScroll = ( { upsert, params: newInputParams }: Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const baseParams = {
    ...newInputParams,
    per_page: 50,
    fields: Observation.FIELDS,
    ttl: -1
  };

  const {
    data: observations,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery( {
    // eslint-disable-next-line
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
      observations: flatten( observations?.pages )
    }
    : {
      isFetchingNextPage: false,
      fetchNextPage: noop,
      observations: flatten( observations?.pages )
    };
};

export default useInfiniteObservationsScroll;
