// @flow

import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): ?Object => {
  const realm = useRealm( );
  const currentUser = User.currentUser( realm );
  const currentUserIsValid = currentUser?.isValid( );
  return useMemo( ( ) => {
    if ( currentUserIsValid ) {
      return currentUser;
    }
    return null;
  }, [
    currentUser,
    currentUserIsValid
  ] );
};

export default useCurrentUser;
