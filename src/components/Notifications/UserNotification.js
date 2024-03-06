// @flow
import {
  Body1, UserIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import User from "realmModels/User";

const { useRealm } = RealmContext;

  type Props = {
    item: Object
  };

const UserNotificationListItem = ( { item }: Props ): Node => {
  const realm = useRealm( );
  const user = item?.user;

  if ( !user ) { return null; }
  return (
    <View
      className="flex-row items-center mx-3 my-2"
      testID={`UserProfile.${user.id}`}
    >

      <UserIcon uri={User.uri( user, realm )} medium />
      <View className="ml-3">
        <Body1 className="mt-3">{user.login}</Body1>
      </View>
    </View>
  );
};

export default UserNotificationListItem;
