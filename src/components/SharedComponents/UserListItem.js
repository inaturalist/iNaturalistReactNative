// @flow
import { useNavigation } from "@react-navigation/native";
import {
  Body1, INatIcon,
  List2, UserIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import User from "realmModels/User.ts";
import { useTranslation } from "sharedHooks";

type Props = {
  item: Object,
  countText: string,
  onPress?: Function,
  accessibilityLabel?: string,
  pressable?: boolean
};

const UserListItem = ( {
  item,
  countText,
  onPress: onPressProp,
  accessibilityLabel: accessibilityLabelProp,
  pressable = true
}: Props ): Node => {
  const { t } = useTranslation( );
  const user = item?.user;
  const navigation = useNavigation( );

  const onPress = useCallback( ( ) => {
    if ( onPressProp ) return onPressProp( );
    return navigation.navigate( "UserProfile", { userId: user?.id } );
  }, [
    navigation,
    onPressProp,
    user?.id
  ] );

  const UserListItemContainer = pressable
    ? ( { children } ) => (
      <Pressable
        accessibilityRole={
          onPressProp
            ? "button"
            : "link"
        }
        className="flex-row items-center mx-3 my-2"
        testID={`UserProfile.${user?.id}`}
        onPress={onPress}
        accessibilityLabel={accessibilityLabelProp || t( "Navigates-to-user-profile" )}
        accessibilityState={{ disabled: false }}
      >
        { children }
      </Pressable>
    )
    : ( { children } ) => (
      <View className="flex-row items-center" testID={`UserProfile.${user?.id}`}>
        { children }
      </View>
    );

  return (
    <UserListItemContainer>
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
          {countText}
        </List2>
      </View>
    </UserListItemContainer>
  );
};

export default UserListItem;
