// @flow

import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import useIsConnected from "sharedHooks/useIsConnected";
import colors from "styles/tailwindColors";

type Props = {
  user: any,
  onPress: Function
};

const InlineUser = ( { user, onPress }: Props ): Node => {
  const isOnline = useIsConnected( );
  const userImgUri = User.uri( user );
  const userHandle = User.userHandle( user );
  return (
    <Pressable
      className="flex flex-row items-center"
      accessibilityRole="link"
      onPress={onPress}
    >
      {userImgUri && isOnline ? (
        <Image
          testID="InlineUser.ProfilePicture"
          className="w-[22px] h-[22px] rounded-full mr-[7px]"
          source={userImgUri}
        />
      ) : (
        <View className="mr-[7px]">
          <IconMaterial
            testID="InlineUser.FallbackPicture"
            name="person"
            size={22}
            color={colors.logInGray}
          />
        </View>
      )}
      <Text>{userHandle}</Text>
    </Pressable>
  );
};

export default InlineUser;
