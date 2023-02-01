// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import useIsConnected from "sharedHooks/useIsConnected";
import colors from "styles/tailwindColors";

import UserIcon from "./UserIcon";

type Props = {
  user: any
};

const InlineUser = ( { user }: Props ): Node => {
  const navigation = useNavigation();
  const isOnline = useIsConnected( );
  const userImgUri = User.uri( user );
  const userHandle = User.userHandle( user );

  const renderUserIcon = () => {
    if ( !isOnline ) {
      return (
        <IconMaterial
          testID="InlineUser.NoInternetPicture"
          name="wifi-off"
          size={22}
          color={colors.logInGray}
        />
      );
    }
    if ( !userImgUri ) {
      return (
        <IconMaterial
          testID="InlineUser.FallbackPicture"
          name="person"
          size={22}
          color={colors.logInGray}
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
      accessibilityLabel={t( "User" )}
      accessibilityValue={{ text: userHandle }}
      accessibilityHint={t( "Navigates-to-user-profile" )}
      onPress={() => {
        navigation.navigate( "UserProfile", { userId: user.id } );
      }}
    >
      <View className="mr-[7px]">{renderUserIcon()}</View>
      <Text>{userHandle}</Text>
    </Pressable>
  );
};

export default InlineUser;
