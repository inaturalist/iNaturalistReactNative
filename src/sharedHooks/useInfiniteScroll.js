// @flow

import { searchObservations } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

const { useRealm } = RealmContext;

const useInfiniteScroll = ( idBelow: ?number ): boolean => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const params = {
    user_id: currentUser?.id,
    per_page: 10,
    fields: Observation.FIELDS
  };

  if ( idBelow ) {
    // $FlowIgnore
    params.id_below = idBelow;
  } else {
    // $FlowIgnore
    params.page = 1;
  }

  const {
    data: observations,
    isLoading
  } = useAuthenticatedQuery(
    ["searchObservations", idBelow],
    optsWithAuth => searchObservations( params, optsWithAuth ),
    {
      enabled: !!currentUser
    }
  );

  useEffect( ( ) => {
    Observation.upsertRemoteObservations( observations, realm );
  }, [realm, observations] );

  return currentUser ? isLoading : false;
};

export default useInfiniteScroll;
