// @flow

import { useNavigation } from "@react-navigation/native";
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable, Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useUserMe from "sharedHooks/useUserMe";
import colors from "styles/tailwindColors";

const UserCard = ( ): Node => {
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );

  // this is needed for the first time a user signs in, when the only realm
  // fields populated are id, login, and signedIn
  const { remoteUser } = useUserMe( );

  if ( !currentUser ) { return <View className="flex-row mx-5 items-center" />; }
  const user = currentUser?.observations_count !== null ? currentUser : remoteUser;

  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: user.id } );

  const uri = User.uri( user );

  return (
    <View className="flex-row px-5 items-center rounded-bl-3xl rounded-br-3xl bg-primary h-24">
      {uri && <UserIcon uri={uri} />}
      <View className="ml-3">
        <Text className="color-white my-1">{User.userHandle( user )}</Text>
        <Text className="color-white my-1">
          { t( "X-Observations", { count: user?.observations_count || 0 } )}
        </Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        className="absolute right-5"
        accessibilityRole="button"
      >
        <IconMaterial name="edit" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
};

export default UserCard;
