// @flow

import { useNavigation } from "@react-navigation/native";
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable, Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/tailwindColors";

const UserCard = ( ): Node => {
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );
  if ( !currentUser ) { return <View className="flex-row mx-5 items-center" />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: currentUser.id } );

  const uri = User.uri( currentUser );

  return (
    <View className="flex-row mx-5 items-center">
      {uri && <UserIcon uri={uri} />}
      <View className="ml-3">
        <Text className="color-white my-1">{User.userHandle( currentUser )}</Text>
        <Text className="color-white my-1">
          { t( "X-Observations", { count: currentUser.observations_count || 0 } )}
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
