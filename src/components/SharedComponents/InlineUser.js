// @flow

import { Image, Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import colors from "styles/tailwindColors";

type Props = {
  user: any,
};

const InlineUser = ( { user }: Props ): Node => {
  const userImgUri = User.uri( user );
  return (
    <View className="flex flex-row items-center">
      {userImgUri ? (
        <Image
          testID="InlineUser.ProfilePicture"
          className="w-6 h-6 rounded-full mr-1.5"
          accessibilityRole="img"
          source={userImgUri}
        />
      ) : (
        <View className="mr-1.5">
          <IconMaterial
            testID="InlineUser.FallbackPicture"
            name="person"
            role="img"
            size={24}
            color={colors.logInGray}
          />
        </View>
      )}
      <Text>{User.userHandle( user )}</Text>
    </View>
  );
};

export default InlineUser;
