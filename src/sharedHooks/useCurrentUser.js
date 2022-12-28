// @flow

import { RealmContext } from "providers/contexts";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): ?Object => {
  const realm = useRealm( );
  return realm.objects( "User" ).filtered( "signedIn == true" )[0];
};

export default useCurrentUser;
