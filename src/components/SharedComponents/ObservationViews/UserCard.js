// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import User from "../../../models/User";
import useCurrentUser from "../../../sharedHooks/useCurrentUser";
import colors from "../../../styles/colors";
import { Pressable, Text, View } from "../../styledComponents";
import useUser from "../../UserProfile/hooks/useUser";
import UserIcon from "../UserIcon";

const UserCard = ( ): Node => {
  const userId = useCurrentUser( );
  const { user } = useUser( userId );
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  if ( !user ) { return <View />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId } );

  return (
    <View className="flex-row mx-5 items-center">
      <UserIcon uri={User.uri( user )} large />
      <View className="ml-2">
        <Text className="color-white my-1">{User.userHandle( user )}</Text>
        <Text className="color-white my-1">{`${user.observations_count} Observations`}</Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        className="absolute right-0"
      >
        <Icon name="pencil" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
};

export default UserCard;
