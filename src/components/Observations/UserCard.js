// @flow

import React from "react";
import { Text, View, Pressable } from "react-native";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";

import UserIcon from "../SharedComponents/UserIcon";
import { useUser } from "../UserProfile/hooks/useUser";
import User from "../../models/User";
import { viewStyles } from "../../styles/observations/userCard";

type Props = {
  userId: number
}

const UserCard = ( { userId }: Props ): Node => {
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  const { user } = useUser( userId );
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId } );

  if ( !user ) { return null; }

  return (
    <View style={viewStyles.userCard}>
      <UserIcon uri={User.uri( user )} large />
      <View style={viewStyles.userDetails}>
        <Text>{User.userHandle( user )}</Text>
        <Text>{`${user.observations_count} Observations`}</Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
      >
        <Text>edit profile</Text>
      </Pressable>
    </View>
  );
};

export default UserCard;
