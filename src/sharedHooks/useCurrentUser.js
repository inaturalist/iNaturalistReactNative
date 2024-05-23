// @flow

import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): ?Object => {
  const realm = useRealm( );
  const currentUserIsValid = User.currentUser( realm )?.isValid( );
  return useMemo( ( ) => {
    if ( currentUserIsValid ) {
      return User.currentUser( realm );
    }
    return null;
  }, [
    currentUserIsValid,
    realm
  ] );
};

export default useCurrentUser;
