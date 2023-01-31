// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import useIsConnected from "sharedHooks/useIsConnected";
import colors from "styles/tailwindColors";

type Props = {
  user: any
};

const InlineUser = ( { user }: Props ): Node => {
  const navigation = useNavigation();
  const isOnline = useIsConnected( );
  const userImgUri = User.uri( user );
  const userHandle = User.userHandle( user );
  return (
    <Pressable
      testID="InlineUser"
      className="flex flex-row items-center"
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-user-profile" )}
      accessibilityValue={{ text: userHandle }}
      onPress={() => {
        navigation.navigate( "UserProfile", { userId: user.id } );
      }}
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
