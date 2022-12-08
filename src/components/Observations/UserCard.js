// @flow

import { useNavigation } from "@react-navigation/native";
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable, Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import colors from "styles/tailwindColors";

type Props = {
  currentUser: ?Object
}

const UserCard = ( { currentUser }: Props ): Node => {
  const navigation = useNavigation( );
  if ( !currentUser ) { return <View className="flex-row mx-5 items-center" />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: currentUser?.id } );

  const uri = User.uri( currentUser );

  return (
    <View className="flex-row mx-5 items-center">
      {uri && <UserIcon uri={uri} />}
      <View className="ml-3">
        <Text className="color-white my-1">{User.userHandle( currentUser )}</Text>
        <Text className="color-white my-1">
          { t( "X-Observations", { count: currentUser?.observations_count || 0 } )}
        </Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        className="absolute right-0"
        accessibilityRole="button"
      >
        <IconMaterial name="edit" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
};

export default UserCard;
