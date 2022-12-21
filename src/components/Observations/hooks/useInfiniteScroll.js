// @flow

import { searchObservations } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useLoggedIn from "sharedHooks/useLoggedIn";

const { useRealm } = RealmContext;

const useInfiniteScroll = ( idBelow: ?number ): boolean => {
  const isLoggedIn = useLoggedIn( );
  const realm = useRealm( );
  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0];

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
    {},
    {
      enabled: !!isLoggedIn
    }
  );

  useEffect( ( ) => {
    Observation.upsertRemoteObservations( observations, realm );
  }, [realm, observations] );

  return isLoading;
};

export default useInfiniteScroll;
