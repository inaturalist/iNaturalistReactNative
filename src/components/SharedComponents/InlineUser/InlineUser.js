// @flow

import { useNavigation } from "@react-navigation/native";
// Directly imported, not from index.js to avoid circular dependency
import INatIcon from "components/SharedComponents/INatIcon/INatIcon";
// Directly imported, not from index.js to avoid circular dependency
import Body3 from "components/SharedComponents/Typography/Body3";
// Directly imported, not from index.js to avoid circular dependency
import UserIcon from "components/SharedComponents/UserIcon/UserIcon";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import User from "realmModels/User";
import useIsConnected from "sharedHooks/useIsConnected";

type Props = {
  user: any
};

const InlineUser = ( { user }: Props ): Node => {
  const navigation = useNavigation();
  const isOnline = useIsConnected( );
  const userImgUri = User.uri( user );
  const userHandle = User.userHandle( user );

  const { t } = useTranslation( );

  const renderUserIcon = () => {
    if ( !isOnline ) {
      return (
        <INatIcon
          testID="InlineUser.NoInternetPicture"
          name="wifi-off"
          size={22}
        />
      );
    }
    if ( !userImgUri ) {
      return (
        <INatIcon
          testID="InlineUser.FallbackPicture"
          name="person"
          size={22}
        />
      );
    }
    return <UserIcon uri={userImgUri} small />;
  };

  return (
    <Pressable
      testID="InlineUser"
      className="flex flex-row items-center"
      accessibilityRole="link"
      accessibilityLabel={t( "User", { userHandle } )}
      accessibilityHint={t( "Navigates-to-user-profile" )}
      onPress={() => {
        navigation.navigate( "UserProfile", { userId: user.id } );
      }}
    >
      <View className="mr-[7px]">{renderUserIcon()}</View>
      <Body3>{userHandle}</Body3>
    </Pressable>
  );
};

export default InlineUser;
