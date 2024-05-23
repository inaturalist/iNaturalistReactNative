// @flow

import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): ?Object => {
  const realm = useRealm( );
  // TODO there has to be a better way. useMemo isn't doing anything here
  // because currentUser changes every time User.currentUser() gets called,
  // resulting in a lot of unnecessary renders and effects getting
  // triggered... but if you actually memoize the value, you end up
  // with "Accessing object which has been invalidated or deleted" errors
  const currentUser = User.currentUser( realm );
  return useMemo( ( ) => {
    if ( currentUser?.isValid( ) ) {
      return currentUser;
    }
    return null;
  }, [
    currentUser
  ] );
};

export default useCurrentUser;
