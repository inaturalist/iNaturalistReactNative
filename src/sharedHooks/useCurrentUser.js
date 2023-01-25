// @flow

import { RealmContext } from "providers/contexts";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): ?Object => {
  const realm = useRealm( );
  return User.currentUser( realm );
};

export default useCurrentUser;
