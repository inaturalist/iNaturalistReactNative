import {
  Body1,
  INatIcon,
  List2,
  UserIcon,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import User from "realmModels/User";
import { useTranslation } from "sharedHooks";

interface Props {
  item: object;
  countText: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onPress?: Function;
  accessibilityLabel?: string;
  pressable?: boolean;
}

const UserListItem = ( {
  item,
  countText,
  onPress,
  accessibilityLabel: accessibilityLabelProp,
  pressable = true,
}: Props ) => {
  const { t } = useTranslation( );
  const user = item?.user;

  const UserListItemContainer = pressable
    ? ( { children } ) => (
      <Pressable
        accessibilityRole={
          onPress
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
      <View className="flex-row items-center w-5/6">
        {user?.icon_url
          ? <UserIcon uri={User.uri( user )} medium />
          : (
            <INatIcon
              name="person"
              size={62}
            />
          )}
        <View className="ml-3 shrink">
          {user?.login && (
            <Body1
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.login}
            </Body1>
          )}
          <List2 className="mt-1" maxFontSizeMultiplier={1.5}>
            {countText}
          </List2>
        </View>
      </View>
    </UserListItemContainer>
  );
};

export default UserListItem;
