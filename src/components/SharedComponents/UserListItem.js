// @flow
import { useNavigation } from "@react-navigation/native";
import {
  Body1, INatIcon,
  List2, UserIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import User from "realmModels/User";
import { useTranslation } from "sharedHooks";

type Props = {
  item: Object,
  count: number,
  countText: string
};

const UserListItem = ( { item, count, countText }: Props ): Node => {
  const { t } = useTranslation( );
  const user = item?.user;
  const navigation = useNavigation( );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center mx-3 my-2"
      testID={`UserProfile.${user?.id}`}
      onPress={( ) => navigation.navigate( "UserProfile", { userId: user?.id } )}
      accessibilityLabel={t( "Navigates-to-user-profile" )}
    >

      {user?.icon_url
        ? <UserIcon uri={User.uri( user )} medium />
        : (
          <INatIcon
            name="person"
            size={62}
          />
        )}
      <View className="ml-3">
        {user?.login && <Body1 className="mt-3">{user?.login}</Body1>}
        <List2 className="mt-1">
          {t( countText, { count } )}
        </List2>
      </View>
    </Pressable>
  );
};

export default UserListItem;
