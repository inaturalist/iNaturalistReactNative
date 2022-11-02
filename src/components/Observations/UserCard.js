// @flow

import { useNavigation } from "@react-navigation/native";
import { fetchRemoteUser } from "api/users";
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable, Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/tailwindColors";

const UserCard = ( ): Node => {
  const user = useCurrentUser( );
  const userId = user?.id;

  const {
    data: remoteUser
  } = useAuthenticatedQuery(
    ["fetchRemoteUser", userId],
    optsWithAuth => fetchRemoteUser( userId, { }, optsWithAuth )
  );

  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  if ( !user ) { return <View className="flex-row mx-5 items-center" />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: user.id } );

  const productionIcon = remoteUser?.icon_url.replace( "staticdev", "static" );
  const icon = {
    uri: productionIcon
  };

  return (
    <View className="flex-row mx-5 items-center">
      {remoteUser && <UserIcon uri={icon} />}
      <View className="ml-3">
        <Text className="color-white my-1">{User.userHandle( user )}</Text>
        {remoteUser && (
          <Text className="color-white my-1">
            {`${remoteUser?.observations_count} Observations`}
          </Text>
        )}
      </View>
      <Pressable
        onPress={navToUserProfile}
        className="absolute right-0"
      >
        <IconMaterial name="edit" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
};

export default UserCard;
