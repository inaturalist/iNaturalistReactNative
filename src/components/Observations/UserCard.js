// @flow

import React from "react";
import { Text, View, Pressable } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import UserIcon from "../SharedComponents/UserIcon";
import User from "../../models/User";
import { viewStyles } from "../../styles/observations/userCard";

type Props = {
  userId: number,
  user: Object
}

const UserCard = ( { userId, user }: Props ): Node => {
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId } );

  return (
    <View style={viewStyles.userCard}>
      <UserIcon uri={User.uri( user )} large />
      <View style={viewStyles.userDetails}>
        <Text>{User.userHandle( user )}</Text>
        <Text>{`${user.observations_count} Observations`}</Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        style={viewStyles.editProfile}
      >
        <Icon name="pencil" size={30} />
      </Pressable>
    </View>
  );
};

export default UserCard;
